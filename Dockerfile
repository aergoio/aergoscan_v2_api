FROM node:18-alpine

ARG ARG_SELECTED_NETWORK
ARG ARG_ES_URL
ARG ARG_HTTP_PORT
ARG ARG_HOST_API

ENV SELECTED_NETWORK ${ARG_SELECTED_NETWORK}
ENV ES_URL ${ARG_ES_URL}
ENV HTTP_PORT ${ARG_HTTP_PORT}
ENV HOST_API ${ARG_HOST_API}

WORKDIR /aergoscan-api
RUN apk add python3>3.10.13 g++ make

COPY package* ./
RUN rm -rf node_modules package-lock.json
RUN npm install
RUN npm dedupe

COPY .babelrc .env chaininfo.json ./
COPY bin/ bin/
COPY api-docs/ api-docs/
COPY swagger/ swagger/
COPY src/ src/

ENTRYPOINT SELECTED_NETWORK=${SELECTED_NETWORK} ES_URL=${ES_URL} HTTP_PORT=${HTTP_PORT} HOST_API=${HOST_API} node bin/server.js
EXPOSE ${HTTP_PORT}
