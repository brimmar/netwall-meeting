import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import PageTitle from "@/components/layouts/page-title";
import { BookingCard } from "@/components/ui/booking-card";
import { SectionHeader } from "@/components/ui/section-header";
import { api } from "@/lib/axios";
import type { BookingsResponse } from "@/types/common";

export default function BookingsPage(): ReactNode {
    const { data, isLoading, error } = useQuery({
        queryKey: ["bookings"],
        queryFn: async () => {
            const { data } = await api.get<BookingsResponse>("/bookings");
            return data.data;
        },
    });

    if (isLoading) {
        return (
            <>
                <PageTitle title="Carregando" />
                <div className="flex h-[200px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <PageTitle title="Erro" />
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    Falha ao carregar reservas: {error.message}
                </div>
            </>
        );
    }

    const activeBookings = data?.filter(
        (booking) => booking.status === "scheduled"
    );
    const cancelledBookings = data?.filter(
        (booking) => booking.status === "cancelled"
    );

    return (
        <>
            <PageTitle title="Reservas" />
            <div className="space-y-8">
                <SectionHeader
                    title="Suas reservas"
                    description="Gerencie suas reservas das salas"
                />

                <section>
                    <h3 className="text-lg font-semibold mb-4">Reservas ativas</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {activeBookings?.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                            />
                        ))}
                        {activeBookings?.length === 0 && (
                            <p className="text-muted-foreground col-span-full text-center py-8">
                                Nenhuma reserva ativa
                            </p>
                        )}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-4">
                        Reservas canceladas
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {cancelledBookings?.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                            />
                        ))}
                        {cancelledBookings?.length === 0 && (
                            <p className="text-muted-foreground col-span-full text-center py-8">
                                Nenhuma reserva cancelada
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
