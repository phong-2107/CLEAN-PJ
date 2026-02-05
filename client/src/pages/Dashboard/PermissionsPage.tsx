import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Filter, Lock, Trash2, Eye, Key, RefreshCw, Loader2 } from 'lucide-react';
import permissionService from '../../services/permissionService';
import { Permission } from '../../types/role';
import { PermissionDetailModal, PermissionFormModal } from '../../components/modals';
import { cn } from '../../utils/cn';

export const PermissionsPage = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Detail Modal state
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Create Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setIsLoading(true);
            const data = await permissionService.getAll();
            if (!data || data.length === 0) {
                setPermissions([
                    { id: '1', name: 'users.view', description: 'Can view users list', group: 'Users', resource: 'Users', action: 'View' },
                    { id: '2', name: 'users.manage', description: 'Can create/edit/delete users', group: 'Users', resource: 'Users', action: 'Manage' },
                    { id: '3', name: 'products.view', description: 'Can view products', group: 'Products', resource: 'Products', action: 'View' },
                    { id: '4', name: 'products.manage', description: 'Can manage products', group: 'Products', resource: 'Products', action: 'Manage' },
                    { id: '5', name: 'orders.view', description: 'Can view orders', group: 'Orders', resource: 'Orders', action: 'View' },
                ]);
            } else {
                setPermissions(data);
            }
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            setPermissions([
                { id: '1', name: 'users.view', description: 'Can view users list', group: 'Users', resource: 'Users', action: 'View' },
                { id: '2', name: 'users.manage', description: 'Can create/edit/delete users', group: 'Users', resource: 'Users', action: 'Manage' },
                { id: '3', name: 'products.view', description: 'Can view products', group: 'Products', resource: 'Products', action: 'View' },
                { id: '4', name: 'products.manage', description: 'Can manage products', group: 'Products', resource: 'Products', action: 'Manage' },
                { id: '5', name: 'orders.view', description: 'Can view orders', group: 'Orders', resource: 'Orders', action: 'View' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle row click
    const handleRowClick = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsDetailModalOpen(true);
    };

    // Handle create permission
    const handleCreatePermission = async (data: { name: string; description: string; resource: string; action: string }) => {
        // In a real app, this would call the backend API
        console.log('Creating permission:', data);

        // For demo: add to local state
        const newPermission: Permission = {
            id: String(Date.now()),
            name: data.name,
            description: data.description,
            resource: data.resource,
            action: data.action,
            group: data.resource
        };
        setPermissions(prev => [...prev, newPermission]);
    };

    // Filter permissions
    const filteredPermissions = permissions.filter(perm =>
        perm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.group?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<Permission>[] = [
        {
            key: 'name',
            header: 'Permission Code',
            render: (perm) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <Key className="h-4 w-4 text-blue-600" />
                    </div>
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
        {
            key: 'view',
            header: '',
            width: '60px',
            render: () => (
                <div className="flex items-center justify-center">
                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Lock className="h-6 w-6 text-primary-600" />
                        Permissions
                    </h1>
                    <p className="text-gray-500 mt-1">System capabilities and access control. Click a row to see details.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={fetchPermissions}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                        Refresh
                    </Button>
                    <Button
                        className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        New Permission
                    </Button>
                </div>
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
                            <Badge variant="info" className="px-3 py-1">
                                {filteredPermissions.length} permissions
                            </Badge>
                            <Button variant="secondary" className="gap-2 flex-1 sm:flex-none">
                                <Filter className="h-4 w-4" />
                                Group
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                            <span className="ml-3 text-gray-500">Loading permissions...</span>
                        </div>
                    ) : filteredPermissions.length === 0 ? (
                        <div className="text-center py-16">
                            <Lock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No permissions found</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredPermissions}
                            onRowClick={handleRowClick}
                            renderActions={() => (
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <PermissionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                permission={selectedPermission}
            />

            {/* Create Modal */}
            <PermissionFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreatePermission}
                mode="create"
            />
        </div>
    );
};
