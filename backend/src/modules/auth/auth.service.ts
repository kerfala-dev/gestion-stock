
import argon2 from "argon2";

import * as repository from "./auth.repository.js";

import { signAccessToken } from "./auth.token.js";

function createAuthError(message: string) {
  return Object.assign(new Error(message), {
    statusCode: 401,
  });
}

export async function login(
  email: string,
  password: string
) {
  const user = await repository.findByEmail(email);

  if (!user) {
    throw createAuthError(
      "Email ou mot de passe incorrect."
    );
  }

  if (!user.isActive) {
  throw Object.assign(
    new Error("Ce compte a été désactivé. Contactez votre administrateur."),
    { statusCode: 403 }
  );
}

  const passwordValid = await argon2.verify(
    user.passwordHash,
    password
  );

  if (!passwordValid) {
    throw createAuthError(
      "Email ou mot de passe incorrect."
    );
  }

  const token = signAccessToken({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
  });

  return {
    token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,

      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await repository.findById(userId);

  if (!user) {
    throw createAuthError("Utilisateur introuvable.");
  }

  if (!user.isActive) {
  throw Object.assign(
    new Error("Ce compte a été désactivé."),
    { statusCode: 403 }
  );
}

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,

    organization: {
      id: user.organization.id,
      name: user.organization.name,
    },
  };
}
