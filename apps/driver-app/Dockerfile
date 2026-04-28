FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/driver-app/package.json apps/driver-app/package.json
RUN npm ci
COPY apps/driver-app apps/driver-app
WORKDIR /app/apps/driver-app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/driver-app/dist /usr/share/nginx/html
EXPOSE 80

