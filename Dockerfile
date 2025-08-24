## Production Dockerfile for Telaclass
## Multi-stage build to keep runtime image slim.
## Expects content/disciplinas to be present in build context (script ensures this).

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --package-lock-only --no-audit --no-fund \
  && npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --package-lock-only --no-audit --no-fund \
  && npm ci --no-audit --no-fund
## Copy source AFTER installing deps for better layer caching
COPY . .
## Garante diretório de conteúdo (pode estar vazio no repo)
RUN mkdir -p content/disciplinas
## Gera o manifest (ignora falhas eventualmente se não houver conteúdo)
RUN NODE_OPTIONS= node scripts/gen-mdx-manifest.cjs || true
## Build Next.js (usa conteúdo presente no contexto para compilar MDX)
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
## Copia apenas o necessário para execução
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
## (Opcional) copiar next.config.ts se usado para runtime features
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "start"]
