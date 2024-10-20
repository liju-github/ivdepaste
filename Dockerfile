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

# Ensure Prisma is generating the client before running the app
RUN npx prisma generate

# Copy the dbsetup.sql file into the container
COPY ./database/dbsetup.sql /tmp/dbsetup.sql

# Copy the init script into the container
COPY ./database/init-db.sh /init-db.sh
RUN chmod +x /init-db.sh

# Verify the contents of dbsetup.sql and log
RUN echo "Contents of dbsetup.sql:" && cat /tmp/dbsetup.sql


# Verify the contents of init-db.sh and log
RUN echo "Contents of init-db.sh:" && cat /init-db.sh 

# Expose the port the app will run on
EXPOSE 3000

# Run the app and then the init script
CMD ["sh", "-c", "/init-db.sh && npm run dev"]
