'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Set NEXT_PUBLIC_GOATCOUNTER_URL to your endpoint, e.g.
// https://YOURCODE.goatcounter.com/count — leave unset to disable analytics.
const ENDPOINT = process.env.NEXT_PUBLIC_GOATCOUNTER_URL;

declare global {
  interface Window {
    goatcounter?: { count?: (opts: { path: string }) => void };
  }
}

/**
 * Privacy-friendly, cookieless analytics. count.js records the initial page
 * load; this component additionally records App Router client-side navigations,
 * which the vanilla snippet does not see.
 */
export default function Analytics() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (!ENDPOINT) return;
    // The first load is already counted by count.js on load — skip it here to
    // avoid double-counting, then count every subsequent route change.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.goatcounter?.count?.({ path: pathname });
  }, [pathname]);

  if (!ENDPOINT) return null;

  return (
    <Script
      data-goatcounter={ENDPOINT}
      src="//gc.zgo.at/count.js"
      strategy="afterInteractive"
    />
  );
}
