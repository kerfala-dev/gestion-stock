import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { getProducts } from "../services/productService";

import {
  getStockMovements,
  createStockMovement,
} from "../services/stockMovementService";

import type { Produit } from "../types/produits";

import type { Mouvement, MouvementType } from "../types/mouvement";

interface MovementForm {
  productId: string;
  type: MouvementType;
  quantity: string;
  note: string;
}

const initialForm: MovementForm = {
  productId: "",
  type: "ENTRY",
  quantity: "",
  note: "",
};

function Mouvements() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [productFilter, setProductFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [form, setForm] = useState<MovementForm>(initialForm);

  // Charger les produits et l'historique
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [productsData, movementsData] = await Promise.all([
          getProducts("", controller.signal),

          getStockMovements(
            {
              productId: productFilter || undefined,
              type: typeFilter ? (typeFilter as MouvementType) : undefined,
            },
            controller.signal,
          ),
        ]);

        setProduits(productsData);
        setMouvements(movementsData);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Erreur de chargement.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => controller.abort();
  }, [productFilter, typeFilter]);

  // Modifier les champs du formulaire
  function updateField(field: keyof MovementForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Enregistrer un mouvement
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.productId) {
      setError("Veuillez sélectionner un produit.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity === 0) {
      setError("La quantité doit être un entier différent de zéro.");
      return;
    }

    if ((form.type === "ENTRY" || form.type === "EXIT") && quantity <= 0) {
      setError(
        "Pour une entrée ou une sortie, la quantité doit être positive.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await createStockMovement({
        productId: form.productId,
        type: form.type,
        quantity,
        note: form.note.trim() || undefined,
      });

      setSuccess("Mouvement enregistré avec succès !");
      setForm(initialForm);

      // Actualiser le stock et l'historique
      const [productsData, movementsData] = await Promise.all([
        getProducts("", undefined),

        getStockMovements({
          productId: productFilter || undefined,
          type: typeFilter ? (typeFilter as MouvementType) : undefined,
        }),
      ]);

      setProduits(productsData);
      setMouvements(movementsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le mouvement.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Présentation des types
  function getMovementLabel(type: MouvementType) {
    switch (type) {
      case "ENTRY":
        return "Entrée";

      case "EXIT":
        return "Sortie";

      case "ADJUSTMENT":
        return "Ajustement";
    }
  }

  function getMovementBadge(type: MouvementType) {
    switch (type) {
      case "ENTRY":
        return "text-bg-success";

      case "EXIT":
        return "text-bg-danger";

      case "ADJUSTMENT":
        return "text-bg-primary";
    }
  }

  // Afficher la variation réelle de stock
  function formatMovementQuantity(movement: Mouvement) {
    let value: number;

    switch (movement.type) {
      case "ENTRY":
        value = movement.quantity;
        break;

      case "EXIT":
        value = -movement.quantity;
        break;

      case "ADJUSTMENT":
        value = movement.quantity;
        break;
    }

    return value > 0 ? `+${value}` : String(value);
  }

  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold">Mouvements de stock</h4>

          <p className="text-secondary mb-0">
            Gérez les entrées, sorties et ajustements.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Formulaire */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white p-3">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-arrow-left-right me-2 text-primary"></i>
            Enregistrer un mouvement
          </h5>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Produit */}
              <div className="col-md-6">
                <label className="form-label">Produit *</label>

                <select
                  className="form-select"
                  value={form.productId}
                  onChange={(e) => updateField("productId", e.target.value)}
                  required
                  disabled={loading || submitting || produits.length === 0}
                >
                  <option value="">Sélectionner un produit</option>

                  {produits.map((produit) => (
                    <option key={produit.id} value={produit.id}>
                      {produit.name} — Stock : {produit.quantity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="col-md-6">
                <label className="form-label">Type de mouvement *</label>

                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) =>
                    updateField("type", e.target.value as MouvementType)
                  }
                  disabled={submitting}
                >
                  <option value="ENTRY">Entrée</option>
                  <option value="EXIT">Sortie</option>
                  <option value="ADJUSTMENT">Ajustement</option>
                </select>
              </div>

              {/* Quantité */}
              <div className="col-md-6">
                <label className="form-label">Quantité *</label>

                <input
                  type="number"
                  className="form-control"
                  value={form.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                  step="1"
                  required
                  disabled={submitting}
                  placeholder={
                    form.type === "ADJUSTMENT" ? "Ex : -5 ou 5" : "Ex : 10"
                  }
                />

                <small className="text-secondary">
                  {form.type === "ADJUSTMENT"
                    ? "Utilise une valeur positive ou négative."
                    : "Saisis une quantité positive."}
                </small>
              </div>

              {/* Note */}
              <div className="col-md-6">
                <label className="form-label">Observation</label>

                <input
                  type="text"
                  className="form-control"
                  value={form.note}
                  onChange={(e) => updateField("note", e.target.value)}
                  maxLength={500}
                  placeholder="Ex : Livraison fournisseur"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  loading ||
                  submitting ||
                  produits.length === 0 ||
                  !form.productId
                }
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Enregistrer le mouvement
                  </>
                )}
              </button>
            </div>
          </form>

          {produits.length === 0 && !loading && (
            <div className="alert alert-warning mt-3 mb-0">
              Aucun produit disponible. Ajoute d'abord un produit.
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white p-3">
          <h5 className="fw-bold mb-0">Historique des mouvements</h5>
        </div>

        <div className="card-body">
          {/* Filtres */}
          <div className="row g-3 mb-4">
            <div className="col-md-5">
              <label className="form-label">Filtrer par produit</label>

              <select
                className="form-select"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              >
                <option value="">Tous les produits</option>

                {produits.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-5">
              <label className="form-label">Filtrer par type</label>

              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Tous les mouvements</option>
                <option value="ENTRY">Entrées</option>
                <option value="EXIT">Sorties</option>
                <option value="ADJUSTMENT">Ajustements</option>
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setProductFilter("");
                  setTypeFilter("");
                }}
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Tableau */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Type</th>
                  <th>Variation</th>
                  <th>Observation</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Chargement de l'historique...
                    </td>
                  </tr>
                ) : mouvements.length > 0 ? (
                  mouvements.map((movement) => (
                    <tr key={movement.id}>
                      <td>
                        {new Date(movement.createdAt).toLocaleString("fr-MA")}
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {movement.product.name}
                        </div>

                        <small className="text-secondary">
                          {movement.product.sku}
                        </small>
                      </td>

                      <td>
                        <span
                          className={`badge ${getMovementBadge(movement.type)}`}
                        >
                          {getMovementLabel(movement.type)}
                        </span>
                      </td>

                      <td className="fw-bold">
                        {formatMovementQuantity(movement)}
                      </td>

                      <td>{movement.note || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary py-4">
                      Aucun mouvement trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <small className="text-secondary">
            {mouvements.length} mouvement(s) affiché(s)
          </small>
        </div>
      </div>
    </div>
  );
}

export default Mouvements;
