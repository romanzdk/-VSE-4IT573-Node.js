FROM node
COPY . .
RUN npm install
RUN npm build
EXPOSE 3000
ENTRYPOINT npm run start