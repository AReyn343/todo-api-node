const { Router } = require("express");
const { getDb, saveDb } = require("../database/database");
const { toObj, toArray } = require("../utils/helpers");


const router = Router();

/**
 * @openapi
 * /todos:
 *   post:
 *     summary: Créer un to-do
 *     responses:
 *       201:
 *         description: Todo created
 *       422:
 *         description: Validation error
 */
// POST /todos
router.post("/", async (req, res) => {
  const { title, description = null, status = "pending" } = req.body;
  if (!title) {
    return res.status(422).json({ detail: "title is required" });
  }
  const db = await getDb();
  db.run("INSERT INTO todos (title, description, status) VALUES (?, ?, ?)", [title, description, status]);
  const id = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
  const row = db.exec("SELECT * FROM todos WHERE id = ?", [id]);
  saveDb();
  const todo = toObj(row);
  res.status(201).json(todo);
});

/**
 * @openapi
 * /todos:
 *   get:
 *     summary: Liste des to-dos
 *     responses:
 *       200:
 *         description: List of todos
 */
// GET /todos
router.get("/", async (req, res) => {
  const skip = Number.parseInt(req.query.skip) || 0;
  const limit = Number.parseInt(req.query.limit) || 10;
  const db = await getDb();
  const rows = db.exec("SELECT * FROM todos LIMIT ? OFFSET ?", [limit, skip]);
  const x = toArray(rows);
  res.json(x);
});

/**
 * @openapi
 * /todos/search/all:
 *   get:
 *     summary: Chercher un to-do par son titre
 *     responses:
 *       200:
 *         description: Search results
 */
// déplacement du endpoint au dessus de /:id pour éviter les conflits de routing
router.get("/search/all", async (req, res) => {
  const q = req.query.q || "";
  const db = await getDb();
  const results = db.exec("SELECT * FROM todos WHERE title LIKE ?", [`%${q}%`]);
  res.json(toArray(results));
});

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     summary: Accéder à un to-do par son id
 *     responses:
 *       200:
 *         description: Todo found
 *       404:
 *         description: Todo not found
 */
// GET /todos/:id
router.get("/:id", async (req, res) => {
  const db = await getDb();
  const rows = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!rows.length || !rows[0].values.length)
    return res.status(404).json({ detail: "Todo not found" });
  res.json(toObj(rows));
});

/**
 * @openapi
 * /todos/{id}:
 *   put:
 *     summary: Editer un to-do
 *     responses:
 *       200:
 *         description: Todo updated
 *       404:
 *         description: Todo not found
 */
// PUT /todos/:id
router.put("/:id", async (req, res) => {
  const db = await getDb();
  const existing = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!existing.length || !existing[0].values.length)
    return res.status(404).json({ detail: "Todo not found" });

  const old = toObj(existing);
  const title = req.body.title ?? old.title;
  const description = req.body.description ?? old.description;
  const status = req.body.status ?? old.status;

  db.run(
      "UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ?",
      [title, description, status, req.params.id]
  );
  const rows = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  saveDb();
  res.json(toObj(rows));
});

/**
 * @openapi
 * /todos/{id}:
 *   delete:
 *     summary: Supprimer un to-do
 *     responses:
 *       200:
 *         description: Todo deleted
 *       404:
 *         description: Todo not found
 */
// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  const db = await getDb();
  const existing = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!existing.length || !existing[0].values.length)
    return res.status(404).json({ detail: "Todo not found" });
  db.run("DELETE FROM todos WHERE id = ?", [req.params.id]);
  saveDb();
  res.json({ detail: "Todo deleted" });
});

module.exports = router;