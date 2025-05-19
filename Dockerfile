# Użyj obrazu Node.js 20 jako bazowego
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY public ./public
COPY next.config.ts ./
COPY src ./src
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./

RUN npm install

RUN npm run build

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"] 