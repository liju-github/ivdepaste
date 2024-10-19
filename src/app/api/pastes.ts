import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/lib/prisma'; // Make sure this is the correct import for your Prisma client

// API handler to fetch pastes for a user
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        // Only allow GET requests
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;

        // Validate that the userId is provided
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch pastes for the user from the database
        const pastes = await prisma.paste.findMany({
            where: { userId: userId },  // Assuming userId is a string and corresponds to the user in your database
            orderBy: { createdAt: 'desc' }, // Sort pastes by creation date in descending order
        });

        // Return the fetched pastes as a JSON response
        res.status(200).json(pastes);
    } catch (error) {
        console.error('Error fetching pastes:', error);
        res.status(500).json({ error: 'Error fetching pastes' });
    }
}
