import { createFileRoute } from '@tanstack/react-router'

import { api } from '@/lib/axios'
import RoomsPage from '@/pages/rooms'
import type { RoomsResponse } from '@/types/common'

export const Route = createFileRoute('/_authed/rooms/')({
    // @ts-expect-error context type mismatch
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData({
            queryKey: ['rooms'],
            queryFn: async () => {
                const { data } = await api.get<RoomsResponse>('/rooms')
                return data.data
            },
        }),
    component: RoomsPage,
})
