# Todo API

> Simple REST API CRUD pour la gestion de tâches (todos), construite avec **Express.js** et **SQLite** (sql.js).

[![CI – Production](https://github.com/AReyn343/todo-api-node/actions/workflows/ci-main.yml/badge.svg)](https://github.com/AReyn343/todo-api-node/actions/workflows/ci-main.yml)
[![CI – Staging](https://github.com/AReyn343/todo-api-node/actions/workflows/ci-develop.yml/badge.svg)](https://github.com/AReyn343/todo-api-node/actions/workflows/ci-develop.yml)
[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m802434029-todo-api-node)](https://stats.uptimerobot.com/802434029)
[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m802434029-todo-api-node)](https://stats.uptimerobot.com/802434029)

---

## 📋 Table des matières

- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer l'API](#lancer-lapi)
- [Docker](#docker)
- [Endpoints](#endpoints)
- [Documentation Swagger](#documentation-swagger)
- [Tests](#tests)
- [CI/CD](#cicd)

---

## Stack technique

- **Runtime** : Node.js 20
- **Framework** : Express.js 5
- **Base de données** : SQLite via sql.js (in-memory + persistance fichier)
- **Documentation** : Swagger UI (swagger-jsdoc + swagger-ui-express)
- **Sécurité** : Helmet
- **Observabilité** : Sentry
- **Tests** : Jest + Supertest
- **Lint** : ESLint 10 (flat config)
- **CI/CD** : GitHub Actions → Render.com
- **Conteneurisation** : Docker (multi-stage, non-root)
- **Monitoring** : UptimeRobot

---

## Prérequis

- Node.js >= 20
- npm >= 10

---

## Installation

```bash
git clone https://github.com/AReyn343/todo-api-node.git
cd todo-api-node
npm install
```

---

## Variables d'environnement

Copier le fichier exemple et l'adapter :

```bash
cp .env.example .env
```

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `PORT` | `3000` | Port d'écoute du serveur |
| `DB_PATH` | `todo.db` | Chemin vers le fichier SQLite |
| `NODE_ENV` | `development` | Environnement (`development`, `staging`, `production`) |
| `SENTRY_DSN` | _(vide)_ | DSN Sentry pour l'observabilité (optionnel) |

> ⚠️ Ne jamais committer le fichier `.env` — il est dans le `.gitignore`.

---

## Lancer l'API

```bash
npm start
```

L'API est disponible sur `http://localhost:3000`.

---

## Docker

```bash
# Build de l'image
docker build -t todo-api-node .

# Lancer le conteneur
docker run -p 3000:3000 -e NODE_ENV=production todo-api-node
```

L'image est aussi disponible sur GitHub Container Registry :

```bash
docker pull ghcr.io/areyn343/todo-api-node:latest
```

---

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/health` | Healthcheck |
| `GET` | `/` | Accueil |
| `GET` | `/todos` | Lister les todos (pagination : `?skip=0&limit=10`) |
| `POST` | `/todos` | Créer un todo |
| `GET` | `/todos/:id` | Récupérer un todo par ID |
| `PUT` | `/todos/:id` | Mettre à jour un todo |
| `DELETE` | `/todos/:id` | Supprimer un todo |
| `GET` | `/todos/search/all` | Rechercher par titre (`?q=keyword`) |

### Exemple — Créer un todo

```bash
curl -X POST https://todo-api-node-y2tg.onrender.com/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Acheter du pain", "description": "Boulangerie", "status": "pending"}'
```

Réponse :
```json
{
  "id": 1,
  "title": "Acheter du pain",
  "description": "Boulangerie",
  "status": "pending"
}
```

### Modèle Todo

```json
{
  "id": 1,
  "title": "string (requis)",
  "description": "string | null",
  "status": "pending | done"
}
```

---

## Documentation Swagger

La documentation interactive est disponible sur :

- **Production** : `https://todo-api-node-y2tg.onrender.com/docs`
- **Local** : `http://localhost:3000/docs`

---

## Tests

```bash
# Lancer les tests
npm test

# Avec rapport de coverage
npm run test:coverage
```

Coverage minimum requis : **70%** (lignes, fonctions, branches).

---

## CI/CD

Deux pipelines GitHub Actions :

### `ci-develop.yml` — Staging (branche `develop`)
1. Lint (ESLint)
2. Tests + Coverage
3. Security scan (npm audit + Trivy)
4. Build Docker + Trivy image scan
5. Deploy → Render staging
6. Smoke tests post-deploy
7. Notification Discord

### `ci-main.yml` — Production (branche `main`)
1. Lint (ESLint)
2. Tests + Coverage
3. SonarCloud Quality Gate
4. Security scan (npm audit + Trivy)
5. Build Docker + Trivy image scan + Push GHCR
6. Deploy → Render production
7. Smoke tests post-deploy
8. Notification Discord

### Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `RENDER_DEPLOY_HOOK` | URL du deploy hook Render (production) |
| `APP_URL` | URL de l'application en production |
| `STAGING_DEPLOY_HOOK` | URL du deploy hook Render (staging) |
| `STAGING_URL` | URL de l'application en staging |
| `SONAR_TOKEN` | Token SonarCloud |
| `CODECOV_TOKEN` | Token Codecov (optionnel) |
| `DISCORD_WEBHOOK` | Webhook Discord pour les notifications |
| `SENTRY_DSN` | DSN Sentry pour l'observabilité |