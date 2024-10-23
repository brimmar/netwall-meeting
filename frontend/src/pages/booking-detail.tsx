import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Building2, Calendar, Clock, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import PageTitle from "@/components/layouts/page-title";
import BookingActions from "@/components/ui/booking-actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { TimeSelector } from "@/components/ui/time-selector";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { BookingDetailResponse, TimeBlock, UpdateBookingRequest, RoomDetailResponse } from "@/types/common";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const DAYS_TO_SHOW = 5;
const HOURS_PER_DAY = 10;
const START_HOUR = 8;

const localTimezone = dayjs.tz.guess();

const utcToLocal = (utcString: string): dayjs.Dayjs => {
    return dayjs.utc(utcString).tz(localTimezone);
};

const localToUtc = (localDate: dayjs.Dayjs): string => {
    return localDate.tz(localTimezone).utc().format("YYYY-MM-DD HH:mm:ss");
};

export default function BookingDetailPage(): ReactNode {
    const { bookingId } = useParams({ from: '/_authed/bookings/$bookingId' });
    const queryClient = useQueryClient();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [selectedStartBlock, setSelectedStartBlock] = useState<TimeBlock | null>(null);
    const [selectedEndBlock, setSelectedEndBlock] = useState<TimeBlock | null>(null);

    const { data: booking, isLoading: isLoadingBooking, error: bookingError } = useQuery({
        queryKey: ["bookings", bookingId],
        queryFn: async () => {
            const { data } = await api.get<BookingDetailResponse>(
                `/bookings/${bookingId}`
            );
            return data.data;
        },
    });

    const { data: roomData, isLoading: isLoadingRoom } = useQuery({
        queryKey: ["rooms", booking?.room?.id],
        queryFn: async () => {
            if (!booking?.room?.id) throw new Error("ID da Sala não especificada");
            const { data } = await api.get<RoomDetailResponse>(
                `/rooms/${booking.room.id}`
            );
            return data.data;
        },
        enabled: !!booking?.room?.id,
    });

    const isLoading = isLoadingBooking || isLoadingRoom;

    const updateBookingMutation = useMutation({
        mutationFn: async (data: UpdateBookingRequest) => {
            await api.put(`/bookings/${bookingId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            setIsEditModalOpen(false);
            setIsTimeEditModalOpen(false);
            setIsCancelModalOpen(false);
            setSelectedStartBlock(null);
            setSelectedEndBlock(null);
        },
    });

    const handleBlockClick = (block: TimeBlock): void => {
        if (!roomData?.bookings) return;
        if (block.isPast || block.type === "scheduled") return;

        if (selectedStartBlock?.date.isSame(block.date, 'hour')) {
            setSelectedStartBlock(null);
            setSelectedEndBlock(null);
            return;
        }

        if (selectedEndBlock?.date.isSame(block.date, 'hour')) {
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

        if (block.date.diff(selectedStartBlock.date, 'day') > 0) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        if (block.hour <= selectedStartBlock.hour) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        const hasBookingsBetween = roomData.bookings
            .filter(res => res.id !== parseInt(bookingId))
            .some(res => {
                const resStart = utcToLocal(res.start_time);
                const resEnd = utcToLocal(res.end_time);
                return (
                    (resStart.isAfter(selectedStartBlock.date) && resStart.isBefore(block.date)) ||
                    (resEnd.isAfter(selectedStartBlock.date) && resEnd.isBefore(block.date))
                );
            });

        if (hasBookingsBetween) {
            setSelectedStartBlock(block);
            setSelectedEndBlock(null);
            return;
        }

        setSelectedEndBlock(block);
    };

    const getAvailabilityBlocks = (): Array<{
        date: dayjs.Dayjs;
        blocks: Array<{
            hour: number;
            type: string;
        }>;
    }> => {
        if (!booking || !roomData?.bookings) return [];

        const now = dayjs().tz(localTimezone);
        const blocks = [];

        for (let day = 0; day < DAYS_TO_SHOW; day++) {
            const currentDate = now.add(day, "day").startOf("day");
            const dayBlocks = [];

            for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
                const blockStart = currentDate.add(START_HOUR + hour, "hour");
                const blockEnd = blockStart.add(1, "hour");
                const isPast = blockStart.isBefore(now);

                const isCurrentBooking = blockStart.isSameOrAfter(utcToLocal(booking.start_time), 'hour') &&
                    blockStart.isBefore(utcToLocal(booking.end_time), 'hour');

                const overlappingBooking = roomData.bookings.find((res) => {
                    if (res.id === parseInt(bookingId)) return false;
                    const resStart = utcToLocal(res.start_time);
                    const resEnd = utcToLocal(res.end_time);
                    return resStart.isBefore(blockEnd) && resEnd.isAfter(blockStart);
                });

                let type = "empty";
                if (isPast) {
                    type = "past";
                } else if (isCurrentBooking) {
                    type = "current";
                } else if (overlappingBooking) {
                    type = overlappingBooking.status;
                }

                dayBlocks.push({
                    hour: START_HOUR + hour,
                    type,
                });
            }

            blocks.push({
                date: currentDate,
                blocks: dayBlocks,
            });
        }

        return blocks;
    };

    const getBlockStyles = (type: string): string => {
        switch (type) {
            case "current":
                return "bg-blue-900/30";
            case "scheduled":
                return "bg-red-500/30";
            case "cancelled":
                return "bg-destructive/30";
            case "past":
                return "bg-muted/50";
            default:
                return "bg-secondary/50";
        }
    };

    const handleEditSubmit = async (): Promise<void> => {
        if (!editedName.trim()) return;

        await updateBookingMutation.mutateAsync({
            responsible_name: editedName,
        });
    };

    const handleTimeEditSubmit = async (): Promise<void> => {
        if (!selectedStartBlock || !selectedEndBlock) return;

        await updateBookingMutation.mutateAsync({
            start_time: localToUtc(selectedStartBlock.date),
            end_time: localToUtc(selectedEndBlock.date.add(1, "hour")),
        });
    };

    const handleCancelBooking = async (): Promise<void> => {
        await updateBookingMutation.mutateAsync({
            status: "cancelled",
        });
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

    if (bookingError || !booking || !roomData) {
        return (
            <>
                <PageTitle title="Erro" />
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    Falha ao carregar os detalhes da reserva: {bookingError?.message ?? "Reserva não encontrada"}
                </div>
            </>
        );
    }

    const now = dayjs().tz(localTimezone);
    const startTime = utcToLocal(booking.start_time);
    const endTime = utcToLocal(booking.end_time);

    const getStatusConfig = (): {
        label: string;
        className: string;
    } => {
        if (booking.status === "cancelled") {
            return {
                label: "Cancelada",
                className: "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400",
            };
        }

        if (now.isBefore(startTime)) {
            return {
                label: "Reservada",
                className: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
            };
        }

        if (now.isAfter(endTime)) {
            return {
                label: "Concluída",
                className: "bg-muted text-muted-foreground",
            };
        }

        return {
            label: "Em Progresso",
            className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
        };
    };

    const canModify = booking.status === "scheduled" && now.isBefore(startTime);
    const status = getStatusConfig();

    return (
        <>
            <PageTitle title={booking?.room?.name} />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Detalhes da Reserva"
                        description={`Reserva em nome de ${booking.room.name}`}
                    />
                    {canModify && (
                        <BookingActions
                            onEdit={() => {
                                setEditedName(booking.responsible_name);
                                setIsEditModalOpen(true);
                            }}
                            onEditTime={() => {
                                setIsTimeEditModalOpen(true);
                            }}
                            onCancel={() => {
                                setIsCancelModalOpen(true);
                            }}
                        />
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6 rounded-lg border bg-card p-6">
                        <div>
                            <h3 className="font-semibold">Status</h3>
                            <div
                                className={cn(
                                    "mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium",
                                    status.className
                                )}
                            >
                                {status.label}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.responsible_name}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.room.name}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {startTime.format("dddd, MMMM D, YYYY")}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {startTime.format("h:mm A")} -{" "}
                                    {endTime.format("h:mm A")} ({localTimezone})
                                </span>
                            </div>
                        </div>
                    </div>

                    {roomData && (
                        <Link
                            to="/rooms/$roomId"
                            params={{ roomId: roomData.id.toString() }}
                            className="block transition-transform hover:-translate-y-1"
                        >
                            <div className="space-y-6 rounded-lg border bg-card p-6">
                                <div>
                                    <h3 className="font-semibold">Disponibilidade da Sala</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Disponibilidade dos próximos {DAYS_TO_SHOW} dias para a {roomData.name}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1">
                                            <div className="h-3 w-3 rounded-sm bg-blue-900/30" />
                                            <span className="text-xs">Reserva Atual</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="h-3 w-3 rounded-sm bg-red-500/30" />
                                            <span className="text-xs">Outras Reservas</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="h-3 w-3 rounded-sm bg-secondary/50" />
                                            <span className="text-xs">Disponível</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        {getAvailabilityBlocks().map((day) => (
                                            <div
                                                key={day.date.format('YYYY-MM-DD')}
                                                className="group flex items-center gap-2"
                                            >
                                                <div className="w-16 text-xs font-medium">
                                                    {day.date.format('ddd, D')}
                                                </div>
                                                <div className="flex flex-1 gap-px">
                                                    {day.blocks.map((block, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "flex-1 h-6 rounded-sm",
                                                                getBlockStyles(block.type)
                                                            )}
                                                            title={`${block.hour}:00 - ${block.hour + 1}:00`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="relative mt-1 flex">
                                        <div className="w-16" />
                                        <div className="relative flex-1">
                                            <span className="absolute left-0 text-[10px] text-muted-foreground">
                                                {START_HOUR}:00
                                            </span>
                                            <span className="absolute right-0 text-[10px] text-muted-foreground">
                                                {START_HOUR + HOURS_PER_DAY}:00
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            < Dialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar reserva</DialogTitle>
                        <DialogDescription>
                            Mudar o responsável por essa reserva.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do responsável</Label>
                            <Input
                                id="name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Insira o nome da pessoa responsável"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleEditSubmit}
                            disabled={updateBookingMutation.isPending}
                        >
                            {updateBookingMutation.isPending
                                ? "Salvando..."
                                : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            <Dialog
                open={isTimeEditModalOpen}
                onOpenChange={(open) => {
                    setIsTimeEditModalOpen(open);
                    if (!open) {
                        setSelectedStartBlock(null);
                        setSelectedEndBlock(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Mudar Horário da Reserva</DialogTitle>
                        <DialogDescription>
                            Selecione um novo horário para a sua reserva.
                            O seu horário atual está em laranja.
                        </DialogDescription>
                    </DialogHeader>

                    <TimeSelector
                        bookings={roomData.bookings}
                        selectedStartBlock={selectedStartBlock}
                        selectedEndBlock={selectedEndBlock}
                        originalStartTime={booking.start_time}
                        originalEndTime={booking.end_time}
                        onBlockClick={handleBlockClick}
                        onConfirm={handleTimeEditSubmit}
                        excludeBookingId={parseInt(bookingId)}
                    />
                </DialogContent>
            </Dialog>

            < Dialog
                open={isCancelModalOpen}
                onOpenChange={setIsCancelModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Reserva</DialogTitle>
                        <DialogDescription>
                            Tem certeza de que quer cancelar essa reserva? Essa ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCancelModalOpen(false)}
                        >
                            Não, manter reserva
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelBooking}
                            disabled={updateBookingMutation.isPending}
                        >
                            {updateBookingMutation.isPending
                                ? "Cancelando..."
                                : "Sim, cancelar reserva"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    );
}
