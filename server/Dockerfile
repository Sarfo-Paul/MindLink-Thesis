# MindLink API — production image
#
# Render (Docker):
#   - Dockerfile path: server/Dockerfile
#   - Docker build context: server
# Env: DATABASE_URL, DIRECT_URL (Supabase), JWT_SECRET, CORS_ORIGIN, PORT (Render sets PORT)
# After first deploy, sync schema: Render Shell → npx prisma db push
#   (or add a one-off Release Command with the same, if you use migrations later use prisma migrate deploy)

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma/
COPY tsconfig.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

RUN chown -R node:node /app
USER node

EXPOSE 4000

CMD ["node", "dist/index.js"]
