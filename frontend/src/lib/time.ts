import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { Booking, TimeBlock, TimeBlockType } from "@/types/common";

dayjs.extend(utc);
dayjs.extend(timezone);

const localTimezone = dayjs.tz.guess();

export const utcToLocal = (utcString: string): dayjs.Dayjs => {
	return dayjs.utc(utcString).tz(localTimezone);
};

export const localToUtc = (localDate: dayjs.Dayjs): string => {
	return localDate.tz(localTimezone).utc().format("YYYY-MM-DD HH:mm:ss");
};

export const generateTimeBlocks = ({
	days = 5,
	hoursPerDay = 10,
	startHour = 8,
	bookings = [],
	originalStartTime,
	originalEndTime,
	excludeBookingId,
}: {
	days?: number;
	hoursPerDay?: number;
	startHour?: number;
	bookings: Booking[];
	originalStartTime?: string;
	originalEndTime?: string;
	excludeBookingId?: number;
}): Array<{
	date: dayjs.Dayjs;
	blocks: TimeBlock[];
}> => {
	const now = dayjs().tz(localTimezone);
	const blocks = [];

	const originalStart = originalStartTime
		? utcToLocal(originalStartTime)
		: undefined;
	const originalEnd = originalEndTime ? utcToLocal(originalEndTime) : undefined;

	const relevantBookings = bookings
		.filter(
			(res) =>
				res &&
				dayjs.utc(res.end_time).isAfter(now) &&
				(!excludeBookingId || res.id !== excludeBookingId),
		)
		.map((res) => ({
			...res,
			start_time: utcToLocal(res.start_time).format(),
			end_time: utcToLocal(res.end_time).format(),
		}));

	for (let day = 0; day < days; day++) {
		const currentDate = now.add(day, "day").startOf("day");
		const dayBlocks: TimeBlock[] = [];

		for (let hour = 0; hour < hoursPerDay; hour++) {
			const blockStart = currentDate.add(startHour + hour, "hour");
			const blockEnd = blockStart.add(1, "hour");
			const isPast = blockStart.isBefore(now);

			const isOriginalTime =
				originalStart && originalEnd
					? blockStart.isSameOrAfter(originalStart, "hour") &&
						blockStart.isBefore(originalEnd, "hour")
					: undefined;

			const overlappingBooking = relevantBookings.find((booking) => {
				const resStart = dayjs(booking.start_time);
				const resEnd = dayjs(booking.end_time);
				return resStart.isBefore(blockEnd) && resEnd.isAfter(blockStart);
			});

			let type: TimeBlockType = "empty";
			if (isPast) {
				type = "past";
			} else if (overlappingBooking) {
				type = overlappingBooking.status as TimeBlockType;
			}

			dayBlocks.push({
				hour: startHour + hour,
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
};
