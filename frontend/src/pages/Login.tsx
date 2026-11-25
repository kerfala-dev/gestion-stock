import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant la connexion.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div
        className="card border-0 shadow p-4"
        style={{ maxWidth: "430px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">StockManager</h2>
          <p className="text-muted">Connectez-vous à votre espace de gestion</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Adresse email
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="exemple@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-muted small mt-4 mb-0">
          StockManager © 2026
        </p>
      </div>
    </div>
  );
}

export default Login;
