// routes/_authed.tsx
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

import { AppLayout } from '@/components/layouts/app-layout';
import type { RouterContext } from '@/types/router';

export const Route = createFileRoute('/_authed')({
    validateSearch: z.object({
        redirect: z.string().optional(),
    }).optional(),
    beforeLoad: ({ context, location }) => {
        const { auth } = context as RouterContext;

        if (!auth.isAuthenticated) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.pathname,
                },
            });
        }
    },
    component: () => (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ),
});
