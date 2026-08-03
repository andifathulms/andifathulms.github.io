# Mobile SSO Integration Guide
### Django + Keycloak → Native Mobile App (Flutter / React Native)

> **Context:** Your Django app already has SSO working via `mozilla-django-oidc` (web browser redirect flow). This guide adds mobile support — letting a native app log in with Keycloak credentials and consume your Django REST API.

---

## Status in Edutara v2 — implemented ✅

The generic recipe below is **already live in this repo**. Concrete values:

| Guide placeholder | Edutara |
|---|---|
| `POST /auth/oidc/mobile/` | `POST /api/accounts/sso/oikn/mobile/` |
| `YourOIDCBackend` | `apps.accounts.oidc.OIKNOIDCBackend` |
| `YourTokenObtainPairSerializer` | `_auth_payload()` in `apps/accounts/views.py` (SimpleJWT `RefreshToken.for_user`) |
| `YourUserProfileSerializer` | `_auth_payload()` returns role flags, not a nested user object |
| Config guard | `SSO_OIDC_CONFIGURED` → returns **503** until the realm env vars are set |

Response shape (identical to password login and the web SSO callback):

```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "is_superadmin": false,
  "is_edutara_admin": false,
  "is_institution_member": false
}
```

**Browsable API docs:** `/api/schema/swagger/` (Swagger UI) · `/api/schema/redoc/` (ReDoc) · `/api/schema/` (raw OpenAPI). All three are public — no login needed.

Source: [`views.py` `OIDCMobileView`](backend/apps/accounts/views.py) · [`urls.py`](backend/apps/accounts/urls.py) · tests: [`test_sso_mobile.py`](backend/apps/accounts/tests/test_sso_mobile.py).

Still required before it works against the real realm: **enable Direct Access Grants** on the Keycloak client (Step 3) and set the OIDC env vars on the server.

---

## The Problem

Your Django API uses **SimpleJWT** — tokens signed with its own RS256 private key. Keycloak issues its own JWTs signed with Keycloak's key. These are two completely different tokens.

```
Keycloak access_token  →  signed by Keycloak's key
Django SimpleJWT       →  signed by your app's RS256 private key

DRF's JWTAuthentication only knows your key → Keycloak token = 401 "token_not_valid"
```

The mobile app cannot use a Keycloak token to call your API directly. It needs to exchange it first.

---

## The Solution — One New Endpoint

Add `POST /auth/oidc/mobile/` to your Django backend. The mobile calls this once at login time, sends the Keycloak `id_token`, and receives your app's own SimpleJWT tokens in return.

```
Mobile                      Keycloak                   Django Backend
  │                             │                             │
  │─ POST /token                │                             │
  │  grant_type=password        │                             │
  │  username, password         │                             │
  │  scope=openid               │                             │
  │                             │                             │
  │◄─ { id_token, access_token }│                             │
  │                             │                             │
  │─ POST /auth/oidc/mobile/ ──────────────────────────────► │
  │  { id_token: "eyJ..." }      verify signature (JWKS)     │
  │                              find/create user             │
  │                              issue SimpleJWT              │
  │◄─ { access, refresh, user } ◄──────────────────────────── │
  │                             │                             │
  │─ GET /api/me/ ─────────────────────────────────────────► │
  │  Authorization: Bearer <access>                           │
  │◄─ 200 OK ◄──────────────────────────────────────────────  │
```

---

## Implementation

### Step 1 — Add the view

In `apps/accounts/views.py` (or whichever file holds your auth views), add this class. It reuses the three methods already defined on your custom `OIDCAuthenticationBackend` subclass — no new logic.

```python
class OIDCMobileView(APIView):
    """
    POST /auth/oidc/mobile/

    Body: { id_token: str }

    Accepts a Keycloak id_token from the mobile app (obtained via Direct Access
    Grant: grant_type=password to Keycloak token endpoint with scope=openid).

    Verifies the id_token signature using Keycloak's JWKS, finds or creates the
    user from the claims, and issues your app's own SimpleJWT tokens — same shape
    as your normal POST /auth/login response.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get("id_token")

        if not id_token:
            return Response(
                {"error": "id_token diperlukan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not getattr(settings, "OIDC_RP_CLIENT_ID", ""):
            return Response(
                {"error": "SSO tidak dikonfigurasi di server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        from apps.accounts.oidc import YourOIDCBackend  # adjust import

        backend = YourOIDCBackend()

        # 1. Verify id_token signature against Keycloak's JWKS
        try:
            payload = backend.verify_token(id_token, nonce=None)
        except Exception as exc:
            logger.warning("OIDC mobile: verify_token failed: %s", exc)
            return Response(
                {"error": "Verifikasi token SSO gagal."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not payload:
            return Response(
                {"error": "Token SSO tidak valid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Find or create the user from verified claims
        #
        # IMPORTANT: Do NOT call get_or_create_user(access_token, id_token, payload).
        # That method calls Keycloak's /userinfo endpoint with the access_token,
        # which fails with 401 because the mobile's Keycloak access_token is not
        # forwarded here (or may already be expired).
        #
        # Instead, call the three inner methods directly — they work entirely from
        # the already-verified payload dict, with zero network calls.
        try:
            users = backend.filter_users_by_claims(payload)
            if len(users) == 1:
                user = backend.update_user(users[0], payload)
            elif len(users) > 1:
                return Response(
                    {"error": "Akun duplikat ditemukan. Hubungi administrator."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            else:
                user = backend.create_user(payload)
        except Exception as exc:
            logger.exception("OIDC mobile: user sync failed: %s", exc)
            return Response(
                {"error": f"SSO gagal: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user is None:
            return Response(
                {"error": "Akun tidak ditemukan. Hubungi administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not user.is_active:
            return Response(
                {"error": "Akun tidak aktif. Hubungi administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 3. Issue your app's own SimpleJWT tokens
        refresh = YourTokenObtainPairSerializer.get_token(user)  # adjust

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": YourUserProfileSerializer(user).data,  # adjust
        })
```

**What to adjust per app:**
| Placeholder | Replace with |
|---|---|
| `YourOIDCBackend` | Your `OIDCAuthenticationBackend` subclass |
| `YourTokenObtainPairSerializer` | Your `TokenObtainPairSerializer` subclass (or `RefreshToken`) |
| `YourUserProfileSerializer` | Your user serializer |

---

### Step 2 — Register the URL

In `apps/accounts/urls.py`:

```python
from .views import OIDCMobileView   # add to existing import

urlpatterns = [
    # ... existing routes ...
    path("oidc/mobile/", OIDCMobileView.as_view(), name="auth-oidc-mobile"),
]
```

---

### Step 3 — Enable Direct Access Grants in Keycloak

In Keycloak Admin → your client → Settings:

- **Direct Access Grants Enabled** → **ON**

No other Keycloak change is needed. The existing web SSO client config is untouched.

> **Note:** Direct Access Grant lets the mobile app POST credentials directly to Keycloak's token endpoint without a browser redirect. It's safe for trusted first-party apps (your own mobile app). Do not enable it for third-party clients.

---

## Testing in Postman

### Step 1 — Get the Keycloak id_token

```
POST https://<keycloak-domain>/realms/<realm>/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type    = password
client_id     = <your-client-id>
username      = <user's username / NIP / email>
password      = <user's password>
scope         = openid
```

Copy `id_token` from the response (long `eyJ...` string).

### Step 2 — Exchange for your app's token

```
POST https://<your-api-domain>/api/accounts/sso/oikn/mobile/
Content-Type: application/json
Authorization: (none — leave empty / No Auth)

{
    "id_token": "eyJhbGci..."
}
```

**Expected response:**
```json
{
    "access": "eyJhbGci...",
    "refresh": "eyJhbGci...",
    "is_superadmin": false,
    "is_edutara_admin": false,
    "is_institution_member": false
}
```

### Step 3 — Call your API

```
GET https://<your-api-domain>/api/accounts/profile/
Authorization: Bearer <access from step 2>
```

→ 200 ✓

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 "token_not_valid"` | Mobile is sending Keycloak token directly to the API | Do the exchange first via `/auth/oidc/mobile/` |
| `"SSO gagal: 401 ... /userinfo"` | You called `get_or_create_user()` which hits Keycloak's `/userinfo` endpoint | Use `filter_users_by_claims` / `update_user` / `create_user` directly (see Step 1 note) |
| `400 "Verifikasi token SSO gagal: ..."` | `id_token` is expired or fails JWKS signature check | Get a fresh token from Step 1 immediately before Step 2 |
| `400 {"id_token": ["This field is required."]}` | Wrong field name in request body | Field must be `id_token` exactly |
| `503 "SSO OIKN belum dikonfigurasi."` | OIDC env vars not set on server (`SSO_OIDC_CONFIGURED` is false) | Set `OIDC_RP_CLIENT_ID` + `OIDC_OP_TOKEN_ENDPOINT` in your docker-compose / server environment |
| `403` after valid token | User exists but `is_active=False` | Activate the user in Django admin |

---

## Why NOT `get_or_create_user()`

`mozilla_django_oidc`'s `get_or_create_user(access_token, id_token, payload)` internally calls:

```python
def get_userinfo(self, access_token, id_token, payload):
    response = requests.get(
        OIDC_OP_USER_ENDPOINT,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    response.raise_for_status()   # ← raises 401 if access_token is invalid
    return response.json()
```

In the mobile flow, the Keycloak `access_token` is either:
- Not sent to your Django endpoint (mobile only sends `id_token`)
- Already expired by the time Django calls userinfo
- From a different Keycloak session than the one your server expects

The fix bypasses this entirely. The `id_token` has already been cryptographically verified by `verify_token()` using Keycloak's JWKS. All the claims you need (`email`, `sub`, `name`, roles) are already in `payload`. There is no reason to make a second network call.

```python
# ❌ Don't do this in mobile endpoint
user = backend.get_or_create_user(access_token, id_token, payload)

# ✅ Do this instead
users = backend.filter_users_by_claims(payload)
if len(users) == 1:
    user = backend.update_user(users[0], payload)
elif not users:
    user = backend.create_user(payload)
```

---

## Mobile Code (Flutter — Direct Access Grant)

```dart
// Step 1: POST to Keycloak (no browser needed)
final kcResp = await dio.post(
  '$keycloakBase/realms/$realm/protocol/openid-connect/token',
  data: {
    'grant_type': 'password',
    'client_id': clientId,
    'username': username,
    'password': password,
    'scope': 'openid',
  },
  options: Options(contentType: Headers.formUrlEncodedContentType),
);

// Step 2: Exchange Keycloak id_token for your app's JWT
final dtResp = await dio.post(
  '$apiBase/auth/oidc/mobile/',
  data: {'id_token': kcResp.data['id_token']},
);

// Step 3: Store your app's tokens (NOT the Keycloak tokens)
await storage.write(key: 'access_token', value: dtResp.data['access']);
await storage.write(key: 'refresh_token', value: dtResp.data['refresh']);

// Step 4: All API calls use your app's access token
final me = await dio.get(
  '$apiBase/me/',
  options: Options(headers: {'Authorization': 'Bearer ${dtResp.data["access"]}'}),
);
```

---

## Checklist for Each New App

- [x] Add `OIDCMobileView` to `views.py` — *done in Edutara v2*
- [x] Add `path("sso/oikn/mobile/", ...)` to `urls.py` — *done in Edutara v2*
- [ ] Enable **Direct Access Grants** in Keycloak client settings
- [ ] Confirm OIDC env vars are set on the server (`OIDC_RP_CLIENT_ID`, `OIDC_OP_JWKS_ENDPOINT`, etc.)
- [ ] Test with Postman (3-step flow above)
- [ ] Mobile stores **your app's** `access` + `refresh` tokens, not Keycloak tokens

---

## Status in Aksara (KMS OIKN) — implemented ✅

Aksara differs from the guide's premise: it had **no SimpleJWT** and does **not**
use `mozilla-django-oidc`. The web SPA authenticates with an 8h **session cookie**
(CLAUDE.md §3.1); SimpleJWT was added *only* so native clients have a bearer
token. Sessions remain the browser's mechanism and are unchanged.

| Guide placeholder | Aksara |
|---|---|
| `POST /auth/oidc/mobile/` | `POST /api/auth/oidc/mobile/` |
| `YourOIDCBackend` | `apps.accounts.sso` — `get_sso_client()` → `RealSSOClient` / `MockSSOClient` |
| `backend.verify_token()` | `RealSSOClient._verify_id_token()` (PyJWT + JWKS, already existed) |
| `filter_users_by_claims` / `update_user` / `create_user` | `login_via_sso(profile)` (email-merge + Kontributor auto-assign) |
| `YourTokenObtainPairSerializer` | `_token_payload()` in `apps/accounts/views.py` (`RefreshToken.for_user`) |
| `YourUserProfileSerializer` | `CurrentUserSerializer` — same shape the web login returns |

Response shape (nested `user`, matching Aksara's web login — *not* Edutara's flat flags):

```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "user": { "email": "...", "full_name": "...", "roles": ["KONTRIBUTOR"], "active_role": "KONTRIBUTOR" }
}
```

**Token lifetimes** mirror the session policy (§3.1: 8h, no Remember Me):
access **60 min**, refresh **8 h**. Refresh via `POST /api/auth/token/refresh/`
with `{"refresh": "..."}`. After 8h the mobile user re-authenticates via SSO.

**Why no `/userinfo` call:** the guide's warning applies here too. Aksara's *web*
flow merges `/userinfo` claims on top of the id_token, so any `unit_kerja` /
`jabatan` claim the mobile flow needs **must be mapped onto the ID-token client
scope** in Keycloak — otherwise unit matching degrades on mobile only.

**Dev/testing:** with `SSO_ENABLED=0`, `MockSSOClient.exchange_id_token()` decodes
the id_token **without signature verification** so the flow is testable before the
realm exists. Production (`SSO_ENABLED=1`) always uses JWKS verification.

**API docs:** `/api/docs/` (Swagger) · `/api/redoc/` · `/api/schema/`.
Unlike Edutara these are **not public** — Superadmin-only in production.

Source: [`views.py` `OIDCMobileView`](backend/apps/accounts/views.py) ·
[`sso.py` `exchange_id_token`](backend/apps/accounts/sso.py) ·
[`urls.py`](backend/apps/accounts/urls.py) ·
tests: [`test_sso_mobile.py`](backend/apps/accounts/tests/test_sso_mobile.py)

Still required before it works against the real realm: **enable Direct Access
Grants** on the Keycloak client (Step 3) and set `SSO_ENABLED=1` + the `OIDC_*`
env vars on the server.
