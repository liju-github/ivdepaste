import { PrismaClient } from "@prisma/client";
import os from 'os'; 

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database initialization...');

    
    console.log('Granting permissions to anon role...');

    
    await prisma.$executeRaw`
    GRANT USAGE ON SCHEMA public TO anon;
  `;

      
      await prisma.$executeRaw`
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
  `;

      
      await prisma.$executeRaw`
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO anon;
  `;

      
      await prisma.$executeRaw`
    GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
  `;

      await prisma.$executeRaw`
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON SEQUENCES TO anon;
  `;


      
      console.log('Granting permissions to authenticated role...');

      
      await prisma.$executeRaw`
    GRANT USAGE ON SCHEMA public TO authenticated;
  `;

      
      await prisma.$executeRaw`
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
  `;

      
      await prisma.$executeRaw`
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
  `;

      
      await prisma.$executeRaw`
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
  `;

      await prisma.$executeRaw`
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
  `;

    console.log('Permissions granted successfully.');


    
    const serverIp = getServerIp();

    
    console.log('Inserting sample data...');
    await prisma.connectionTime.create({
      data: {
        connectionTime: new Date(),
        clientIp: serverIp, 
      }
    });

    
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


function getServerIp() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address; 
      }
    }
  }
  return '127.0.0.1'; 
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
