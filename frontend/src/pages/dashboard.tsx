// src/pages/dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import PageTitle from "@/components/layouts/page-title";
import { BookingCard } from "@/components/ui/booking-card";
import { Button } from "@/components/ui/button";
import { RoomCard } from "@/components/ui/room-card";
import { SectionHeader } from "@/components/ui/section-header";
import { api } from "@/lib/axios";
import type { BookingsResponse, RoomsResponse } from "@/types/common";

export default function DashboardPage(): ReactNode {
    const roomsQuery = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const { data } = await api.get<RoomsResponse>('/rooms');
            return data.data;
        },
    });

    const bookingsQuery = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const { data } = await api.get<BookingsResponse>('/bookings');
            return data.data;
        },
    });

    if (roomsQuery.isLoading || bookingsQuery.isLoading) {
        return (
            <>
                <PageTitle title="Carregando" />
                <div className="flex h-[200px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </>
        );
    }

    if (roomsQuery.isError || bookingsQuery.isError) {
        return (
            <>
                <PageTitle title="Erro" />
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    Erro ao carregar dados do dashboard
                </div>
            </>
        );
    }

    return (
        <>
            <PageTitle title="Dashboard" />
            <div className="space-y-8">
                <section>
                    <SectionHeader
                        title="Salas"
                        description="Visão geral das salas de reunião"
                        action={
                            <Link
                                to="/rooms"
                                className="inline-block"
                            >
                                <Button variant="ghost">
                                    Todas as salas
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        }
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {roomsQuery.data?.slice(0, 3).map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <SectionHeader
                        title="Reservas"
                        description="Visão geral das suas reservas"
                        action={
                            <Link
                                to="/bookings"
                                className="inline-block"
                            >
                                <Button variant="ghost">
                                    Todas as reservas
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        }
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {bookingsQuery.data?.slice(0, 3).map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
