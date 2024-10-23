import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import PageTitle from "@/components/layouts/page-title";
import { RoomCard } from "@/components/ui/room-card";
import { SectionHeader } from "@/components/ui/section-header";
import { api } from "@/lib/axios";
import type { RoomsResponse } from "@/types/common";

export default function RoomsPage(): ReactNode {
    const { data, isLoading, error } = useQuery({
        queryKey: ["rooms"],
        queryFn: async () => {
            const { data } = await api.get<RoomsResponse>("/rooms");
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
                    Falha ao carregar salas: {error.message}
                </div>
            </>
        );
    }

    return (
        <>
            <PageTitle title="Salas" />
            <div className="space-y-8">
                <SectionHeader
                    title="Salas de Reunião"
                    description="Veja e reserve salas de reunião disponíveis"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data?.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
