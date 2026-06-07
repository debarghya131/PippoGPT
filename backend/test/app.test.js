import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../App.js";

const requestApp = async (app, path, options = {}) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, options);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

test("CORS accepts configured origins", async () => {
  const app = createApp({ allowedOrigins: ["https://pippo.example"] });
  const response = await requestApp(app, "/", {
    headers: { Origin: "https://pippo.example" },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://pippo.example");
});

test("CORS rejects unconfigured origins", async () => {
  const app = createApp({ allowedOrigins: ["https://pippo.example"] });
  const response = await requestApp(app, "/", {
    headers: { Origin: "https://attacker.example" },
  });

  assert.equal(response.status, 403);
});

test("health endpoint reports disconnected databases as degraded", async () => {
  const app = createApp();
  const response = await requestApp(app, "/health");
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.deepEqual(body, { status: "degraded", database: "disconnected" });
});
