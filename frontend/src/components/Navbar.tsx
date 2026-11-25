import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  title: string;
  subtitle: string;
}

function Navbar({ title, subtitle }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Une erreur est survenue pendant la déconnexion.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="bg-white border-bottom px-4 py-3">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h5 className="fw-bold mb-1">{title}</h5>
          <small className="text-secondary">{subtitle}</small>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-light position-relative"
            aria-label="Notifications"
            title="Notifications"
          >
            <i className="bi bi-bell fs-5"></i>
          </button>

          <div className="d-flex align-items-center gap-2">
            <div className="avatar-user">{initials}</div>

            <div className="d-none d-md-block">
              <div className="fw-semibold small">
                {user?.name || "Utilisateur"}
              </div>
              <div className="text-secondary small">
                {user?.role || "Membre"}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Déconnexion"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-3 mb-0" role="alert">
          {error}
        </div>
      )}
    </header>
  );
}

export default Navbar;
