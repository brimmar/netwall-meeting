import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { twMerge } from "tailwind-merge";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");
dayjs.extend(utc);
dayjs.extend(timezone);

export const cn = (...inputs: ClassValue[]): string => {
	return twMerge(clsx(inputs));
};

export const formatApiDateTime = (date: Date): string => {
	return dayjs(date).utc().format("YYYY-MM-DD HH:mm:ss");
};

export const parseApiDateTime = (dateStr: string): string => {
	return dayjs.utc(dateStr).local().toDate().toString();
};
