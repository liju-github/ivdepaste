'use client';

import Link from 'next/link';
import { AuthButton } from '@/src/components/auth/auth-button';

export const Navbar: React.FC = () => {
    return (
        <nav className="flex flex-col p-4">
            <div className="flex justify-between items-center w-full">
                <Link href="/">
                    <h1 className="text-lg font-bold">ivdepaste</h1>
                </Link>
                <AuthButton />
            </div>
        </nav>
    );
};

export default Navbar;
