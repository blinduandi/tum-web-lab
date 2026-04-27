// `/token` endpoint — issues a JWT carrying the requested role/permissions.
//
// Two flavors are accepted to satisfy the lab spec ("POST JSON or GET query"):
//   POST /token   { "role": "EDITOR", "permissions": ["READ"] }
//   GET  /token?role=EDITOR&permissions=READ,WRITE
//
// In a real system, a sign-in flow would verify credentials before issuing
// a token. For the lab, the endpoint hands out whatever the caller asks
// for — that's how every demo using `1 minute` JWTs is set up.

import { Router } from "express";

import { signToken } from "../auth/jwt.js";
import { effectivePermissions, isValidRole, ROLES } from "../auth/roles.js";
import { config } from "../config.js";

export const tokenRouter = Router();

tokenRouter.post("/token", (req, res, next) => {
  try {
    const { role, permissions } = normalizeBody(req.body ?? {});
    return issue(res, role, permissions);
  } catch (err) {
    next(err);
  }
});

tokenRouter.get("/token", (req, res, next) => {
  try {
    const { role, permissions } = normalizeQuery(req.query);
    return issue(res, role, permissions);
  } catch (err) {
    next(err);
  }
});

function normalizeBody({ role, permissions }) {
  return {
    role: typeof role === "string" ? role.toUpperCase() : ROLES.READER,
    permissions: Array.isArray(permissions)
      ? permissions.map((p) => String(p).toUpperCase())
      : [],
  };
}

function normalizeQuery(query) {
  const role =
    typeof query.role === "string" && query.role ? query.role.toUpperCase() : ROLES.READER;
  const raw = query.permissions;
  const permissions =
    typeof raw === "string" && raw
      ? raw.split(",").map((p) => p.trim().toUpperCase()).filter(Boolean)
      : [];
  return { role, permissions };
}

function issue(res, role, permissions) {
  if (!isValidRole(role)) {
    return res.status(400).json({
      error: "invalid_role",
      message: `Unknown role: ${role}. Allowed: ${Object.values(ROLES).join(", ")}.`,
    });
  }

  const effective = [...effectivePermissions({ role, permissions })];
  const token = signToken({ role, permissions: effective });

  return res.status(200).json({
    token,
    tokenType: "Bearer",
    expiresIn: config.tokenTtlSeconds,
    role,
    permissions: effective,
  });
}
