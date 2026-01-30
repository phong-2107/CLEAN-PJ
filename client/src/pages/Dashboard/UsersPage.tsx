import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Filter, Shield, Trash2, Edit } from 'lucide-react';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    lastActive: string;
}

const mockUsers: User[] = [
    { id: '1', fullName: 'Sarah Johnson', email: 'sarah@example.com', role: 'Admin', status: 'active', lastActive: '2 mins ago' },
    { id: '2', fullName: 'Michael Chen', email: 'michael@example.com', role: 'Manager', status: 'active', lastActive: '1 hour ago' },
    { id: '3', fullName: 'Emma Wilson', email: 'emma@example.com', role: 'User', status: 'inactive', lastActive: '2 days ago' },
    { id: '4', fullName: 'James brown', email: 'james@example.com', role: 'User', status: 'active', lastActive: '5 mins ago' },
    { id: '5', fullName: 'Lisa Anderson', email: 'lisa@example.com', role: 'Manager', status: 'active', lastActive: '1 day ago' },
];

export const UsersPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const columns: Column<User>[] = [
        {
            key: 'fullName',
            header: 'User',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar fallback={user.fullName} size="sm" />
                    <div>
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (user) => (
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">{user.role}</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (user) => (
                <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                    {user.status}
                </Badge>
            ),
        },
        {
            key: 'lastActive',
            header: 'Last Active',
            render: (user) => (
                <span className="text-sm text-gray-500">{user.lastActive}</span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500 mt-1">Manage user access and roles.</p>
                </div>
                <Button className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20">
                    <Plus className="h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-inter"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button variant="secondary" className="gap-2 flex-1 sm:flex-none">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={mockUsers}
                        renderActions={() => (
                            <div className="flex justify-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
};
