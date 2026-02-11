# Using Node LTS
FROM node:18-alpine

# Setting working dir
WORKDIR /app

# Copying package.json and package-lock.json
COPY package*.json ./

# Installing dependencies (Production)
RUN npm ci --omit=dev

# Copying backend source code
COPY . .

# Expose at port
EXPOSE 5000

# Starting server
CMD ["node", "server.js"]