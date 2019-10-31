FROM node:12

RUN mkdir -p /home/app

WORKDIR /home/app

COPY package*.json ./

RUN npm install

COPY . .

RUN ls -lh

CMD ["npm", "start", "--prod"]

EXPOSE 3000