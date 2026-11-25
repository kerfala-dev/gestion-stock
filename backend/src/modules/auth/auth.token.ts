
import jwt from "jsonwebtoken";
import type { UserRole } from "../../types/auth.js";

export interface AccessTokenPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
}

const secret = process.env.JWT_ACCESS_SECRET;

if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
  throw new Error(
    "JWT_ACCESS_SECRET doit contenir au moins 32 octets."
  );
}

const JWT_ISSUER = "stockmanager-api";
const JWT_AUDIENCE = "stockmanager-web";

export function signAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(
    {
      organizationId: payload.organizationId,
      role: payload.role,
    },
    secret!,
    {
      subject: payload.userId,
      algorithm: "HS256",
      expiresIn: "1h",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  );
}


export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  const decoded = jwt.verify(token, secret!, {
    algorithms: ["HS256"],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    maxAge: "1h",
  });

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.organizationId !== "string" ||
    typeof decoded.iat !== "number" ||
    typeof decoded.exp !== "number" ||
    decoded.exp <= decoded.iat ||
    !["ADMIN", "MANAGER", "EMPLOYEE"].includes(
      String(decoded.role)
    )
  ) {
    throw new Error("Jeton invalide.");
  }

  return {
    userId: decoded.sub,
    organizationId: decoded.organizationId,
    role: decoded.role as UserRole,
  };
}
