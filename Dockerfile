FROM node:lts-slim AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package*.json pnpm-lock.yaml ./

FROM base as build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base as run
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist /app/dist
CMD [ "node", "dist/index.js" ]
