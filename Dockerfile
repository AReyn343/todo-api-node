# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./

# Cache npm (BuildKit) + installation de deps prod uniquement
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs -g 1001 \
 && adduser  -S nodeuser -u 1001 -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY app.js ./
COPY routes ./routes
COPY database ./database
COPY utils ./utils
COPY package*.json ./

RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "app.js"]