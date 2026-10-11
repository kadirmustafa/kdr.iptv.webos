FROM node:20-alpine

WORKDIR /app

COPY server.js ./
COPY index.html ./
COPY privacy.html ./

EXPOSE 3001

CMD ["node", "server.js"]
