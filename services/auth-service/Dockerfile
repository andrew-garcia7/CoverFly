FROM node:20 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/common/package.json packages/common/package.json
COPY packages/config/package.json packages/config/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm ci

FROM node:20 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/common ./packages/common
COPY packages/config ./packages/config
COPY services/auth-service ./services/auth-service
RUN cd packages/common && npx tsc -p tsconfig.json
RUN cd packages/config && npx tsc -p tsconfig.json
RUN cd services/auth-service && npx tsc -p tsconfig.json

FROM node:20 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/common ./packages/common
COPY --from=build /app/packages/config ./packages/config
COPY --from=build /app/packages/common/dist ./node_modules/@coverfly/common/dist
COPY --from=build /app/packages/config/dist ./node_modules/@coverfly/config/dist
COPY --from=build /app/services/auth-service/dist ./dist
COPY services/auth-service/package.json ./package.json
EXPOSE 4001
CMD ["node","dist/index.js"]

