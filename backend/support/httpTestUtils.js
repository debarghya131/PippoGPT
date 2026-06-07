import express from "express";

export const requestRouter = async (router, path, options = {}) => {
  const app = express();
  app.use(express.json());
  app.use("/api", router);

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api${path}`, options);
    const body = await response.json();
    return { response, body };
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

export const jsonRequest = (method, body, headers = {}) => ({
  method,
  headers: {
    "Content-Type": "application/json",
    ...headers,
  },
  body: body === undefined ? undefined : JSON.stringify(body),
});
