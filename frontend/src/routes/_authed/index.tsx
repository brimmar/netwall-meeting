import { createFileRoute } from '@tanstack/react-router';

import { api } from '@/lib/axios';
import DashboardPage from '@/pages/dashboard';
import type { BookingsResponse, RoomsResponse } from '@/types/common';

export const Route = createFileRoute('/_authed/')({
    // @ts-expect-error context type mismatch
    loader: async ({ context: { queryClient } }) =>
        Promise.all([
            queryClient.ensureQueryData({
                queryKey: ['rooms'],
                queryFn: async () => {
                    const { data } = await api.get<RoomsResponse>('/rooms');
                    return data.data;
                },
            }),
            queryClient.ensureQueryData({
                queryKey: ['bookings'],
                queryFn: async () => {
                    const { data } = await api.get<BookingsResponse>('/bookings');
                    return data.data;
                },
            }),
        ]),
    component: DashboardPage,
});
