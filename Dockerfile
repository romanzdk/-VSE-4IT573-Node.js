FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm update npm -g
RUN npm config set strict-ssl true
RUN npm install
COPY . .
# RUN npm build
# EXPOSE 3000
# ENTRYPOINT npm run start
CMD [ "npm", "start" ]