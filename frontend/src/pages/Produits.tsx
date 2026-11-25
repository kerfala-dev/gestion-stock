import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { getCategories } from "../services/categoryService";

import { getSuppliers } from "../services/supplierService";

import type { Produit, CreateProduitPayload } from "../types/produits";
import type { Categorie } from "../types/categorie";
import type { Fournisseur } from "../types/fournisseur";
import { usePermissions } from "../hooks/usePermissions";

interface ProductForm {
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  purchasePrice: string;
  sellingPrice: string;
  lowStockThreshold: string;
}

const emptyForm: ProductForm = {
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  supplierId: "",
  purchasePrice: "",
  sellingPrice: "",
  lowStockThreshold: "5",
};

function Produits() {
  const [produits, setProduits] = useState<Produit[]>([]);

  const [recherche, setRecherche] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [categories, setCategories] = useState<Categorie[]>([]);

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);

  const [loadingReferences, setLoadingReferences] = useState(true);

  const { can } = usePermissions();

  const canCreateProduct = can("PRODUCT_CREATE");
  const canUpdateProduct = can("PRODUCT_UPDATE");
  const canDeleteProduct = can("PRODUCT_DELETE");

  const canManageProducts =
    canCreateProduct || canUpdateProduct || canDeleteProduct;

  // Charger les produits depuis PostgreSQL via l'API
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const data = await getProducts(recherche, controller.signal);

        setProduits(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les produits.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [recherche]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReferences() {
      setLoadingReferences(true);

      try {
        const [categoriesData, fournisseursData] = await Promise.all([
          getCategories("", controller.signal),
          getSuppliers("", controller.signal),
        ]);

        setCategories(categoriesData);
        setFournisseurs(fournisseursData);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les catégories et fournisseurs.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingReferences(false);
        }
      }
    }

    void loadReferences();

    return () => controller.abort();
  }, []);

  // Modifier un champ du formulaire
  function updateField(field: keyof ProductForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }
  // Ouvrir le formulaire de creation
  function openCreateForm() {
    if (!canCreateProduct) return;
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  // Ouvrir le formulaire de modification
  function openEditForm(produit: Produit) {
    if (!canUpdateProduct) return;
    setEditingId(produit.id);

    setForm({
      sku: produit.sku,
      name: produit.name,
      description: produit.description ?? "",

      purchasePrice: String(Number(produit.purchasePrice)),
      sellingPrice: String(Number(produit.sellingPrice)),

      lowStockThreshold: String(produit.lowStockThreshold),

      categoryId: produit.category.id,
      supplierId: produit.supplier?.id ?? "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  // Ajouter un produit
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId ? !canUpdateProduct : !canCreateProduct) {
      setError("Vous n'avez pas l'autorisation d'effectuer cette action.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload: CreateProduitPayload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim(),

      categoryId: form.categoryId,
      supplierId: form.supplierId || null,

      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),

      lowStockThreshold: Number(form.lowStockThreshold),
    };

    try {
      if (editingId) {
        // Modifier un produit existant
        const updatedProduct = await updateProduct(editingId, payload);

        setProduits((previous) =>
          previous.map((produit) =>
            produit.id === updatedProduct.id ? updatedProduct : produit,
          ),
        );

        setSuccess("Produit modifié avec succès !");
      } else {
        // Créer un nouveau produit
        const newProduct = await createProduct(payload);

        setProduits((previous) => [newProduct, ...previous]);

        setSuccess("Produit ajouté avec succès !");
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);

      // Afficher la liste complète après l'opération
      setRecherche("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function handleDelete(produit: Produit) {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le produit ${produit.name} ?`,
    );

    if (!confirmation) {
      return;
    }

    if (!canDeleteProduct) return;

    setError("");
    setSuccess("");

    try {
      await deleteProduct(produit.id);

      setProduits((previous) =>
        previous.filter((item) => item.id !== produit.id),
      );

      setSuccess("Produit supprimé avec succès !");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression.",
      );
    }
  }

  // Formater les prix
  function formatPrice(price: number | string) {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(Number(price));
  }

  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold">Gestion des produits</h4>

          <p className="text-secondary mb-0">
            Gérez votre catalogue de produits.
          </p>
        </div>
        {canCreateProduct && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateForm}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Ajouter un produit
          </button>
        )}
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

      {/* Formulaire d'ajout */}
      {showForm &&
        ((editingId === null && canCreateProduct) ||
          (editingId !== null && canUpdateProduct)) && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white p-3">
              <h5 className="fw-bold mb-0">
                {editingId ? "Modifier le produit" : "Nouveau produit"}
              </h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Référence SKU *</label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.sku}
                      onChange={(e) => updateField("sku", e.target.value)}
                      placeholder="Ex : PROD-001"
                      required
                      maxLength={50}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Nom du produit *</label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Nom du produit"
                      required
                      minLength={2}
                      maxLength={120}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>

                    <textarea
                      className="form-control"
                      rows={2}
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Description du produit"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Catégorie *</label>

                    <select
                      className="form-select"
                      value={form.categoryId}
                      onChange={(e) =>
                        updateField("categoryId", e.target.value)
                      }
                      required
                      disabled={loadingReferences}
                    >
                      <option value="">Sélectionner une catégorie</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Fournisseur</label>

                    <select
                      className="form-select"
                      value={form.supplierId}
                      onChange={(e) =>
                        updateField("supplierId", e.target.value)
                      }
                      disabled={loadingReferences}
                    >
                      <option value="">Aucun fournisseur</option>

                      {fournisseurs.map((fournisseur) => (
                        <option key={fournisseur.id} value={fournisseur.id}>
                          {fournisseur.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Prix d'achat (DH) *</label>

                    <input
                      type="number"
                      className="form-control"
                      value={form.purchasePrice}
                      onChange={(e) =>
                        updateField("purchasePrice", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Prix de vente (DH) *</label>

                    <input
                      type="number"
                      className="form-control"
                      value={form.sellingPrice}
                      onChange={(e) =>
                        updateField("sellingPrice", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Seuil d'alerte *</label>

                    <input
                      type="number"
                      className="form-control"
                      value={form.lowStockThreshold}
                      onChange={(e) =>
                        updateField("lowStockThreshold", e.target.value)
                      }
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setForm(emptyForm);
                    }}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      submitting || loadingReferences || categories.length === 0
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
                        {editingId
                          ? "Enregistrer les modifications"
                          : "Ajouter le produit"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Liste des produits */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un produit ou un SKU..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Produit</th>
                  <th>Référence</th>
                  <th>Catégorie</th>
                  <th>Fournisseur</th>
                  <th>Prix d'achat</th>
                  <th>Prix de vente</th>
                  <th>Quantité</th>
                  <th>État du stock</th>
                  {canManageProducts && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={canManageProducts ? 9 : 8}
                      className="text-center py-4"
                    >
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Chargement des produits...
                    </td>
                  </tr>
                ) : produits.length > 0 ? (
                  produits.map((produit) => {
                    const stockFaible =
                      produit.quantity <= produit.lowStockThreshold;

                    return (
                      <tr key={produit.id}>
                        <td className="fw-semibold">{produit.name}</td>

                        <td>
                          <code>{produit.sku}</code>
                        </td>

                        <td>{produit.category.name}</td>

                        <td>{produit.supplier?.name || "Aucun fournisseur"}</td>

                        <td>{formatPrice(produit.purchasePrice)}</td>

                        <td>{formatPrice(produit.sellingPrice)}</td>

                        <td>{produit.quantity}</td>

                        <td>
                          <span
                            className={`badge ${
                              stockFaible ? "text-bg-danger" : "text-bg-success"
                            }`}
                          >
                            {stockFaible ? "Stock faible" : "Disponible"}
                          </span>
                        </td>
                        {canManageProducts && (
                          <td>
                            <div className="d-flex gap-2">
                              {/* Modifier */}
                              {canUpdateProduct && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  title="Modifier le produit"
                                  onClick={() => openEditForm(produit)}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                              )}

                              {canDeleteProduct && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Supprimer le produit"
                                  onClick={() => void handleDelete(produit)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-4">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-secondary small">
            {produits.length} produit(s) affiché(s)
          </div>
        </div>
      </div>
    </div>
  );
}

export default Produits;
