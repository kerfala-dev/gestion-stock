import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

import { usePermissions } from "../hooks/usePermissions";

import type { Categorie } from "../types/categorie";

function Categories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const { can } = usePermissions();

  const canCreateCategory = can("CATEGORY_CREATE");
  const canUpdateCategory = can("CATEGORY_UPDATE");
  const canDeleteCategory = can("CATEGORY_DELETE");

  const canManageCategories =
    canCreateCategory || canUpdateCategory || canDeleteCategory;

  // Charger les catégories
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getCategories(search, controller.signal);
        setCategories(data);
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

    void load();

    return () => controller.abort();
  }, [search]);

  function openCreate() {
    if (!canCreateCategory) return;

    setEditingId(null);
    setForm({ name: "", description: "" });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(category: Categorie) {
    if (!canUpdateCategory) return;

    setEditingId(category.id);

    setForm({
      name: category.name,
      description: category.description ?? "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "" });
  }

  async function reloadCategories() {
    const data = await getCategories(search);
    setCategories(data);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId ? !canUpdateCategory : !canCreateCategory) {
      setError("Vous n'avez pas l'autorisation d'effectuer cette action.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };

      if (editingId) {
        await updateCategory(editingId, payload);
        setSuccess("Catégorie modifiée avec succès !");
      } else {
        await createCategory(payload);
        setSuccess("Catégorie créée avec succès !");
      }

      closeForm();
      await reloadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category: Categorie) {
    if (!canDeleteCategory) return;
    const confirmation = window.confirm(
      `Supprimer la catégorie ${category.name} ?`,
    );

    if (!confirmation) return;

    setError("");
    setSuccess("");

    try {
      await deleteCategory(category.id);

      setSuccess("Catégorie supprimée avec succès !");
      await reloadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  }

  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold">Gestion des catégories</h4>
          <p className="text-secondary mb-0">
            Organisez vos produits par famille.
          </p>
        </div>

        {canCreateCategory && (
          <button
            className="btn btn-primary"
            type="button"
            onClick={openCreate}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nouvelle catégorie
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

      {/* Formulaire */}
      {showForm &&
        ((editingId === null && canCreateCategory) ||
          (editingId !== null && canUpdateCategory)) && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nom de la catégorie *</label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      minLength={2}
                      maxLength={80}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Description</label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      maxLength={500}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeForm}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Liste */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="col-md-5 mb-4">
            <input
              type="search"
              className="form-control"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Produits associés</th>
                  {canManageCategories && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={canManageCategories ? 4 : 3}
                      className="text-center py-4"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="fw-semibold">{category.name}</td>

                      <td>{category.description || "—"}</td>

                      <td>
                        <span className="badge text-bg-info">
                          {category._count?.products ?? 0}
                        </span>
                      </td>

                      {canManageCategories && (
                        <td>
                          <div className="d-flex gap-2">
                            {canUpdateCategory && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="Modifier"
                                onClick={() => openEdit(category)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            )}

                            {canDeleteCategory && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Supprimer"
                                onClick={() => void handleDelete(category)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-secondary py-4">
                      Aucune catégorie trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <small className="text-secondary">
            {categories.length} catégorie(s)
          </small>
        </div>
      </div>
    </div>
  );
}

export default Categories;
