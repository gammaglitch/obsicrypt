interface Window {
	BillwerkJS: {
		Signup: new () => {};
		Payment: new (
			config: {
				publicApiKey: string;
				providerReturnUrl: string;
			},
			onSuccess: () => void,
			onError: () => void
		) => any;
		finalize: any;
	};
	abtasty: {
		send: (
			eventName: 'transaction' | 'item',
			options: {
				tid: string;
				ta?: string;
				tr?: number;
				ts?: number;
				tt?: number;
				tc?: string;
				tcc?: string;
				pm?: string;
				sm?: string;
				icn?: number;
				in?: string;
				ip?: number;
				iq?: number;
				ic?: string;
				iv?: string;
			}
		) => void;
	};
	sendinblue: {
		track: (eventName: string, parameters: Record<string, any>) => void;
	};
	Cypress?: any;
}
