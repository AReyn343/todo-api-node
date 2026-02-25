require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const todoRouter = require("./routes/todo");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

// Swagger config
const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Todo API",
    version: "1.0.0",
    description: "Simple CRUD Todo API (Express + SQLite).",
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 3000}` },
  ],
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./app.js", "./routes/*.js"], // JSDoc @openapi dans app + routes
};

const openapiSpec = swaggerJSDoc(swaggerOptions);

app.get("/openapi.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(openapiSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Healthcheck
 *     responses:
 *       200:
 *         description: OK
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * @openapi
 * /:
 *   get:
 *     summary: Accueil
 *     responses:
 *       200:
 *         description: OK
 */
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Noble To Do App!" });
});

app.use("/todos", todoRouter);

// Global error handler
app.use((err, _req, res, _next) => {
  res.status(500).json({ detail: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT);
}

module.exports = app;