# syntax=docker/dockerfile:1

FROM node:22-alpine as build
RUN mkdir /app
WORKDIR /app
# Copy app into build container and build release
COPY . .
RUN npm install && npm run build

FROM joseluisq/static-web-server:2-alpine
# Add curl for health check
RUN apk add --no-cache curl
# Copy built app into static webserver container
COPY --from=build /app/dist /public
# Enable /health endpoint
ENV SERVER_HEALTH=true
# Set start period for quicker start check intervals of 5s
HEALTHCHECK --start-period=30s --start-interval=5s CMD curl --fail http://localhost/health || exit 1
