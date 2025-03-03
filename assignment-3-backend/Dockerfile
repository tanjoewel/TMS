# Base image (not sure if this will actually pull it from docker hub, but let's try)
FROM node:22.14.0-alpine3.21

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY . .
RUN npm install

# Create and run with a non-system user!!!

# Expose the port
EXPOSE 8000

# Run the app
CMD ["node", "index.js"]