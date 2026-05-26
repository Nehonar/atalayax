FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/backend ./apps/backend

RUN npm install --workspace @atalayax/backend
WORKDIR /app/apps/backend
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app /app
WORKDIR /app/apps/backend
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
