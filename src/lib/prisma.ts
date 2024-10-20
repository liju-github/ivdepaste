// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
async function applyMigrations() {
    try {
        // Apply migrations using Prisma's migrate deploy
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('Migrations applied successfully.');
    } catch (error) {
        console.error('Error applying migrations:', error);
    }
}

applyMigrations();

export default prisma;
