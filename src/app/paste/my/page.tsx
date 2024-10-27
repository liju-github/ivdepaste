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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Eye, Pencil, Share2, Trash2, Check, Copy } from "lucide-react";
import { format, subMinutes, subHours, subDays, subWeeks, subMonths, subYears } from "date-fns";
import { toast } from 'sonner';

interface DateOption {
    label: string;
    value: Date;
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    pasteId: string;
}

// Moved ShareModal outside of HomePage
const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, pasteId }) => {
    const [copied, setCopied] = useState(false);
    // Check if window is defined (client-side)
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/view?pasteId=${pasteId}`
        : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Paste</DialogTitle>
                    <DialogDescription>
                        Anyone with this link can view your paste
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-4">
                    <Input
                        readOnly
                        value={shareUrl}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

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
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedPasteId, setSelectedPasteId] = useState<string>('');

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
            toast.success('Selected pastes deleted successfully');
        } catch (err) {
            setError('Failed to delete pastes: ' + (err instanceof Error ? err.message : String(err)));
            toast.error('Failed to delete pastes');
        }
    };

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
                toast.error('Failed to fetch pastes');
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
            toast.success('Paste deleted successfully');
        } catch (err) {
            setError('Failed to delete paste: ' + (err instanceof Error ? err.message : String(err)));
            toast.error('Failed to delete paste');
        }
    };

    const handleShare = (pasteId: string) => {
        setSelectedPasteId(pasteId);
        setShareModalOpen(true);
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
                            <TableHead className="w-[180px]">Actions</TableHead>
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
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/view?pasteId=${paste.id}`)}
                                            title="View"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/edit?pasteId=${paste.id}`)}
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleShare(paste.id)}
                                            title="Share"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeletePaste(paste.id)}
                                            className="text-red-600 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
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

            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                pasteId={selectedPasteId}
            />
        </div>
    );
};

export default HomePage;