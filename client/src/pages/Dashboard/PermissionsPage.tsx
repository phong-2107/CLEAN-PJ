import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Filter, Lock, Edit, Trash2 } from 'lucide-react';
import permissionService, { Permission } from '../../services/permissionService';

export const PermissionsPage = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setIsLoading(true);
            const data = await permissionService.getAll();
            if (!data || data.length === 0) {
                setPermissions([
                    { id: '1', name: 'users.view', description: 'Can view users list', group: 'Users' },
                    { id: '2', name: 'users.manage', description: 'Can create/edit/delete users', group: 'Users' },
                    { id: '3', name: 'products.view', description: 'Can view products', group: 'Products' },
                    { id: '4', name: 'products.manage', description: 'Can manage products', group: 'Products' },
                    { id: '5', name: 'orders.view', description: 'Can view orders', group: 'Orders' },
                ]);
            } else {
                setPermissions(data);
            }
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            setPermissions([
                { id: '1', name: 'users.view', description: 'Can view users list', group: 'Users' },
                { id: '2', name: 'users.manage', description: 'Can create/edit/delete users', group: 'Users' },
                { id: '3', name: 'products.view', description: 'Can view products', group: 'Products' },
                { id: '4', name: 'products.manage', description: 'Can manage products', group: 'Products' },
                { id: '5', name: 'orders.view', description: 'Can view orders', group: 'Orders' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<Permission>[] = [
        {
            key: 'name',
            header: 'Permission Code',
            render: (perm) => (
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span className="font-mono text-sm text-gray-700">{perm.name}</span>
                </div>
            ),
        },
        {
            key: 'group',
            header: 'Group',
            render: (perm) => (
                <Badge variant="default" className="bg-blue-50 text-blue-700">
                    {perm.group || 'System'}
                </Badge>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (perm) => <span className="text-gray-500">{perm.description || '-'}</span>,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
                    <p className="text-gray-500 mt-1">System capabilities and access control.</p>
                </div>
                <Button className="gap-2 bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4" />
                    New Permission
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search permissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button variant="secondary" className="gap-2 flex-1 sm:flex-none">
                                <Filter className="h-4 w-4" />
                                Group
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={permissions}
                        emptyMessage={isLoading ? "Loading permissions..." : "No permissions found"}
                        renderActions={() => (
                            <div className="flex justify-end gap-2">
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
