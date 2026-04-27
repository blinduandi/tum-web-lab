// Role definitions and the permissions each role grants. Permissions are
// the unit the auth middleware checks — roles are just shorthand for a
// permission set. Tokens may carry either or both.

export const PERMISSIONS = Object.freeze({
  READ: "READ",
  WRITE: "WRITE",
  DELETE: "DELETE",
});

export const ROLES = Object.freeze({
  GUEST: "GUEST",
  READER: "READER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
});

const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [],
  [ROLES.READER]: [PERMISSIONS.READ],
  [ROLES.EDITOR]: [PERMISSIONS.READ, PERMISSIONS.WRITE],
  [ROLES.ADMIN]: [PERMISSIONS.READ, PERMISSIONS.WRITE, PERMISSIONS.DELETE],
};

// Resolve the effective permission set for a token. We union (a) explicit
// permissions named in the token with (b) permissions implied by the role.
// Unknown roles contribute nothing — they don't reject the token, they
// just don't grant anything beyond the explicit `permissions` claim.
export function effectivePermissions({ role, permissions = [] }) {
  const fromRole = ROLE_PERMISSIONS[role] ?? [];
  return new Set([...fromRole, ...permissions]);
}

export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}
