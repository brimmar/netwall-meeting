export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const createTitle = (title?: string): string => {
	if (!title) return APP_NAME;
	return `${title} - ${APP_NAME}`;
};
