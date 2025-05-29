# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of the code
COPY . .

# Use dotenv-safe or dotenv in your app to load .env
# (Optional: add entry in server.mjs to load .env)

# Expose the desired port (change if needed)
EXPOSE 8080

# Set environment variable for port (Cloud Run uses 8080)
ENV PORT=8080

# Run the server
CMD ["node", "server.mjs"]