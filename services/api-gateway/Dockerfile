FROM node:20 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY services/api-gateway/package.json services/api-gateway/package.json
RUN npm ci

FROM node:20 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY services/api-gateway ./services/api-gateway
WORKDIR /app/services/api-gateway
RUN npx tsc -p tsconfig.json

FROM node:20 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/services/api-gateway/dist ./dist
COPY services/api-gateway/package.json ./package.json
EXPOSE 4000
CMD ["node","dist/index.js"]

