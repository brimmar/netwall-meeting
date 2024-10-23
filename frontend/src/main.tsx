import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import { useAuthStore } from '@/hooks/use-auth';
import { queryClient } from '@/lib/query-client';
import type { RouterContext } from '@/types/router';
import './index.css';

import { routeTree } from './routeTree.gen';

const router = createRouter({
    routeTree,
    context: {
        auth: {
            get isAuthenticated() {
                return !!useAuthStore.getState().token;
            },
        },
        queryClient,
    } satisfies RouterContext,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </HelmetProvider>,
    );
}
