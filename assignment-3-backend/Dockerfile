# Base image (not sure if this will actually pull it from docker hub, but let's try)
FROM node:22.14-alpine3.20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY . .
RUN npm install

# Create and run with a non-system user!!!

# Create a user
RUN adduser -D user

RUN chmod 555 -R /app

RUN chmod 700 -R /home

USER user

# Expose the port
EXPOSE 8000

# Run the app
CMD ["node", "index.js"]