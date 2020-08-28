FROM node:14.8-alpine

WORKDIR /app

COPY package.json .

RUN yarn --prod

COPY . .

CMD [ "node", "index.js" ]
