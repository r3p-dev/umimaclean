FROM docker.io/library/node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN node ace build

FROM docker.io/library/node:24-slim AS release
WORKDIR /app
COPY --from=build /app/build ./
RUN npm ci --omit=dev && npm cache clean --force \
  && mkdir -p storage/proofs && chown -R node:node storage

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

USER node
EXPOSE 3333/tcp
CMD [ "node", "bin/server.js" ]
