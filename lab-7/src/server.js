// Local-development entry point. Boots the shared Express app on a port.
// Vercel ignores this file — it imports `api/index.js` instead.

import app from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`pagebound-api listening on http://localhost:${config.port}`);
  console.log(`  docs:  http://localhost:${config.port}/docs`);
  console.log(`  CORS:  ${config.corsOrigins.join(", ") || "<none>"}`);
});
