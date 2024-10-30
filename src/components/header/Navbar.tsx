'use client';

import Link from 'next/link';
import { AuthButton } from '@/src/components/auth/auth-button';
import { applicationName } from '@/types';

export const Navbar: React.FC = () => {
    return (
        <nav className="flex flex-col p-4">
            <div className="flex justify-between items-center w-full">
                <Link href="/">
                    <h1 className="text-lg font-bold">{applicationName}</h1>
                </Link>
                <AuthButton />
            </div>
        </nav>
    );
};

export default Navbar;
