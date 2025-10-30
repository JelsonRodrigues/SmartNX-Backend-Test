FROM docker.io/node:25 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm prune --production

FROM docker.io/node:25-slim AS runner
WORKDIR /app
COPY --from=builder /app ./
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}
CMD ["npm", "run", "start"]