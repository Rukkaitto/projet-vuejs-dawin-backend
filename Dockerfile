FROM node:10-slim

WORKDIR /app/api

RUN npm install -g nodemon

COPY package*.json ./

RUN npm ci \
 && npm cache clean --force \
 && mv /app/api/node_modules /node_modules

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
