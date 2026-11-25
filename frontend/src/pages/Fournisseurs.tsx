import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplierService";
import { usePermissions } from "../hooks/usePermissions";

import type { Fournisseur } from "../types/fournisseur";

function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { can } = usePermissions();

  const canCreateSupplier = can("SUPPLIER_CREATE");
  const canUpdateSupplier = can("SUPPLIER_UPDATE");
  const canDeleteSupplier = can("SUPPLIER_DELETE");

  const canManageSuppliers =
    canCreateSupplier || canUpdateSupplier || canDeleteSupplier;

  const initialForm = {
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
  };

  const [form, setForm] = useState(initialForm);

  // Charger les fournisseurs
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getSuppliers(search, controller.signal);

        setFournisseurs(data);
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
    if (!canCreateSupplier) return;

    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(fournisseur: Fournisseur) {
    if (!canUpdateSupplier) return;

    setEditingId(fournisseur.id);

    setForm({
      name: fournisseur.name,
      contactName: fournisseur.contactName ?? "",
      email: fournisseur.email ?? "",
      phone: fournisseur.phone ?? "",
      address: fournisseur.address ?? "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  }

  async function reloadSuppliers() {
    const data = await getSuppliers(search);
    setFournisseurs(data);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId ? !canUpdateSupplier : !canCreateSupplier) {
      setError("Vous n'avez pas l'autorisation d'effectuer cette action.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      contactName: form.contactName.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateSupplier(editingId, payload);
        setSuccess("Fournisseur modifié avec succès !");
      } else {
        await createSupplier(payload);
        setSuccess("Fournisseur créé avec succès !");
      }

      closeForm();
      await reloadSuppliers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(fournisseur: Fournisseur) {
    if (!canDeleteSupplier) return;
    const confirmation = window.confirm(
      `Supprimer le fournisseur ${fournisseur.name} ?`,
    );

    if (!confirmation) return;

    setError("");
    setSuccess("");

    try {
      await deleteSupplier(fournisseur.id);

      setSuccess("Fournisseur supprimé avec succès !");
      await reloadSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  }

  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold">Gestion des fournisseurs</h4>

          <p className="text-secondary mb-0">
            Gérez vos partenaires et leurs coordonnées.
          </p>
        </div>

        {canCreateSupplier && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreate}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nouveau fournisseur
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
        ((editingId === null && canCreateSupplier) ||
          (editingId !== null && canUpdateSupplier)) && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                {editingId ? "Modifier le fournisseur" : "Nouveau fournisseur"}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nom de l'entreprise *</label>

                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      minLength={2}
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Nom du contact</label>

                    <input
                      className="form-control"
                      value={form.contactName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contactName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>

                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Téléphone</label>

                    <input
                      type="tel"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Adresse</label>

                    <textarea
                      className="form-control"
                      rows={2}
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
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

      {/* Tableau */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="col-md-5 mb-4">
            <input
              type="search"
              className="form-control"
              placeholder="Rechercher un fournisseur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Entreprise</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Produits associés</th>
                  {canManageSuppliers && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={canManageSuppliers ? 6 : 5}
                      className="text-center py-4"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : fournisseurs.length > 0 ? (
                  fournisseurs.map((fournisseur) => (
                    <tr key={fournisseur.id}>
                      <td className="fw-semibold">{fournisseur.name}</td>

                      <td>{fournisseur.contactName || "—"}</td>

                      <td>{fournisseur.email || "—"}</td>

                      <td>{fournisseur.phone || "—"}</td>

                      <td>
                        <span className="badge text-bg-info">
                          {fournisseur._count?.products ?? 0}
                        </span>
                      </td>

                      {canManageSuppliers && (
                        <td>
                          <div className="d-flex gap-2">
                            {canUpdateSupplier && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="Modifier"
                                onClick={() => openEdit(fournisseur)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            )}

                            {canDeleteSupplier && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Supprimer"
                                onClick={() => void handleDelete(fournisseur)}
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
                    <td colSpan={6} className="text-center text-secondary py-4">
                      Aucun fournisseur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <small className="text-secondary">
            {fournisseurs.length} fournisseur(s)
          </small>
        </div>
      </div>
    </div>
  );
}

export default Fournisseurs;
