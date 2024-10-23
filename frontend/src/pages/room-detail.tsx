import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CalendarRange, Clock, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import PageTitle from "@/components/layouts/page-title";
import BookingModal from "@/components/ui/booking-modal";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { CreateBookingRequest, DayBlocks, Room, TimeBlock, TimeBlockType, RoomDetailResponse } from "@/types/common";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

const DAYS_TO_SHOW = 5;
const HOURS_PER_DAY = 10;
const START_HOUR = 8;

const localTimezone = dayjs.tz.guess();

interface BookingResponse {
    data: {
        id: number;
        responsible_name: string;
        start_time: string;
        end_time: string;
        status: "scheduled" | "cancelled";
        room: Room;
    };
}

const utcToLocal = (utcString: string): dayjs.Dayjs => {
    return dayjs.utc(utcString).tz(localTimezone);
};

const localToUtc = (localDate: dayjs.Dayjs): string => {
    return localDate.tz(localTimezone).utc().format("YYYY-MM-DD HH:mm:ss");
};

export default function RoomDetailPage(): ReactNode {
    const { roomId } = useParams({ from: "/_authed/rooms/$roomId" });
    const queryClient = useQueryClient();


    const [selectedStartBlock, setSelectedStartBlock] = useState<TimeBlock | null>(
        null
    );
    const [selectedEndBlock, setSelectedEndBlock] = useState<TimeBlock | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: room, isLoading, error } = useQuery({
        queryKey: ["rooms", roomId],
        queryFn: async () => {
            const { data } = await api.get<RoomDetailResponse>(`/rooms/${roomId}`);
            return data.data;
        },
    });

    const createBookingMutation = useMutation({
        mutationFn: async (data: CreateBookingRequest) => {
            const { data: responseData } = await api.post<BookingResponse>(
                "/bookings",
                data
            );
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rooms", roomId] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            setIsModalOpen(false);
            resetSelection();
        },
        onError: (error) => {
            console.error("Falha ao criar reserva:", error);
        },
    });

    const timeBlocks = useMemo(() => {
        if (!room) return [];

        const now = dayjs().tz(localTimezone);
        const blocks: DayBlocks[] = [];

        const relevantBookings = room.bookings
            .filter((res) => dayjs.utc(res.end_time).isAfter(now))
            .map((res) => ({
                ...res,
                start_time: utcToLocal(res.start_time).format(),
                end_time: utcToLocal(res.end_time).format(),
            }));

        for (let day = 0; day < DAYS_TO_SHOW; day++) {
            const currentDate = now.add(day, "day").startOf("day");
            const dayBlocks: TimeBlock[] = [];

            for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
                const blockStart = currentDate.add(START_HOUR + hour, "hour");
                const blockEnd = blockStart.add(1, "hour");
                const isPast = blockStart.isBefore(now);

                const overlappingBooking = relevantBookings.find(
                    (booking) => {
                        const resStart = dayjs(booking.start_time);
                        const resEnd = dayjs(booking.end_time);
                        return (
                            resStart.isBefore(blockEnd) &&
                            resEnd.isAfter(blockStart)
                        );
                    }
                );

                let type: TimeBlockType = "empty";
                if (isPast) {
                    type = "past";
                } else if (overlappingBooking) {
                    type = overlappingBooking.status as TimeBlockType;
                }

                dayBlocks.push({
                    hour: START_HOUR + hour,
                    date: blockStart,
                    isPast,
                    booking: overlappingBooking,
                    type,
                });
            }

            blocks.push({
                date: currentDate,
                blocks: dayBlocks,
            });
        }

        return blocks;
    }, [room]);

    const handleBlockClick = (block: TimeBlock): void => {
        if (block.isPast || block.type === "scheduled") return;

        if (selectedStartBlock?.date.isSame(block.date)) {
            setSelectedStartBlock(null);
            setSelectedEndBlock(null);
            return;
        }

        if (selectedEndBlock?.date.isSame(block.date)) {
            setSelectedEndBlock(null);
            return;
        }

        if (!selectedStartBlock) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        if (block.date.isBefore(selectedStartBlock.date)) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        if (block.date.diff(selectedStartBlock.date, "day") > 0) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        if (block.hour <= selectedStartBlock.hour) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        const hasBookingsBetween = timeBlocks
            .flatMap((day) => day.blocks)
            .some((timeBlock) => {
                if (timeBlock.type !== "scheduled") return false;
                const isInRange =
                    timeBlock.date.isAfter(selectedStartBlock.date) &&
                    timeBlock.date.isBefore(block.date);
                return isInRange;
            });

        if (hasBookingsBetween) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        setSelectedEndBlock(block);
    };

    const isBlockInRange = (block: TimeBlock): boolean => {
        if (!selectedStartBlock || !selectedEndBlock) return false;
        return (
            block.date.isAfter(selectedStartBlock.date) &&
            block.date.isBefore(selectedEndBlock.date)
        );
    };

    const resetSelection = (): void => {
        setSelectedStartBlock(null);
        setSelectedEndBlock(null);
    };

    const { user } = useAuth();

    const handleBookingSubmit = (formData: {
        isForSelf: boolean;
        responsibleName: string;
    }): void => {
        if (!selectedStartBlock || !selectedEndBlock || !room || !user) return;

        const bookingData: CreateBookingRequest = {
            room_id: parseInt(roomId),
            responsible_name: formData.responsibleName,
            start_time: localToUtc(selectedStartBlock.date),
            end_time: localToUtc(selectedEndBlock.date.add(1, "hour")),
        };

        createBookingMutation.mutate(bookingData);
    };

    const getBlockStyles = (
        block: TimeBlock,
        isSelected: boolean,
        isInRange: boolean
    ): string => {
        if (block.isPast) {
            return "bg-muted/50 cursor-not-allowed opacity-50";
        }

        if (block.type === "scheduled" || block.type === "in_progress") {
            return "bg-red-500/30 cursor-not-allowed";
        }

        if (isSelected) {
            return "bg-blue-500/70 hover:bg-blue-500/80";
        }

        if (isInRange) {
            return "bg-blue-500/40 hover:bg-blue-500/50";
        }

        return "bg-secondary/50 hover:bg-secondary/60 cursor-pointer";
    };

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

    if (error || !room) {
        return (
            <>
                <PageTitle title="Erro" />
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    Falha ao carregar a sala: {error?.message ?? "Sala não encontrada"}
                </div>
            </>
        );
    }

    return (
        <>
            <PageTitle title={room.name} />
            <div className="space-y-8 pb-24 lg:pb-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <SectionHeader
                        title={room.name}
                        description={`Sala com capacidade para ${room.capacity} pessoas`}
                    />
                    {selectedStartBlock && selectedEndBlock && (
                        <div className="hidden lg:block">
                            <Button onClick={() => setIsModalOpen(true)}>
                                <CalendarRange className="mr-2 h-4 w-4" />
                                Reservar horário selecionado
                            </Button>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border bg-card">
                    <div className="border-b p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">
                                    Agenda da Sala
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Horários disponíveis: {START_HOUR}:00 -{" "}
                                    {START_HOUR + HOURS_PER_DAY}:00{" "}
                                    ({localTimezone})
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-sm bg-red-500/30" />
                                    <span className="text-sm">Reservada</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-sm bg-secondary/50" />
                                    <span className="text-sm">Disponível</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block lg:hidden">
                        <div className="divide-y">
                            {timeBlocks.map((day) => (
                                <div
                                    key={day.date.format("YYYY-MM-DD")}
                                    className="p-4"
                                >
                                    <h4 className="mb-3 font-medium">
                                        {day.date.format("dddd, MMMM D")}
                                    </h4>
                                    <div className="grid grid-cols-5 gap-1">
                                        {day.blocks.map((block) => {
                                            const isStartSelected =
                                                selectedStartBlock?.date.isSame(
                                                    block.date,
                                                    "hour"
                                                ) ?? false;
                                            const isEndSelected =
                                                selectedEndBlock?.date.isSame(
                                                    block.date,
                                                    "hour"
                                                ) ?? false;
                                            const isInRange =
                                                isBlockInRange(block);

                                            return (
                                                <button
                                                    key={block.hour}
                                                    className={cn(
                                                        "group relative h-12 rounded-sm transition-colors",
                                                        getBlockStyles(
                                                            block,
                                                            isStartSelected ||
                                                            isEndSelected,
                                                            isInRange
                                                        )
                                                    )}
                                                    onClick={() =>
                                                        handleBlockClick(block)
                                                    }
                                                    disabled={
                                                        block.isPast ||
                                                        block.type === "scheduled"
                                                    }
                                                >
                                                    <span className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 text-xs text-muted-foreground group-hover:block">
                                                        {block.hour}:00
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="relative">
                            <div className="overflow-x-auto">
                                <div className="min-w-[800px]">
                                    <div className="p-4 sm:p-6">
                                        <div className="space-y-3">
                                            {timeBlocks.map((day) => (
                                                <div
                                                    key={day.date.format('YYYY-MM-DD')}
                                                    className="group flex items-center gap-4"
                                                >
                                                    <div className="sticky left-4 sm:left-6 z-10 w-28 bg-card py-1 text-sm font-medium">
                                                        {day.date.format('ddd, MMM D')}
                                                    </div>
                                                    <div className="flex flex-1 gap-px">
                                                        {day.blocks.map((block, idx) => {
                                                            const isStartSelected = selectedStartBlock
                                                                ? selectedStartBlock.date.isSame(block.date, "hour")
                                                                : false;
                                                            const isEndSelected = selectedEndBlock
                                                                ? selectedEndBlock.date.isSame(block.date, "hour")
                                                                : false;
                                                            const isInRange = isBlockInRange(block);

                                                            const getBlockTitle = (): string => {
                                                                const timeStr = `${block.hour}:00 - ${block.hour + 1}:00`;
                                                                if (block.booking) {
                                                                    if ('responsible_name' in block.booking && block.booking.responsible_name) {
                                                                        return `${timeStr}\nReservado em nome de ${block.booking.responsible_name}`;
                                                                    }
                                                                    return `${timeStr}\nReservado`;
                                                                }
                                                                if (block.isPast) {
                                                                    return `${timeStr}\nPassado`;
                                                                }
                                                                return `${timeStr}\nDisponível`;
                                                            };

                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    className={cn(
                                                                        "flex-1 h-12 rounded-sm transition-colors",
                                                                        getBlockStyles(
                                                                            block,
                                                                            isStartSelected || isEndSelected,
                                                                            isInRange
                                                                        )
                                                                    )}
                                                                    onClick={() => handleBlockClick(block)}
                                                                    disabled={block.isPast || block.type === "scheduled"}
                                                                    title={getBlockTitle()}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="relative mt-2 flex">
                                            <div className="sticky left-4 sm:left-6 z-10 w-28 bg-card" />
                                            <div className="relative flex-1">
                                                <span className="absolute left-0 text-xs text-muted-foreground">
                                                    {START_HOUR}:00
                                                </span>
                                                <span className="absolute right-0 text-xs text-muted-foreground">
                                                    {START_HOUR + HOURS_PER_DAY}:00
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4 sm:p-6">
                    <h3 className="mb-4 font-semibold">Informações da Sala</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 shrink-0" />
                            <span>Capacidade para {room.capacity} pessoas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>Horário de funcionamento: {START_HOUR}:00 - {START_HOUR + HOURS_PER_DAY}:00</span>
                        </div>
                    </div>
                </div>
            </div>

            {selectedStartBlock && selectedEndBlock && (
                <div className="fixed bottom-0 left-0 right-0 flex lg:hidden">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 rounded-none h-16 text-lg"
                    >
                        <CalendarRange className="mr-2 h-5 w-5" />
                        Reservar horário selecionado
                    </Button>
                </div>
            )}

            {selectedStartBlock && selectedEndBlock && (
                <BookingModal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        resetSelection();
                    }}
                    onSubmit={handleBookingSubmit}
                    startTime={selectedStartBlock.date.toDate()}
                    endTime={selectedEndBlock.date.add(1, "hour").toDate()}
                    isLoading={createBookingMutation.isPending}
                    error={createBookingMutation.error}
                />
            )}
        </>
    );
}
