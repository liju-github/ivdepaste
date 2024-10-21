# Use official Node.js image as the base image
FROM node:18-alpine

# Install PostgreSQL client (psql)
RUN apk add --no-cache postgresql-client

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files into the container
COPY . .

# Generate Prisma client (ensure the correct binary target is used)
RUN npx prisma generate

# Push the Prisma schema to the database
RUN npx prisma db push --accept-data-loss

# Run the database initialization
RUN npm run supabaseinit


# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
