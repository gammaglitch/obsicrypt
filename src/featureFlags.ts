// Compile-time feature toggles. These are hardcoded for now; a user-facing
// settings toggle can be wired to them later.

export const FEATURES = {
	// Secrets Dashboard (ribbon icon + view listing notes with secrets).
	// Disabled for now.
	dashboard: false,
} as const;
