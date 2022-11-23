FROM node:18-alpine as base

WORKDIR /app
COPY package*.json ./
EXPOSE 3000 9000
ENV WS_SERVER_PORT=9000
ENV EXPRESS_SERVER_PORT=3000

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . .
CMD ["node", "server/index.js"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . .
CMD ["nodemon", "server/index.js"]
