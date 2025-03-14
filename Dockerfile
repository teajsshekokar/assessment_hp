FROM node:23.2.0-alpine
WORKDIR /app
COPY package* /app
RUN npm install
COPY app.js /app
RUN mkdir -p public
COPY public /app/public/
EXPOSE 5001
CMD ["npm","start"]