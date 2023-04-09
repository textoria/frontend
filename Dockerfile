FROM node:19

ENV PORT 3000

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn set version berry

RUN yarn install

COPY . /usr/src/app

EXPOSE 3000
CMD [ "yarn", "dev" ]