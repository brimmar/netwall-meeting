import { createFileRoute } from '@tanstack/react-router'

import RoomDetailPage from '@/pages/room-detail'

export const Route = createFileRoute('/_authed/rooms/$roomId')({
  component: RoomDetailPage,
})
