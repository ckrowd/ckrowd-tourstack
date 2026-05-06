import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/workforce',
  '/crew',
  '/tours',
];

function isProtectedPath(pathname: string): boolean {
  const localePattern = routing.locales.join('|');
  const stripped = pathname.replace(new RegExp(`^\\/(${localePattern})(\\/|$)`), '/');
  const normalized = stripped || '/';
  return PROTECTED_PATHS.some(
    (p) => normalized === p || normalized.startsWith(p + '/')
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Run next-intl middleware first so locale redirects are handled before auth
  const intlResponse = intlMiddleware(request);

  // Pass through locale redirects (e.g. / -> /en/)
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedPath(pathname)) {
    const sessionToken = request.cookies.get('better-auth.session_token');
    if (!sessionToken?.value) {
      const localeMatch = pathname.match(/^\/(en|fr)/);
      const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
