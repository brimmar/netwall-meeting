import { createFileRoute } from '@tanstack/react-router'

import { api } from '@/lib/axios'
import BookingsPage from '@/pages/bookings'
import type { BookingsResponse } from '@/types/common'

export const Route = createFileRoute('/_authed/bookings/')({
    // @ts-expect-error context type mismatch
    loader: async ({ context: { queryClient } }) =>
        queryClient.ensureQueryData({
            queryKey: ['bookings'],
            queryFn: async () => {
                const { data } = await api.get<BookingsResponse>('/bookings')
                return data.data
            },
        }),
    component: BookingsPage,
})
