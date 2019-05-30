FROM node:10.16

RUN mkdir -p /home/app

WORKDIR /home/app

COPY package*.json ./

RUN npm install

COPY . .

RUN ls -lh

RUN npm test

CMD ["npm", "start"]

EXPOSE 3000