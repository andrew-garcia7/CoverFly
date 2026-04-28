FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/config/package.json packages/config/package.json
COPY services/realtime-service/package.json services/realtime-service/package.json
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/config ./packages/config
COPY services/realtime-service ./services/realtime-service
RUN cd packages/config && npx tsc -p tsconfig.json
RUN cd services/realtime-service && npx tsc -p tsconfig.json

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/config/dist ./node_modules/@coverfly/config/dist
COPY --from=build /app/services/realtime-service/dist ./dist
COPY services/realtime-service/package.json ./package.json
EXPOSE 4010
CMD ["node","dist/index.js"]

