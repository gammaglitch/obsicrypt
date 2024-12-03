export function matchGlob(pattern: string, path: string): boolean {
	const regexStr = pattern
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*\*/g, '\0')
		.replace(/\*/g, '[^/]*')
		.replace(/\0/g, '.*');

	return new RegExp(`^${regexStr}$`).test(path);
}
