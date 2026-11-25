export interface Produit {
	id: string;
	sku: string;
	name: string;
	description: string | null;

	purchasePrice: number | string;
	sellingPrice: number | string;

	quantity: number;
	lowStockThreshold: number;
	isActive: boolean;

	category: {
		id: string;
		name: string;
	};

	 supplier: {
    id: string;
    name: string;
  } | null;

	createdAt: string;
}

export interface CreateProduitPayload {
	sku: string;
	name: string;
	description?: string;
	categoryId: string;
    supplierId?: string | null;
	purchasePrice: number;
	sellingPrice: number;
	lowStockThreshold: number;
}

export type UpdateProduitPayload = Partial<CreateProduitPayload>