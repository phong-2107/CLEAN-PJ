import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Shield, Edit, Trash2, Eye, RefreshCw, Lock } from 'lucide-react';
import roleService from '../../services/roleService';
import { Role } from '../../types/role';

export const RolesPage = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await roleService.getAll();
            // Fallback mock data if API fails or returns empty in dev
            if (!data || data.length === 0) {
                setRoles([
                    {
                        id: '1', name: 'Admin', description: 'Full system access', isSystemRole: true, permissions: [
                            { id: '1', name: 'Product.Read', resource: 'Product' },
                            { id: '2', name: 'Product.Create', resource: 'Product' },
                            { id: '3', name: 'User.Read', resource: 'User' },
                        ]
                    },
                    {
                        id: '2', name: 'Manager', description: 'Product and Order management', permissions: [
                            { id: '1', name: 'Product.Read', resource: 'Product' },
                            { id: '2', name: 'Product.Create', resource: 'Product' },
                        ]
                    },
                    {
                        id: '3', name: 'User', description: 'Standard user access', permissions: [
                            { id: '5', name: 'Profile.View', resource: 'Profile' },
                        ]
                    },
                ]);
            } else {
                setRoles(data);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            // Mock data on error for demo purposes
            setRoles([
                {
                    id: '1', name: 'Admin', description: 'Full system access', isSystemRole: true, permissions: [
                        { id: '1', name: 'Product.Read', resource: 'Product' },
                        { id: '2', name: 'Product.Create', resource: 'Product' },
                        { id: '3', name: 'User.Read', resource: 'User' },
                    ]
                },
                {
                    id: '2', name: 'Manager', description: 'Product and Order management', permissions: [
                        { id: '1', name: 'Product.Read', resource: 'Product' },
                        { id: '2', name: 'Product.Create', resource: 'Product' },
                    ]
                },
                {
                    id: '3', name: 'User', description: 'Standard user access', permissions: [
                        { id: '5', name: 'Profile.View', resource: 'Profile' },
                    ]
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDelete = useCallback(async (id: string, isSystemRole?: boolean) => {
        if (isSystemRole) {
            alert('System roles cannot be deleted.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this role?')) return;

        try {
            await roleService.delete(id);
            fetchRoles();
        } catch (error) {
            console.error('Failed to delete role:', error);
        }
    }, [fetchRoles]);

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<Role>[] = [
        {
            key: 'name',
            header: 'Role Name',
            render: (role) => (
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(`/dashboard/roles/${role.id}`)}
                >
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                {role.name}
                            </span>
                            {role.isSystemRole && (
                                <Lock className="h-3 w-3 text-amber-500" />
                            )}
                        </div>
                        {role.description && (
                            <span className="text-sm text-gray-500 line-clamp-1">{role.description}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'permissions',
            header: 'Permissions',
            render: (role) => (
                <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 3).map((perm, index) => (
                        <Badge key={index} variant="default" className="bg-gray-100 text-gray-600 border border-gray-200 text-xs">
                            {perm.name}
                        </Badge>
                    ))}
                    {(role.permissions?.length || 0) > 3 && (
                        <Badge variant="default" className="text-gray-400 text-xs">
                            +{(role.permissions?.length || 0) - 3}
                        </Badge>
                    )}
                    {(!role.permissions || role.permissions.length === 0) && (
                        <span className="text-sm text-gray-400">No permissions</span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Type',
            render: (role) => (
                role.isSystemRole ? (
                    <Badge variant="warning" className="bg-amber-50 text-amber-700 border border-amber-200">
                        System
                    </Badge>
                ) : (
                    <Badge variant="default" className="bg-gray-50 text-gray-600 border border-gray-200">
                        Custom
                    </Badge>
                )
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
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={fetchRoles}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">
                        <Plus className="h-4 w-4" />
                        Create Role
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
                        data={filteredRoles}
                        emptyMessage={isLoading ? "Loading roles..." : "No roles found"}
                        renderActions={(role) => (
                            <div className="flex justify-end gap-1">
                                <button
                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/roles/${role.id}`);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                {!role.isSystemRole && (
                                    <>
                                        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(role.id, role.isSystemRole);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

