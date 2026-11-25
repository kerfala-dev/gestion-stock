
import argon2 from "argon2";

import * as repository from "./user.repository.js";

import type {
  CreateUserInput,
  UpdateUserInput,
} from "./user.validation.js";

import type { UserRole } from "../../types/auth.js";

// Récupérer tous les utilisateurs d'une organisation
export function getUsers(organizationId: string) {
  return repository.findAll(organizationId);
}

// Récupérer un utilisateur
export function getUser(
  organizationId: string,
  id: string
) {
  return repository.findById(organizationId, id);
}

// Vérifier les droits de création
function canCreateRole(
  creatorRole: UserRole,
  targetRole: UserRole
): boolean {
  if (creatorRole === "ADMIN") {
    return targetRole === "MANAGER" ||
      targetRole === "EMPLOYEE";
  }

  if (creatorRole === "MANAGER") {
    return targetRole === "EMPLOYEE";
  }

  return false;
}

// Vérifier les droits de modification
function canUpdateUser(
  creatorRole: UserRole,
  targetRole: UserRole
): boolean {
  if (creatorRole === "ADMIN") {
    return true;
  }

  if (creatorRole === "MANAGER") {
    return targetRole === "EMPLOYEE";
  }

  return false;
}

// Créer un utilisateur
export async function createUser(
  organizationId: string,
  creatorRole: UserRole,
  data: CreateUserInput
) {
  if (!canCreateRole(creatorRole, data.role)) {
    throw Object.assign(
      new Error(
        "Vous n'avez pas la permission de créer ce type de compte."
      ),
      { statusCode: 403 }
    );
  }

  const existingUser = await repository.findByEmail(
    data.email
  );

  if (existingUser) {
    throw Object.assign(
      new Error("Cette adresse email est déjà utilisée."),
      { statusCode: 409 }
    );
  }

  const passwordHash = await argon2.hash(data.password);

  return repository.create(
    organizationId,
    data,
    passwordHash
  );
}

// Modifier un utilisateur
export async function updateUser(
  organizationId: string,
  creatorRole: UserRole,
  id: string,
  data: UpdateUserInput
) {
  // Vérifier que l'utilisateur appartient à l'organisation
  const targetUser = await repository.findById(
    organizationId,
    id
  );

  if (!targetUser) {
    return null;
  }

  // Vérifier les permissions selon le rôle ciblé
  if (!canUpdateUser(creatorRole, targetUser.role)) {
    throw Object.assign(
      new Error(
        "Vous n'avez pas la permission de modifier cet utilisateur."
      ),
      { statusCode: 403 }
    );
  }

  // Vérifier l'unicité de l'adresse email
  if (data.email) {
    const existingUser = await repository.findByEmail(
      data.email
    );

    if (existingUser && existingUser.id !== id) {
      throw Object.assign(
        new Error("Cette adresse email est déjà utilisée."),
        { statusCode: 409 }
      );
    }
  }

  return repository.update(
    organizationId,
    id,
    data
  );
}

export async function updateUserStatus(
  organizationId: string,
  creatorRole: UserRole,
  creatorId: string,
  targetId: string,
  isActive: boolean
) {
  // Seul l'ADMIN peut modifier le statut.
  if (creatorRole !== "ADMIN") {
    throw Object.assign(
      new Error("Seul un administrateur peut modifier le statut des utilisateurs."),
      { statusCode: 403 }
    );
  }

  // Empêcher l'administrateur de désactiver son propre compte.
  if (creatorId === targetId && !isActive) {
    throw Object.assign(
      new Error("Vous ne pouvez pas désactiver votre propre compte."),
      { statusCode: 403 }
    );
  }

  const user = await repository.updateStatus(
    organizationId,
    targetId,
    isActive
  );

  if (!user) {
    return null;
  }

  return user;
}
