// components/Navbar.tsx
import { AuthButton } from '@/src/components/auth/auth-button'; 
import Link from 'next/link';
import "@/src/app/globals.css"

export const Navbar = () => {
    return (
        <nav className="flex justify-between items-center p-4 bg-black-800 text-white ">
            <Link href="/">
                <h1 className="text-lg font-bold text-primary">ivdepaste</h1>
            </Link>
            <AuthButton />
        </nav>
    );
};
