import type { Page } from "../types/navigation";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/auth";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  EMPLOYEE: "Employé",
};

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const canManageUsers = user?.role === "ADMIN" || user?.role === "MANAGER";

  const menuItems: {
    page: Page;
    label: string;
    icon: string;
  }[] = [
    {
      page: "dashboard",
      label: "Tableau de bord",
      icon: "bi-speedometer2",
    },
    {
      page: "produits",
      label: "Produits",
      icon: "bi-box-seam",
    },
    {
      page: "categories",
      label: "Catégories",
      icon: "bi-tags",
    },
    {
      page: "fournisseurs",
      label: "Fournisseurs",
      icon: "bi-truck",
    },
    {
      page: "mouvements",
      label: "Mouvements",
      icon: "bi-arrow-left-right",
    },
    ...(canManageUsers
      ? [
          {
            page: "users" as Page,
            label: "Utilisateurs",
            icon: "bi-people",
          },
        ]
      : []),
  ];

  return (
    <aside className="sidebar bg-dark text-white p-3 d-flex flex-column">
      <div className="brand-label mb-5">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-box-seam me-2 text-primary"></i>
          StockManager
        </h4>

        <small className="text-secondary">
          {user ? roleLabels[user.role] : "Gestion de stock"}
        </small>
      </div>

      <p className="text-secondary small text-uppercase">Menu principal</p>

      <nav className="nav flex-column gap-2">
        {menuItems.map((item) => (
          <button
            key={item.page}
            type="button"
            className={`nav-link ${activePage === item.page ? "active" : ""}`}
            onClick={() => onNavigate(item.page)}
          >
            <i className={`bi ${item.icon} me-3`}></i>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer mt-auto border-top border-secondary pt-3">
        <small className="text-secondary">StockManager v1.0.0</small>
      </div>
    </aside>
  );
}

export default Sidebar;
