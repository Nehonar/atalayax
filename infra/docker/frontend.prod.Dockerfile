FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/frontend ./apps/frontend

ARG NEXT_PUBLIC_API_URL=https://api.atalayax.com/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm install --workspace @atalayax/frontend
WORKDIR /app/apps/frontend
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app /app
WORKDIR /app/apps/frontend
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
