// Thin wrapper around `jsonwebtoken`. Centralizes the secret and TTL so
// every consumer signs/verifies with the same configuration.

import jwt from "jsonwebtoken";

import { config } from "../config.js";

export function signToken(payload, { ttlSeconds = config.tokenTtlSeconds } = {}) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: ttlSeconds,
    issuer: "pagebound-api",
  });
}

export function verifyToken(token) {
  // Lets the caller handle JsonWebTokenError / TokenExpiredError directly.
  return jwt.verify(token, config.jwtSecret, { issuer: "pagebound-api" });
}
