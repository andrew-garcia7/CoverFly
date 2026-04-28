FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/admin-panel/package.json apps/admin-panel/package.json
RUN npm ci
COPY apps/admin-panel apps/admin-panel
WORKDIR /app/apps/admin-panel
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/admin-panel/dist /usr/share/nginx/html
EXPOSE 80

