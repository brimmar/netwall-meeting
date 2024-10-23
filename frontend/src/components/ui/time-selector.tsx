import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CalendarRange } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Booking, TimeBlock, TimeBlockType } from "@/types/common";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const DAYS_TO_SHOW = 5;
const HOURS_PER_DAY = 10;
const START_HOUR = 8;

const localTimezone = dayjs.tz.guess();

interface TimeSelectorProps {
    bookings: Booking[];
    selectedStartBlock: TimeBlock | null;
    selectedEndBlock: TimeBlock | null;
    originalStartTime?: string;
    originalEndTime?: string;
    onBlockClick: (block: TimeBlock) => void;
    onConfirm: () => void;
    excludeBookingId?: number;
}

const utcToLocal = (utcString: string): dayjs.Dayjs => {
    return dayjs.utc(utcString).tz(localTimezone);
};

export function TimeSelector({
    bookings = [],
    selectedStartBlock,
    selectedEndBlock,
    originalStartTime,
    originalEndTime,
    onBlockClick,
    onConfirm,
    excludeBookingId,
}: TimeSelectorProps): ReactNode {
    const timeBlocks = useMemo(() => {
        const now = dayjs().tz(localTimezone);
        const blocks = [];

        const originalStart = originalStartTime ? utcToLocal(originalStartTime) : null;
        const originalEnd = originalEndTime ? utcToLocal(originalEndTime) : null;

        const relevantBookings = bookings
            .filter((res) =>
                res &&
                dayjs.utc(res.end_time).isAfter(now) &&
                res.id !== excludeBookingId
            )
            .map((res) => ({
                ...res,
                start_time: utcToLocal(res.start_time).format(),
                end_time: utcToLocal(res.end_time).format(),
            }));

        for (let day = 0; day < DAYS_TO_SHOW; day++) {
            const currentDate = now.add(day, "day").startOf("day");
            const dayBlocks = [];

            for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
                const blockStart = currentDate.add(START_HOUR + hour, "hour");
                const blockEnd = blockStart.add(1, "hour");
                const isPast = blockStart.isBefore(now);

                const isOriginalTime: boolean = Boolean(
                    originalStart &&
                    originalEnd &&
                    blockStart.isSameOrAfter(originalStart, 'hour') &&
                    blockStart.isBefore(originalEnd, 'hour')
                );

                const overlappingBooking = relevantBookings.find(
                    (booking) => {
                        const resStart = dayjs(booking.start_time);
                        const resEnd = dayjs(booking.end_time);
                        return resStart.isBefore(blockEnd) && resEnd.isAfter(blockStart);
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
                    isOriginalTime,
                });
            }

            blocks.push({
                date: currentDate,
                blocks: dayBlocks,
            });
        }

        return blocks;
    }, [bookings, originalStartTime, originalEndTime, excludeBookingId]);

    const isBlockInRange = (block: TimeBlock): boolean => {
        if (!selectedStartBlock || !selectedEndBlock) return false;
        return (
            block.date.isAfter(selectedStartBlock.date) &&
            block.date.isBefore(selectedEndBlock.date)
        );
    };

    const getBlockStyles = (
        block: TimeBlock,
        isSelected: boolean,
        isInRange: boolean
    ): string => {
        if (block.isPast) {
            return "bg-muted/50 cursor-not-allowed opacity-50";
        }

        if (block.type === "scheduled") {
            return "bg-primary/30 cursor-not-allowed";
        }

        if (block.type === "cancelled") {
            return "bg-destructive/30 cursor-not-allowed";
        }

        if (block.isOriginalTime) {
            return "bg-orange-500/30 hover:bg-orange-500/40 cursor-pointer";
        }

        if (isSelected) {
            return "bg-primary/70 hover:bg-primary/80";
        }

        if (isInRange) {
            return "bg-primary/40 hover:bg-primary/50";
        }

        return "bg-secondary/50 hover:bg-secondary/60 cursor-pointer";
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Horário de funcionamento: {START_HOUR}:00 - {START_HOUR + HOURS_PER_DAY}:00 ({localTimezone})
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-primary/30" />
                        <span className="text-xs">Reservada</span>
                    </div>
                    {originalStartTime && (
                        <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-sm bg-orange-500/30" />
                            <span className="text-xs">Horário atual</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-secondary/50" />
                        <span className="text-xs">Disponível</span>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="relative">
                    <div className="overflow-x-auto">
                        <div className="p-2">
                            <div className="space-y-1">
                                {timeBlocks.map((day) => (
                                    <div
                                        key={day.date.format('YYYY-MM-DD')}
                                        className="group flex items-center gap-2"
                                    >
                                        <div className="sticky left-2 z-10 w-16 bg-card py-1 text-xs font-medium">
                                            {day.date.format('ddd, D')}
                                        </div>
                                        <div className="flex flex-1 gap-px">
                                            {day.blocks.map((block, idx) => {
                                                const isStartSelected =
                                                    selectedStartBlock?.date.isSame(block.date, "hour") ?? false;
                                                const isEndSelected =
                                                    selectedEndBlock?.date.isSame(block.date, "hour") ?? false;
                                                const isInRange = isBlockInRange(block);

                                                return (
                                                    <button
                                                        key={idx}
                                                        className={cn(
                                                            "flex-1 h-6 rounded-sm transition-colors",
                                                            getBlockStyles(
                                                                block,
                                                                isStartSelected || isEndSelected,
                                                                isInRange
                                                            )
                                                        )}
                                                        onClick={() => onBlockClick(block)}
                                                        disabled={block.isPast || block.type === "scheduled"}
                                                        title={`${block.hour}:00 - ${block.hour + 1}:00`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="relative mt-1 flex">
                                <div className="sticky left-2 z-10 w-16 bg-card" />
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
                </div>
            </div>

            {selectedStartBlock && selectedEndBlock && (
                <div className="flex justify-end pt-2">
                    <Button
                        size="sm"
                        onClick={onConfirm}
                    >
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Confirmar horário
                    </Button>
                </div>
            )}
        </div>
    );
}
