FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY index.js ./
COPY src ./src
RUN mkdir -p /data/uploads/avatars && chown -R node:node /data
ENV NODE_ENV=production PORT=3000 UPLOAD_DIR=/data/uploads
USER node
EXPOSE 3000
CMD ["node", "index.js"]
