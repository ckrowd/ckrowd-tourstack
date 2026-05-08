import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Auth gating is NOT done here — cookie presence does not mean the user is
// logged in. Real session validation happens in the [locale] layout via
// getSession(), which calls the backend on every protected request.
//
// We only inject x-pathname so the layout server component can know which
// route is being accessed without needing client-side routing state.
export async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // Pass locale redirects through as-is (e.g. / → /en/)
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Forward pathname as a request header so layout server components can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Preserve any locale cookie next-intl may have set
  const setCookie = intlResponse.headers.get('set-cookie');
  if (setCookie) response.headers.set('set-cookie', setCookie);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
