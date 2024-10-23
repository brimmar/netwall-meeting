import type { Dayjs } from "dayjs";

export interface Room {
	id: number;
	name: string;
	capacity: number;
	bookings?: Booking[];
}

export interface Booking {
	id: number;
	responsible_name: string;
	start_time: string;
	end_time: string;
	status: BookingStatus;
	room: Room;
}

export interface RoomsResponse {
	data: Room[];
}

export type BookingStatus =
	| "scheduled"
	| "cancelled"
	| "in_progress"
	| "completed";

export interface BaseBooking {
	start_time: string;
	end_time: string;
	status: BookingStatus;
}

export interface UserBooking extends BaseBooking {
	id: number;
	responsible_name: string;
}

export interface BookingWithRoom extends BaseBooking {
	room: Room;
}

export interface BookingWithUser extends UserBooking {
	user: {
		name: string;
		email: string;
	};
}

export interface BlockBooking extends BaseBooking {
	responsible_name?: string;
}

export interface FullBooking extends BookingWithRoom, BookingWithUser {}

export type TimeBlockType =
	| "empty"
	| "scheduled"
	| "cancelled"
	| "past"
	| "in_progress";

export interface TimeBlock {
	hour: number;
	date: Dayjs;
	isPast: boolean;
	booking?: BlockBooking;
	type: TimeBlockType;
	isOriginalTime?: boolean;
}

export interface DayBlocks {
	date: Dayjs;
	blocks: TimeBlock[];
}

export interface CalendarConfig {
	days?: number;
	hoursPerDay?: number;
	startHour?: number;
}

export interface BookingsResponse {
	data: Booking[];
}

export interface RoomDetailResponse {
	data: Room & {
		bookings: BaseBooking[];
	};
}

export interface BookingDetailResponse {
	data: BookingWithRoom & BookingWithUser;
}

export interface CreateBookingRequest {
	room_id: number;
	responsible_name: string;
	start_time: string;
	end_time: string;
}

export interface UpdateBookingRequest {
	responsible_name?: string;
	start_time?: string;
	end_time?: string;
	status?: "cancelled";
}

export interface ApiErrorResponse {
	error?: string;
	message?: string;
	status?: number;
}

export type BlockType = "empty" | "others" | "user" | "user-cancelled";
