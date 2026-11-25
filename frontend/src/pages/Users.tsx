import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { getUsers } from "../services/userService";
import type { ManagedUser } from "../types/auth";
import { useAuth } from "../contexts/AuthContext";
import { updateUser, updateUserStatus } from "../services/userService";

import { createUser } from "../services/userService";

function Users() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as "MANAGER" | "EMPLOYEE",
  });

  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { user: currentUser } = useAuth();

  const canCreateManager = currentUser?.role === "ADMIN";

  const canCreateEmployee =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
  });

  const [updating, setUpdating] = useState(false);

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les utilisateurs.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);
  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && user.isActive) ||
      (statusFilter === "INACTIVE" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleLabels = {
    ADMIN: "Administrateur",
    MANAGER: "Gestionnaire",
    EMPLOYEE: "Employé",
  };

  async function handleCreateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccessMessage("");

      const newUser = await createUser(formData);

      setUsers((previousUsers) => [...previousUsers, newUser]);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
      });

      setShowForm(false);
      setSuccessMessage("Utilisateur créé avec succès.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer cet utilisateur.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(targetUser: ManagedUser) {
    const newStatus = !targetUser.isActive;

    const action = newStatus ? "activer" : "désactiver";

    const confirmed = window.confirm(
      `Voulez-vous vraiment ${action} le compte de ${targetUser.name} ?`,
    );

    if (!confirmed) return;

    try {
      setStatusLoading(targetUser.id);
      setError("");

      const updatedUser = await updateUserStatus(targetUser.id, newStatus);

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut.",
      );
    } finally {
      setStatusLoading(null);
    }
  }

  function handleEditClick(targetUser: ManagedUser) {
    setEditingUser(targetUser);

    setEditData({
      name: targetUser.name,
      email: targetUser.email,
    });

    setError("");
    setSuccessMessage("");
  }

  async function handleUpdateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingUser) return;

    try {
      setUpdating(true);
      setError("");
      setSuccessMessage("");

      const updatedUser = await updateUser(editingUser.id, editData);

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        ),
      );

      setEditingUser(null);

      setEditData({
        name: "",
        email: "",
      });

      setSuccessMessage("Utilisateur modifié avec succès.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier cet utilisateur.",
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Utilisateurs</h4>
          <p className="text-muted mb-0">
            Gérez les comptes de votre organisation.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          {users.length} utilisateur(s)
        </span>
      </div>

      {canCreateEmployee && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccessMessage("");
          }}
        >
          <i className="bi bi-person-plus me-2"></i>
          Ajouter un utilisateur
        </button>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
            aria-label="Fermer"
          />
        </div>
      )}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">Créer un utilisateur</h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleCreateUser}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Adresse email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    maxLength={255}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    minLength={8}
                    maxLength={128}
                    required
                  />
                  <small className="text-muted">Minimum 8 caractères.</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Rôle</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "MANAGER" | "EMPLOYEE",
                      })
                    }
                  >
                    <option value="EMPLOYEE">Employé</option>

                    {canCreateManager && (
                      <option value="MANAGER">Gestionnaire</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={creating}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? "Création..." : "Créer l'utilisateur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">
              Modifier l'utilisateur : {editingUser.name}
            </h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleUpdateUser}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nom complet</label>

                  <input
                    type="text"
                    className="form-control"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        name: e.target.value,
                      })
                    }
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Adresse email</label>

                  <input
                    type="email"
                    className="form-control"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        email: e.target.value,
                      })
                    }
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={updating}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label">Recherche</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nom ou adresse email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Filtrer par rôle</label>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="MANAGER">Gestionnaire</option>
            <option value="EMPLOYEE">Employé</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Filtrer par statut</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Désactivés</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2">Chargement des utilisateurs...</p>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="fw-semibold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{roleLabels[user.role]}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.isActive ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {user.isActive ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    {currentUser?.role === "ADMIN" &&
                      currentUser.id !== user.id && (
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            user.isActive
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          disabled={statusLoading === user.id}
                          onClick={() => handleStatusChange(user)}
                        >
                          {statusLoading === user.id
                            ? "Patientez..."
                            : user.isActive
                              ? "Désactiver"
                              : "Activer"}
                        </button>
                      )}

                    {(currentUser?.role === "ADMIN" ||
                      (currentUser?.role === "MANAGER" &&
                        user.role === "EMPLOYEE")) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditClick(user)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;
