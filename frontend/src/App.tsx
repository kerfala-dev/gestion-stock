import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Produits from "./pages/Produits";
import Categories from "./pages/Categories";
import Fournisseurs from "./pages/Fournisseurs";
import Mouvements from "./pages/Mouvements";
import Login from "./pages/Login";

import Users from "./pages/Users";

import type { Page } from "./types/navigation";

function DashboardLayout() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const pageInfo = {
    dashboard: {
      title: "Tableau de bord",
      subtitle: "Bienvenue dans votre espace de gestion",
    },
    produits: {
      title: "Produits",
      subtitle: "Gestion de votre catalogue",
    },
    categories: {
      title: "Catégories",
      subtitle: "Organisation de vos produits",
    },
    fournisseurs: {
      title: "Fournisseurs",
      subtitle: "Gestion de vos partenaires commerciaux",
    },
    mouvements: {
      title: "Mouvements de stock",
      subtitle: "Suivi des entrées, sorties et ajustements",
    },

    users: {
      title: "Utilisateurs",
      subtitle: "Gestion des comptes de votre organisation",
    },
  };

  return (
    <div className="app-shell d-flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-content flex-grow-1">
        <Navbar
          title={pageInfo[activePage].title}
          subtitle={pageInfo[activePage].subtitle}
        />

        <main className="container-fluid p-4">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "produits" && <Produits />}
          {activePage === "categories" && <Categories />}
          {activePage === "fournisseurs" && <Fournisseurs />}
          {activePage === "mouvements" && <Mouvements />}
          {activePage === "users" && <Users />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
