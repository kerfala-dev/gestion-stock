
import type { MouvementType } from "./mouvement";

export interface DashboardData {
  stats: {
    productsCount: number;
    categoriesCount: number;
    suppliersCount: number;
    lowStockCount: number;
    stockValue: number;
  };

  lowStockProducts: {
    id: string;
    sku: string;
    name: string;
    quantity: number;
    lowStockThreshold: number;
    category: {
      name: string;
    };
  }[];

  recentMovements: {
    id: string;
    type: MouvementType;
    quantity: number;
    note: string | null;
    createdAt: string;

    product: {
      id: string;
      sku: string;
      name: string;
    };
  }[];
}
