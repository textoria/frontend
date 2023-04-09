FROM node:18

WORKDIR /app

COPY . .

RUN yarn set version berry

RUN yarn install

EXPOSE 3000

CMD ["yarn", "next", "dev"]