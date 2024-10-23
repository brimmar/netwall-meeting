import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { CalendarCheck2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn, parseApiDateTime } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/common";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

interface BookingCardProps {
    booking: Booking;
}

const formatTimeRange = (start: string, end: string): string => {
    const startDate = dayjs(parseApiDateTime(start));
    const endDate = dayjs(parseApiDateTime(end));

    if (startDate.isSame(endDate, 'day')) {
        return `${startDate.format('MMM D, YYYY')} • ${startDate.format('H:mm')} - ${endDate.format('H:mm')}`;
    }

    return `${startDate.format('MMM D, H:mm')} - ${endDate.format('MMM D, H:mm, YYYY')}`;
};

const getStatusConfig = (status: BookingStatus): {
    containerClass: string;
    badgeClass: string;
    textClass: string;
    mutedTextClass: string;
    label: string;
} => {
    const configs = {
        scheduled: {
            containerClass: "border-primary/20 bg-card hover:border-primary/50",
            badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
            textClass: "text-foreground group-hover:text-primary",
            mutedTextClass: "text-muted-foreground",
            label: "Reservada"
        },
        in_progress: {
            containerClass: "border-primary/20 bg-card hover:border-primary/50",
            badgeClass: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
            textClass: "text-foreground group-hover:text-primary",
            mutedTextClass: "text-muted-foreground",
            label: "Em progresso"
        },
        completed: {
            containerClass: "border-muted/40 bg-muted/10 hover:border-muted",
            badgeClass: "bg-muted text-muted-foreground",
            textClass: "text-muted-foreground",
            mutedTextClass: "text-muted-foreground/60",
            label: "Concluída"
        },
        cancelled: {
            containerClass: "border-destructive/20 bg-destructive/5 hover:border-destructive/40",
            badgeClass: "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400",
            textClass: "text-muted-foreground",
            mutedTextClass: "text-muted-foreground/60",
            label: "Cancelada"
        }
    };

    return configs[status];
};

export const BookingCard = ({ booking }: BookingCardProps): ReactNode => {
    const now = dayjs();
    const startTime = dayjs(parseApiDateTime(booking.start_time));
    const endTime = dayjs(parseApiDateTime(booking.end_time));

    const isUpcoming = startTime.isAfter(now);
    const isInProgress = now.isAfter(startTime) && now.isBefore(endTime);
    const isPast = now.isAfter(endTime);

    let effectiveStatus: BookingStatus = booking.status === "scheduled" ? "scheduled" : "cancelled";
    if (booking.status === "scheduled") {
        if (isInProgress) effectiveStatus = "in_progress";
        else if (isPast) effectiveStatus = "completed";
    }

    const statusConfig = getStatusConfig(effectiveStatus);
    const timeUntil = isUpcoming ? startTime.fromNow() : null;

    return (
        <Link
            to="/bookings/$bookingId"
            params={{ bookingId: booking.id.toString() }}
            className="block transition-transform hover:-translate-y-1"
        >
            <div
                className={cn(
                    "group flex flex-col gap-3 rounded-lg border p-4 shadow-sm transition-colors",
                    statusConfig.containerClass
                )}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className={cn("font-semibold", statusConfig.textClass)}>
                            {booking.room.name}
                        </h3>
                        <p className={cn("text-sm", statusConfig.mutedTextClass)}>
                            {booking.responsible_name}
                        </p>
                    </div>
                    <div
                        className={cn(
                            "flex h-6 items-center rounded-full px-2 text-xs font-medium",
                            statusConfig.badgeClass
                        )}
                    >
                        {statusConfig.label}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div
                        className={cn(
                            "flex items-center gap-1.5 text-sm",
                            statusConfig.mutedTextClass
                        )}
                    >
                        <CalendarCheck2 className="h-4 w-4" />
                        <span>
                            {formatTimeRange(booking.start_time, booking.end_time)}
                        </span>
                    </div>

                    {timeUntil && (
                        <p
                            className={cn(
                                "text-xs pl-5",
                                statusConfig.mutedTextClass
                            )}
                        >
                            Começa {timeUntil}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};
