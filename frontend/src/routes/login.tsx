// routes/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

import { GuestLayout } from '@/components/layouts/guest-layout';
import { LoginPage } from '@/pages/login';
import type { RouterContext } from '@/types/router';

export const Route = createFileRoute('/login')({
    validateSearch: z.object({
        redirect: z.string().optional().catch(''),
    }),
    beforeLoad: ({ context, search }) => {
        const { auth } = context as RouterContext;

        if (auth.isAuthenticated) {
            throw redirect({
                to: search.redirect || '/'
            });
        }
    },
    component: () => (
        <GuestLayout>
            <LoginPage />
        </GuestLayout>
    ),
});
