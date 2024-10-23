// src/routes/__root.tsx
import { Outlet, createRootRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

import type { RouterContext } from '@/types/router';

export const Route = createRootRoute({
    validateSearch: z.object({
        redirect: z.string().optional(),
    }).optional(),
    beforeLoad: ({ context, location, search }) => {
        const isPublicRoute = location.pathname === '/login';
        const isAuthenticated = (context as RouterContext).auth.isAuthenticated;

        if (!isAuthenticated && !isPublicRoute) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.pathname,
                },
            });
        }

        if (isAuthenticated && isPublicRoute) {
            throw redirect({
                to: search?.redirect || '/',
            });
        }
    },
    component: () => <Outlet />,
});
