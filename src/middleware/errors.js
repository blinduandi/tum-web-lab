// Default 404 (no route matched) and the final error handler.
// Routes that throw synchronously, or call next(err), end up here.

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "not_found", message: "Route does not exist." });
}

// eslint-disable-next-line no-unused-vars -- Express identifies the error
// handler by its arity (4 args), so `next` must remain in the signature.
export function errorHandler(err, _req, res, _next) {
  const status = Number(err.status) || 500;
  if (status >= 500) {
    console.error("[error]", err);
  }
  res.status(status).json({
    error: err.code || (status >= 500 ? "internal_error" : "error"),
    message: err.message || "Unexpected error.",
  });
}
