import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { cn, parseApiDateTime } from "@/lib/utils";
import type { BlockType, Booking, BookingStatus, Room } from "@/types/common";

interface BaseBooking {
    start_time: string;
    end_time: string;
}

interface UserBooking extends BaseBooking {
    id: number;
    responsible_name: string;
    status: BookingStatus;
}

interface RoomCardProps {
    room: Room & {
        bookings?: Booking[];
    };
}

const DAYS_TO_SHOW = 5;
const HOURS_PER_DAY = 10;
const START_HOUR = 8;

function isUserBooking(
    booking: BaseBooking | UserBooking
): booking is UserBooking {
    return 'id' in booking && 'responsible_name' in booking;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }: RoomCardProps): ReactNode => {
    const timeBlocks = useMemo(() => {
        const now = dayjs();
        const blocks = [];

        const futureBookings = (room.bookings ?? [])
            .filter(res => dayjs(parseApiDateTime(res.end_time)).isAfter(now))
            .map(res => ({
                ...res,
                start_time: parseApiDateTime(res.start_time),
                end_time: parseApiDateTime(res.end_time),
            }));

        for (let day = 0; day < DAYS_TO_SHOW; day++) {
            const currentDate = now.add(day, 'day').startOf('day');
            const dayBlocks = [];

            for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
                const blockStart = currentDate.add(START_HOUR + hour, 'hour');
                const blockEnd = blockStart.add(1, 'hour');

                const overlappingBooking = futureBookings.find(booking => {
                    const resStart = dayjs(booking.start_time);
                    const resEnd = dayjs(booking.end_time);
                    return (
                        resStart.isBefore(blockEnd) && resEnd.isAfter(blockStart)
                    );
                });

                let blockType: BlockType = 'empty';
                if (overlappingBooking) {
                    if (isUserBooking(overlappingBooking)) {
                        blockType = overlappingBooking.status === 'cancelled'
                            ? 'empty'
                            : 'user';
                    } else {
                        blockType = 'others';
                    }
                }

                dayBlocks.push({
                    hour: START_HOUR + hour,
                    blockType,
                    booking: overlappingBooking,
                });
            }

            blocks.push({
                date: currentDate,
                blocks: dayBlocks,
            });
        }

        return blocks;
    }, [room.bookings]);

    const getBlockStyles = (blockType: BlockType): string => {
        switch (blockType) {
            case 'user':
                return "bg-blue-500/30 group-hover:bg-blue-500/40";
            case 'others':
                return "bg-red-500/50 group-hover:bg-red-500/60";
            default:
                return "bg-primary/5 group-hover:bg-primary/10";
        }
    };

    const getBlockTitle = (block: {
        hour: number;
        blockType: BlockType;
        booking?: BaseBooking | UserBooking;
    }): string => {
        const baseTitle = `${block.hour}:00 - ${block.hour + 1}:00`;

        if (block.booking) {
            if (isUserBooking(block.booking)) {
                return `${baseTitle}\nSua reserva${block.booking.status === 'cancelled' ? ' (cancelada)' : ''}\n${block.booking.responsible_name}`;
            }
            return `${baseTitle}\nReservada`;
        }

        return `${baseTitle}\nDisponível`;
    };

    return (
        <Link
            to="/rooms/$roomId"
            params={{ roomId: room.id.toString() }}
            className="block transition-transform hover:-translate-y-1"
        >
            <div className="group flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold group-hover:text-primary">
                            {room.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Capacidade: {room.capacity} pessoas</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Disponibilidade</h4>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded-sm bg-blue-500/30" />
                                <span>Suas reservas</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded-sm bg-red-500/50" />
                                <span>Reservada</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {timeBlocks.map((day) => (
                            <div
                                key={day.date.format('YYYY-MM-DD')}
                                className="flex items-center gap-2"
                            >
                                <div className="w-16 text-xs text-muted-foreground">
                                    {day.date.format('ddd, D')}
                                </div>
                                <div className="flex flex-1 gap-px">
                                    {day.blocks.map((block, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex-1 h-6 rounded-sm transition-colors",
                                                getBlockStyles(block.blockType)
                                            )}
                                            title={getBlockTitle(block)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>{START_HOUR}:00</span>
                        <span>{START_HOUR + HOURS_PER_DAY}:00</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export { RoomCard };
