const express = require("express");
const todoRouter = require("./routes/todo");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Noble To Do App!" });
});

app.use("/todos", todoRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
