FROM node:18

WORKDIR /app

COPY . ./

RUN yarn set version berry

RUN yarn

CMD ["yarn", "next", "dev"]