import { format } from 'date-fns';

export function formatDate(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

export function today(): string {
	return formatDate(new Date());
}
