# syntax=docker/dockerfile:1
# Сборка сайта на Node LTS → раздача статикой через nginx.
# Флаги сборки (SITE_URL, PUBLIC_INDEXING, ADS_ENABLED, PRO_ENABLED) передаются как build args — см. docker-compose.yml.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
ARG SITE_URL=https://converter.hotbar.pro
ARG PUBLIC_INDEXING=false
ARG ADS_ENABLED=false
ARG PRO_ENABLED=false
ENV SITE_URL=$SITE_URL PUBLIC_INDEXING=$PUBLIC_INDEXING ADS_ENABLED=$ADS_ENABLED PRO_ENABLED=$PRO_ENABLED
RUN npm run build \
 && find dist -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.wasm' -o -name '*.svg' \
      -o -name '*.xml' -o -name '*.txt' -o -name '*.json' \) -size +1k -exec gzip -9 -k {} +

FROM nginx:1.30-alpine
ARG PUBLIC_INDEXING=false
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/snippets/ /etc/nginx/snippets/
RUN if [ "$PUBLIC_INDEXING" = "true" ]; then : > /etc/nginx/snippets/robots.conf; \
    else echo 'add_header X-Robots-Tag "noindex, nofollow" always;' > /etc/nginx/snippets/robots.conf; fi \
 && nginx -t
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
