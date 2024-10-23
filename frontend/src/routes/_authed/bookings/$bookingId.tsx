import { createFileRoute } from '@tanstack/react-router'

import BookingDetailPage from '@/pages/booking-detail'

export const Route = createFileRoute('/_authed/bookings/$bookingId')({
    component: BookingDetailPage,
})
