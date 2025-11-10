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

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build


# ===============================
# 2️⃣ Production Stage
# ===============================
FROM node:20-alpine AS production

# Set environment variables
ENV NODE_ENV=production
WORKDIR /app

# Copy only needed files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Expose the backend port
EXPOSE 3000

# Run the built server
CMD ["node", "dist/server.js"]
