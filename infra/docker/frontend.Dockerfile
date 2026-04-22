FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/frontend ./apps/frontend

RUN npm install --workspace @atalayax/frontend

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["npm", "run", "dev"]
