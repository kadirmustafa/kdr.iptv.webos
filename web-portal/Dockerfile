FROM node:24-alpine

WORKDIR /app

COPY server.js ./
COPY index.html ./
COPY privacy.html ./

EXPOSE 3001

CMD ["node", "server.js"]

# rebuild 2026-11-12: Node.js November 2026 security release (llhttp/undici/sqlite)
