export interface Categorie {
	id: string;
	name: string;
	description: string;
	createdAt: string;

	_count?: {
		products: number;
	};
}

export interface CreateCategoriePayload {
	name: string;
	description?: string;
}