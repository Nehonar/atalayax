FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/backend ./apps/backend

RUN npm install --workspace @atalayax/backend

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["npm", "run", "dev"]
