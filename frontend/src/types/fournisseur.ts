export interface Fournisseur {
	id: string;
	name: string;
	contactName: string | null;
	email: string | null;
	phone: string | null;
	address: string | null;
	createdAt: string;

	_count?: {
		products: number;
	}; 
}

export interface CreateFournisseurPayload {
	name: string;
	contactName?: string;
	email?: string;
	phone?: string;
	address?: string;
}