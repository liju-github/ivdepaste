// components/Navbar.tsx
import { AuthButton } from '@/src/components/auth/auth-button'; 
import Link from 'next/link';

export const Navbar = () => {
    return (
        <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <Link href="/">
                <h1 className="text-lg font-bold">Pastebin App</h1>
            </Link>
            <AuthButton />
        </nav>
    );
};
