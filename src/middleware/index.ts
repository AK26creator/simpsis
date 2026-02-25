import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;
    const pathname = url.pathname;

    // Check for stored user in cookies or localStorage simulation
    const storedUser = cookies.get('synopgen_user')?.value;
    let user = null;

    if (storedUser) {
        try {
            user = JSON.parse(storedUser);
        } catch (e) {
            // Invalid cookie, clear it
            cookies.delete('synopgen_user');
        }
    }

    // Public routes
    const publicRoutes = ['/login', '/'];
    if (publicRoutes.includes(pathname)) {
        return next();
    }

    // Protected admin routes
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return redirect('/login');
        }
        if (!user.is_admin && user.role !== 'Admin') {
            return redirect('/app');
        }
    }

    // Protected employee routes
    if (pathname.startsWith('/app')) {
        if (!user) {
            return redirect('/login');
        }
    }

    return next();
});
