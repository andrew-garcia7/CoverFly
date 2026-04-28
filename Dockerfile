FROM node:20

WORKDIR /app

COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

COPY apps ./apps
COPY services ./services
COPY packages ./packages

RUN npm install

EXPOSE 5173

CMD ["sh","-c","npm run dev --workspace=apps/rider-web -- --host 0.0.0.0 --port 5173"]
