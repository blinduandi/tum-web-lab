// Mounts Swagger UI at /docs, sourced from openapi.yaml in the repo root.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import swaggerUi from "swagger-ui-express";
import YAML from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const specPath = resolve(here, "..", "..", "openapi.yaml");
const spec = YAML.parse(readFileSync(specPath, "utf8"));

export const docsMiddleware = [
  swaggerUi.serve,
  swaggerUi.setup(spec, {
    customSiteTitle: "Pagebound API · Docs",
    swaggerOptions: { persistAuthorization: true },
  }),
];

export const openApiSpec = spec;
