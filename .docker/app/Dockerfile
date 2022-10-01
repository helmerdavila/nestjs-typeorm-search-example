FROM node:16-alpine

ENV NODE_ENV development

RUN apk update && apk add build-base
WORKDIR /application

COPY --chown=node:node package*.json ./

RUN npm install -g npm@8.19.2
RUN npm install -g @nestjs/cli@9.1.4
RUN npm ci

COPY --chown=node:node . .

USER node
