import { PrismaClient } from "@prisma/client";
import os from 'os'; // Import os module to get server's local IP address

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database initialization...');

    // Grant permissions to roles (optional)
    console.log('Granting permissions...');
    await prisma.$executeRaw`
      GRANT USAGE ON SCHEMA "public" TO anon;
    `;
    await prisma.$executeRaw`
      GRANT USAGE ON SCHEMA "public" TO authenticated;
    `;

    // Create the connection_time table (if it doesn't exist)
    console.log('Creating connection_time table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "connection_time" (
        id SERIAL PRIMARY KEY,
        connection_time timestamp DEFAULT CURRENT_TIMESTAMP,
        server_ip VARCHAR(255)
      );
    `;

    // Get the local server IP address (using os module)
    const serverIp = getServerIp();

    // Insert the current time and server IP as the connection time
    console.log('Inserting sample data...');
    await prisma.connectionTime.create({
      data: {
        connectionTime: new Date(),
        clientIp: serverIp, // Store the server's local IP
      }
    });

    // Verify data
    const result = await prisma.connectionTime.findMany();
    console.log('Connection Time Table Data:', result);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to get the server's local IP address
function getServerIp() {
  const networkInterfaces = os.networkInterfaces();
  // Loop through network interfaces to find the local IPv4 address
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address; // Return the first non-internal IPv4 address
      }
    }
  }
  return '127.0.0.1'; // Default to localhost if no external IP found
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
