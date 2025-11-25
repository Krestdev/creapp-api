# ---- Build Stage ----
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npx prisma generate && \
  npm run build

# ---- Runtime Stage ----
FROM base AS runtime

WORKDIR /app

# Copy built files
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
# COPY --from=base /app/generated/prisma ./generated/prisma
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/build ./build

# Copy runtime code if needed
COPY --from=base /app/src ./src

# Install production-only dependencies
# (optional if you've already installed them above)
# RUN npm ci --omit=dev

# Wait-for script (can also be added via volume or Dockerfile ADD)
ADD https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for /wait-for
RUN chmod +x /wait-for

EXPOSE 5000

# Run prisma migrations and start app after MySQL is up
# CMD sh -c "/wait-for ${DB_HOST:-localhost}:${DB_PORT:-3306} --timeout=360 -- \
#   npx prisma migrate deploy && \
#   npm run start"

# CMD sh -c "npx prisma migrate reset --force && npx prisma migrate deploy && \
#   npm run start"
CMD sh -c "npx prisma migrate deploy && \
  npm run start"

