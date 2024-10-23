import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { ReactNode } from "react";

import type { TimeBlock } from "@/types/common";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

interface Props {
    days?: number;
    hoursPerDay?: number;
    startHour?: number;
    timeBlocks: Array<{
        date: dayjs.Dayjs;
        blocks: TimeBlock[];
    }>;
    onBlockClick?: (block: TimeBlock) => void;
    selectedStartBlock?: TimeBlock | null;
    selectedEndBlock?: TimeBlock | null;
    className?: string;
    showTimeLabels?: boolean;
    interactive?: boolean;
    getBlockStyles: (block: TimeBlock, isSelected: boolean, isInRange: boolean) => string;
}

export default function AvailabilityCalendar({
    timeBlocks,
    onBlockClick,
    selectedStartBlock,
    selectedEndBlock,
    className = "",
    showTimeLabels = true,
    interactive = true,
    getBlockStyles,
    startHour = 8,
    hoursPerDay = 10,
}: Props): ReactNode {
    const isBlockInRange = (block: TimeBlock): boolean => {
        if (!selectedStartBlock || !selectedEndBlock) return false;
        return (
            block.date.isAfter(selectedStartBlock.date) &&
            block.date.isBefore(selectedEndBlock.date)
        );
    };

    return (
        <div className={className}>
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
                                            const isStartSelected: boolean = selectedStartBlock
                                                ? selectedStartBlock.date.isSame(block.date, "hour")
                                                : false;
                                            const isEndSelected: boolean = selectedEndBlock
                                                ? selectedEndBlock.date.isSame(block.date, "hour")
                                                : false;
                                            const isInRange: boolean = isBlockInRange(block);
                                            const blockTitle = `${block.hour}:00 - ${block.hour + 1}:00`;

                                            return interactive ? (
                                                <button
                                                    key={idx}
                                                    className={getBlockStyles(
                                                        block,
                                                        isStartSelected || isEndSelected,
                                                        isInRange
                                                    )}
                                                    onClick={() => onBlockClick?.(block)}
                                                    disabled={block.isPast || block.type === "scheduled"}
                                                    title={blockTitle}
                                                />
                                            ) : (
                                                <div
                                                    key={idx}
                                                    className={getBlockStyles(
                                                        block,
                                                        isStartSelected || isEndSelected,
                                                        isInRange
                                                    )}
                                                    title={blockTitle}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {showTimeLabels && (
                            <div className="relative mt-1 flex">
                                <div className="sticky left-2 z-10 w-16 bg-card" />
                                <div className="relative flex-1">
                                    <span className="absolute left-0 text-[10px] text-muted-foreground">
                                        {startHour}:00
                                    </span>
                                    <span className="absolute right-0 text-[10px] text-muted-foreground">
                                        {startHour + hoursPerDay}:00
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
