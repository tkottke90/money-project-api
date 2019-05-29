FROM node:10.16

WORKDIR /home/app

COPY package*.json .

RUN npm install

COPY . .

RUN ls -lh

RUN npm test

CMD ["npm", "start"]

EXPOSE 3030