export type MouvementType = | "ENTRY" | "EXIT" | "ADJUSTMENT";

export interface Mouvement {
	id: string;
	productId: string;
	type: MouvementType;
	quantity: number;
	note: string | null;
	createdAt: string;

	product: {
		id: string;
		sku: string;
		name: string;
	};
}

export interface CreateMouvementPayload {
	productId: string;
	type: MouvementType;
	quantity: number;
	note?: string;
}

export interface MouvementFilters {
	productId?: string;
	type?: MouvementType;
}