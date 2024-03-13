# Use a minimal Linux distribution as the base image
FROM alpine:latest

# Install curl and Docker CLI
RUN apk --no-cache add curl docker-cli jq

# Set the working directory
WORKDIR /app

# Copy the configuration script into the image
COPY configure.sh /app/configure.sh

# Make the script executable
RUN chmod +x /app/configure.sh

# Define the entry point to run the configuration script
CMD ["/bin/sh", "/app/configure.sh"]