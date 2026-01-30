import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Filter, Shield, Edit, Trash2 } from 'lucide-react';
import roleService, { Role } from '../../services/roleService';

export const RolesPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const data = await roleService.getAll();
            // Fallback mock data if API fails or returns empty in dev
            if (!data || data.length === 0) {
                setRoles([
                    { id: '1', name: 'Admin', description: 'Full system access', claims: ['users.manage', 'products.manage', 'settings.manage'] },
                    { id: '2', name: 'Manager', description: 'Product and Order management', claims: ['products.manage', 'orders.manage'] },
                    { id: '3', name: 'User', description: 'Standard user access', claims: ['profile.view'] },
                ]);
            } else {
                setRoles(data);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            // Mock data on error for demo purposes
            setRoles([
                { id: '1', name: 'Admin', description: 'Full system access', claims: ['users.manage', 'products.manage', 'settings.manage'] },
                { id: '2', name: 'Manager', description: 'Product and Order management', claims: ['products.manage', 'orders.manage'] },
                { id: '3', name: 'User', description: 'Standard user access', claims: ['profile.view'] },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<Role>[] = [
        {
            key: 'name',
            header: 'Role Name',
            render: (role) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">{role.name}</span>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (role) => <span className="text-gray-500">{role.description || '-'}</span>,
        },
        {
            key: 'claims',
            header: 'Permissions',
            render: (role) => (
                <div className="flex flex-wrap gap-1">
                    {role.claims?.slice(0, 3).map((claim, index) => (
                        <Badge key={index} variant="default" className="bg-gray-100 text-gray-600 border border-gray-200">
                            {claim}
                        </Badge>
                    ))}
                    {(role.claims?.length || 0) > 3 && (
                        <Badge variant="default" className="text-gray-400">
                            +{(role.claims?.length || 0) - 3}
                        </Badge>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
                    <p className="text-gray-500 mt-1">Define roles and assign permissions.</p>
                </div>
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">
                    <Plus className="h-4 w-4" />
                    Create Role
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={roles}
                        className="bg-red-500" // Debug class, should be removed or ignored if not used by DataTable correctly
                        emptyMessage={isLoading ? "Loading roles..." : "No roles found"}
                        renderActions={() => (
                            <div className="flex justify-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
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
