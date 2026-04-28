FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/rider-web/package.json apps/rider-web/package.json

RUN npm ci

COPY apps/rider-web apps/rider-web

WORKDIR /app/apps/rider-web

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


FROM nginx:1.27

COPY apps/rider-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/rider-web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]