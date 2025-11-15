# ===============================
# 1️⃣ Build Stage (TypeScript → JS)
# ===============================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (include devDeps for build)
RUN npm ci

# Copy source code
COPY . .

# Copy environment for Prisma generation
COPY .env ./

# Generate Prisma client and build TypeScript
ENV NODE_ENV=production
RUN npx prisma generate
RUN npx prisma db push
RUN npm run build
RUN npx tsc-alias 
CMD ["node", "dist/src/server.js"]