# Use an official Node runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /op-bridge

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN yarn install

# Expose the port the app runs on
EXPOSE 3000

# Set up entrypoint script
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]