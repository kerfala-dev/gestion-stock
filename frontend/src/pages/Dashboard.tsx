import { useEffect, useState } from "react";

import StatCard from "../components/StatCard";

import { getDashboard } from "../services/dashboardService";

import type { DashboardData } from "../types/dashboard";
import type { MouvementType } from "../types/mouvement";

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard(signal?: AbortSignal) {
    setLoading(true);
    setError("");

    try {
      const result = await getDashboard(signal);
      setData(result);
    } catch (err) {
      if (!signal?.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le tableau de bord.",
        );
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    void loadDashboard(controller.signal);

    return () => controller.abort();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(price);

  function movementLabel(type: MouvementType) {
    switch (type) {
      case "ENTRY":
        return "Entrée";
      case "EXIT":
        return "Sortie";
      case "ADJUSTMENT":
        return "Ajustement";
    }
  }

  function movementClass(type: MouvementType) {
    switch (type) {
      case "ENTRY":
        return "text-bg-success";
      case "EXIT":
        return "text-bg-danger";
      case "ADJUSTMENT":
        return "text-bg-primary";
    }
  }

  function movementQuantity(
    movement: DashboardData["recentMovements"][number],
  ) {
    const value =
      movement.type === "EXIT" ? -movement.quantity : movement.quantity;

    return value > 0 ? `+${value}` : String(value);
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <div className="d-flex justify-content-between align-items-center">
          <span>{error}</span>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => void loadDashboard()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = data.stats;

  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold">Tableau de bord</h4>
          <p className="text-secondary mb-0">Vue générale de votre activité.</p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => void loadDashboard()}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total produits"
            value={String(stats.productsCount)}
            description="Produits actifs"
            icon="bi-box-seam"
            color="icon-blue"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Catégories"
            value={String(stats.categoriesCount)}
            description="Catégories enregistrées"
            icon="bi-tags"
            color="icon-green"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Fournisseurs"
            value={String(stats.suppliersCount)}
            description="Fournisseurs enregistrés"
            icon="bi-truck"
            color="icon-purple"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Stocks faibles"
            value={String(stats.lowStockCount)}
            description="Produits à surveiller"
            icon="bi-exclamation-triangle"
            color="icon-orange"
          />
        </div>
      </div>

      {/* Valeur du stock */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-secondary mb-2">Valeur indicative du stock</p>

              <h3 className="fw-bold mb-0">{formatPrice(stats.stockValue)}</h3>

              <small className="text-secondary">
                Calculée à partir des prix d'achat
              </small>
            </div>

            <div className="stat-icon icon-green">
              <i className="bi bi-cash-stack fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes de stock faible */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white p-4">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Alertes de stock faible
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Produit</th>
                <th>SKU</th>
                <th>Catégorie</th>
                <th>Stock actuel</th>
                <th>Seuil d'alerte</th>
                <th>État</th>
              </tr>
            </thead>

            <tbody>
              {data.lowStockProducts.length > 0 ? (
                data.lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="fw-semibold">{product.name}</td>

                    <td>
                      <code>{product.sku}</code>
                    </td>

                    <td>{product.category.name}</td>

                    <td>{product.quantity}</td>

                    <td>{product.lowStockThreshold}</td>

                    <td>
                      <span
                        className={`badge ${
                          product.quantity === 0
                            ? "text-bg-danger"
                            : "text-bg-warning"
                        }`}
                      >
                        {product.quantity === 0 ? "Rupture" : "Stock faible"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-success py-4">
                    <i className="bi bi-check-circle me-2"></i>
                    Aucun produit en stock faible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Derniers mouvements */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white p-4">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-arrow-left-right me-2 text-primary"></i>
            Derniers mouvements
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Produit</th>
                <th>Type</th>
                <th>Variation</th>
                <th>Date</th>
                <th>Observation</th>
              </tr>
            </thead>

            <tbody>
              {data.recentMovements.length > 0 ? (
                data.recentMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="fw-semibold">{movement.product.name}</td>

                    <td>
                      <span className={`badge ${movementClass(movement.type)}`}>
                        {movementLabel(movement.type)}
                      </span>
                    </td>

                    <td className="fw-bold">{movementQuantity(movement)}</td>

                    <td>
                      {new Date(movement.createdAt).toLocaleString("fr-MA")}
                    </td>

                    <td>{movement.note || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4">
                    Aucun mouvement enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
