# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vue SPA to static files ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first so this layer is cached while only source changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage: serve dist/ with nginx ----
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3300

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3300/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
