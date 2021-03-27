FROM node:14-slim AS build-env
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .

RUN yarn proto
RUN yarn build


FROM node:14-alpine
WORKDIR /usr/src/app

LABEL org.opencontainers.image.source https://github.com/twin-te/callback-handler

COPY --from=build-env /usr/src/app/dist ./dist
COPY --from=build-env /usr/src/app/generated ./generated

COPY --from=build-env /usr/src/app/services/user-service/protos/ ./services/user-service/protos/
COPY --from=build-env /usr/src/app/services/session-service/protos/ ./services/session-service/protos/

COPY --from=build-env /usr/src/app/package.json .
COPY --from=build-env /usr/src/app/yarn.lock .

RUN yarn install --prod

EXPOSE 3001

CMD ["node", "dist/index.js"]