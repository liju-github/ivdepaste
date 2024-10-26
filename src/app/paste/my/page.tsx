'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/providers/auth-provider';
import { supabase } from "@/src/lib/supabase";
import { useRouter } from 'next/navigation';
import { Paste } from '@/types';
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { MoreVertical, Trash2 } from "lucide-react";
import { format, subMinutes, subHours, subDays, subWeeks, subMonths, subYears } from "date-fns";

interface DateOption {
    label: string;
    value: Date;
}

const dateOptions: DateOption[] = [
    { label: "Last 30 Minutes", value: subMinutes(new Date(), 30) },
    { label: "Last Hour", value: subHours(new Date(), 1) },
    { label: "1 Day", value: subDays(new Date(), 1) },
    { label: "3 Days", value: subDays(new Date(), 3) },
    { label: "1 Week", value: subWeeks(new Date(), 1) },
    { label: "2 Weeks", value: subWeeks(new Date(), 2) },
    { label: "1 Month", value: subMonths(new Date(), 1) },
    { label: "3 Months", value: subMonths(new Date(), 3) },
    { label: "6 Months", value: subMonths(new Date(), 6) },
    { label: "1 Year", value: subYears(new Date(), 1) },
    { label: "Everything", value: subYears(new Date(), 10) },
];

// Separate component for dynamic content to prevent hydration mismatch
const FormattedDate: React.FC<{ date: string }> = ({ date }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span>Loading...</span>;
    }

    return <span>{format(new Date(date), "PPpp")}</span>;
};

const ExpirationStatus: React.FC<{ expiresAt: string | null }> = ({ expiresAt }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span>Loading...</span>;
    }

    if (!expiresAt) {
        return <span className="text-gray-500">No expiration</span>;
    }

    const isExpired = new Date(expiresAt) <= new Date();
    return (
        <span className={isExpired ? "text-red-500" : "text-green-500"}>
            {isExpired ? "Expired" : "Not expired"}
        </span>
    );
};

const HomePage: React.FC = () => {
    const { user, isLoading: authLoading, error: authError } = useAuth();
    const [pastes, setPastes] = useState<Paste[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const [rowSelection, setRowSelection] = useState<{ [key: number]: boolean }>({});
    const [searchTitle, setSearchTitle] = useState<string>('');
    const [searchContent, setSearchContent] = useState<string>('');
    const [selectedDateRange, setSelectedDateRange] = useState<string | null>(null);

    // Handle client-side initialization
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleDeleteSelected = async (): Promise<void> => {
        try {
            const selectedIds = Object.keys(rowSelection).map(
                index => pastes[parseInt(index)].id
            );

            const { error: deleteError } = await supabase
                .from('paste')
                .delete()
                .in('id', selectedIds);

            if (deleteError) throw deleteError;

            if (!user) {
                const storedIds: string[] = JSON.parse(localStorage.getItem("pasteIdArray") || "[]");
                const updatedIds = storedIds.filter(id => !selectedIds.includes(id));
                localStorage.setItem("pasteIdArray", JSON.stringify(updatedIds));
            }

            setPastes(prev => prev.filter(paste => !selectedIds.includes(paste.id)));
            setRowSelection({});
        } catch (err) {
            setError('Failed to delete pastes: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    // Fetch pastes only after authentication is ready
    useEffect(() => {
        const fetchPastes = async () => {
            if (authLoading) return;

            try {
                let query = supabase.from('paste').select('*');

                if (user) {
                    query = query.eq('userId', user.id);
                } else {
                    const pastesIdArray: string[] = JSON.parse(localStorage.getItem("pasteIdArray") || "[]");
                    if (pastesIdArray.length === 0) {
                        setPastes([]);
                        setLoading(false);
                        return;
                    }
                    query = query.in('id', pastesIdArray);
                }

                const { data, error } = await query.order('createdAt', { ascending: false });

                if (error) throw error;
                setPastes(data || []);
            } catch (err) {
                setError('Failed to fetch pastes: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
                setLoading(false);
            }
        };

        if (isClient) {
            fetchPastes();
        }
    }, [authLoading, user, isClient]);

    const handleDeletePaste = async (pasteId: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('paste')
                .delete()
                .eq('id', pasteId);

            if (deleteError) throw deleteError;

            if (!user) {
                const storedIds: string[] = JSON.parse(localStorage.getItem("pasteIdArray") || "[]");
                const updatedIds = storedIds.filter(id => id !== pasteId);
                localStorage.setItem("pasteIdArray", JSON.stringify(updatedIds));
            }

            setPastes(prev => prev.filter(p => p.id !== pasteId));
        } catch (err) {
            setError('Failed to delete paste: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const filteredPastes = pastes.filter(paste => {
        const matchesTitle = paste.title.toLowerCase().includes(searchTitle.toLowerCase());
        const matchesContent = paste.content.toLowerCase().includes(searchContent.toLowerCase());
        const createdDate = new Date(paste.createdAt);
        const matchesDateRange = selectedDateRange
            ? createdDate >= new Date(parseInt(selectedDateRange))
            : true;

        return matchesTitle && matchesContent && matchesDateRange;
    });

    if (!isClient) {
        return null;
    }

    if (authLoading) {
        return <div className="container mx-auto p-4 text-center">Loading authentication...</div>;
    }

    if (authError) {
        return <div className="container mx-auto p-4 text-center">Error: {authError.message}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Your Pastes</h1>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center py-4 gap-4">
                <Input
                    placeholder="Filter titles..."
                    value={searchTitle}
                    onChange={(event) => setSearchTitle(event.target.value)}
                    className="w-full md:max-w-xs"
                />

                <Input
                    placeholder="Filter content..."
                    value={searchContent}
                    onChange={(event) => setSearchContent(event.target.value)}
                    className="w-full md:max-w-xs"
                />

                <Select
                    onValueChange={(value) => setSelectedDateRange(value)}
                >
                    <SelectTrigger className="w-full md:max-w-xs">
                        <SelectValue placeholder="Select Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {dateOptions.map(option => (
                            <SelectItem
                                key={option.value.getTime()}
                                value={option.value.getTime().toString()}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {Object.keys(rowSelection).length > 0 && (
                    <Button
                        variant="destructive"
                        onClick={handleDeleteSelected}
                        className="w-full md:w-auto"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={
                                        filteredPastes.length > 0 &&
                                        Object.keys(rowSelection).length === filteredPastes.length
                                    }
                                    onCheckedChange={(value) => {
                                        if (value) {
                                            setRowSelection(
                                                Object.fromEntries(filteredPastes.map((_, i) => [i, true]))
                                            );
                                        } else {
                                            setRowSelection({});
                                        }
                                    }}
                                />
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Expiration Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPastes.map((paste, index) => (
                            <TableRow key={paste.id} className="hover:bg-muted">
                                <TableCell>
                                    <Checkbox
                                        checked={!!rowSelection[index]}
                                        onCheckedChange={(value) => {
                                            setRowSelection(prev => ({
                                                ...prev,
                                                [index]: !!value
                                            }));
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{paste.title}</TableCell>
                                <TableCell>
                                    {paste.content.split(' ').slice(0, 10).join(' ')}
                                    {paste.content.split(' ').length > 10 && '...'}
                                </TableCell>
                                <TableCell>
                                    <FormattedDate date={paste.createdAt} />
                                </TableCell>
                                <TableCell>
                                    <ExpirationStatus expiresAt={paste.expiresAt} />
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="w-8 h-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/view?pasteId=${paste.id}`)}>
                                                View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeletePaste(paste.id)}
                                                className="text-red-600"
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPastes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                    No pastes found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default HomePage;