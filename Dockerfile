FROM node:8.10.0
WORKDIR /usr/src/app
COPY package*.json /
RUN npm install
COPY . .
EXPOSE 9000
CMD ["node -r esm", "src/server.js"]
