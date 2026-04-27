// Express middleware for JWT-protected routes.
//
//   requireAuth                          — must have a valid (non-expired) token
//   requirePermission(PERMISSIONS.READ)  — token must include this permission
//                                          (either explicitly, or implied by its role)
//
// Reasons we send 401 vs 403:
//   401 — no token, malformed token, expired token (authentication failed)
//   403 — token is fine but the caller lacks the required permission

import jwt from "jsonwebtoken";

import { effectivePermissions } from "./roles.js";
import { verifyToken } from "./jwt.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (!token || scheme.toLowerCase() !== "bearer") {
    return res.status(401).json({
      error: "missing_token",
      message: "Authorization header must be `Bearer <token>`.",
    });
  }

  try {
    const payload = verifyToken(token);
    req.auth = {
      role: payload.role,
      permissions: payload.permissions ?? [],
      effective: effectivePermissions(payload),
      raw: payload,
    };
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "token_expired",
        message: "Token has expired. Request a new one from /token.",
        expiredAt: err.expiredAt,
      });
    }
    return res.status(401).json({ error: "invalid_token", message: err.message });
  }
}

export function requirePermission(permission) {
  return function permissionGate(req, res, next) {
    if (!req.auth) {
      // Defensive: someone wired this middleware without requireAuth before it.
      return res.status(401).json({ error: "missing_token", message: "Auth required." });
    }
    if (!req.auth.effective.has(permission)) {
      return res.status(403).json({
        error: "forbidden",
        message: `Missing required permission: ${permission}.`,
        granted: [...req.auth.effective],
      });
    }
    return next();
  };
}
