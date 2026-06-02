# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Install OS dependencies and Bun
RUN apt-get update && apt-get install -y curl unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Set the working directory in the container
WORKDIR /app

# Copy the entire project into the container
COPY . .

# ================================
# 1. Setup the Barcode Pipeline  
# ================================
WORKDIR /app/barcode-pipeline
# Install the exact dependencies for the bun pipeline
RUN bun install

# ================================
# 2. Setup the Next.js Dashboard  
# ================================
WORKDIR /app/dashboard
# Install Node dependencies for the dashboard
RUN npm install

# Build the Next.js application for production
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Next.js starts up automatically on this port 
ENV PORT=3000
# Ensure Next.js can connect
ENV HOST=0.0.0.0

# Start the dashboard
CMD ["npm", "start"]
