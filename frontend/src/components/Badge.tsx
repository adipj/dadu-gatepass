export const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-200 text-yellow-800',
        APPROVED: 'bg-green-200 text-green-800',
        REJECTED: 'bg-red-200 text-red-800',
        EXPIRED: 'bg-gray-200 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs rounded ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
};