FROM node:14-alpine

ENTRYPOINT node bin/server.js
EXPOSE ${HTTP_PORT}

WORKDIR /aergoscan-api
RUN apk add python3>3.10.13 g++ make

COPY package* ./
RUN npm install

COPY .babelrc .env chaininfo.json ./
COPY bin/ bin/
COPY api-docs/ api-docs/
COPY swagger/ swagger/
COPY src/ src/

ENV SELECTED_NETWORK="local" \
    ES_URL="aergoscan-es-blue:9200" \
    HTTP_PORT="3000" \
    HOST_API="http://api2-local.aergoscan.io"