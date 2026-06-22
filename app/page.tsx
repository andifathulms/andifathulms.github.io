import { redirect } from 'next/navigation';

// Root redirect — sends / → /en for static export (GitHub Pages, etc.)
export default function RootPage() {
  redirect('/en');
}
