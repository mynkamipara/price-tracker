# Dockerfile
# Use the official Node.js image as a base
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code to the container image
COPY . .

RUN chmod +x wait-for-it.sh

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Run the web service on container startup
CMD ["npm", "run", "start:prod"]
