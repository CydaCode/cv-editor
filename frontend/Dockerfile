# BUILDER STAGE...............

FROM node:18-bullseye AS builder 

WORKDIR /app

# Copy and Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copying source
COPY . .

# Build Next.js
RUN npm run build



# RUNTIME STAGE...............

FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copying only what is needed at runtime
COPY --from=builder /app/.next ./.next 
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose Next.js port
EXPOSE 3000

#Start Next.js
CMD ["npm", "start"]