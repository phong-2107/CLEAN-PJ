import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    ArrowLeft,
    Shield,
    Edit,
    Trash2,
    Users,
    ChevronRight,
    AlertCircle,
    Lock,
    Check,
    X,
    RefreshCw
} from 'lucide-react';
import roleService from '../../services/roleService';
import permissionService from '../../services/permissionService';
import { Role, Permission } from '../../types/role';

export const RoleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [role, setRole] = useState<Role | null>(null);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [updatingPermissions, setUpdatingPermissions] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (id) {
            fetchRoleAndPermissions(id);
        }
    }, [id]);

    const fetchRoleAndPermissions = async (roleId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch role and all permissions in parallel
            const [roleData, permissionsData] = await Promise.all([
                roleService.getById(roleId).catch(() => null),
                permissionService.getAll().catch(() => [])
            ]);

            if (roleData) {
                setRole(roleData);
            } else {
                // Fallback mock data
                setRole({
                    id: roleId,
                    name: 'Admin',
                    description: 'Full system access with all permissions',
                    isSystemRole: roleId === '1',
                    permissions: [
                        { id: '1', name: 'Product.Read', description: 'Can view products', resource: 'Product' },
                        { id: '2', name: 'Product.Create', description: 'Can create products', resource: 'Product' },
                        { id: '3', name: 'Product.Update', description: 'Can update products', resource: 'Product' },
                        { id: '4', name: 'Product.Delete', description: 'Can delete products', resource: 'Product' },
                        { id: '5', name: 'User.Read', description: 'Can view users', resource: 'User' },
                    ]
                });
            }

            if (permissionsData.length > 0) {
                setAllPermissions(permissionsData);
            } else {
                // Fallback mock permissions
                setAllPermissions([
                    { id: '1', name: 'Product.Read', description: 'Can view products', resource: 'Product' },
                    { id: '2', name: 'Product.Create', description: 'Can create products', resource: 'Product' },
                    { id: '3', name: 'Product.Update', description: 'Can update products', resource: 'Product' },
                    { id: '4', name: 'Product.Delete', description: 'Can delete products', resource: 'Product' },
                    { id: '5', name: 'User.Read', description: 'Can view users', resource: 'User' },
                    { id: '6', name: 'User.Create', description: 'Can create users', resource: 'User' },
                    { id: '7', name: 'User.Update', description: 'Can update users', resource: 'User' },
                    { id: '8', name: 'User.Delete', description: 'Can delete users', resource: 'User' },
                    { id: '9', name: 'Role.Read', description: 'Can view roles', resource: 'Role' },
                    { id: '10', name: 'Role.Create', description: 'Can create roles', resource: 'Role' },
                    { id: '11', name: 'Role.Update', description: 'Can update roles', resource: 'Role' },
                    { id: '12', name: 'Role.Delete', description: 'Can delete roles', resource: 'Role' },
                    { id: '13', name: 'Permission.Read', description: 'Can view permissions', resource: 'Permission' },
                ]);
            }
        } catch (err) {
            console.error('Failed to fetch role:', err);
            setError('Failed to load role details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = useCallback(async () => {
        if (!id || role?.isSystemRole) return;
        if (!window.confirm('Are you sure you want to delete this role?')) return;

        setIsDeleting(true);
        try {
            await roleService.delete(id);
            navigate('/dashboard/roles');
        } catch (err) {
            console.error('Failed to delete role:', err);
            setError('Failed to delete role. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    }, [id, role, navigate]);

    const hasPermission = useCallback((permissionId: string) => {
        return role?.permissions?.some(p => p.id === permissionId) ?? false;
    }, [role]);

    const togglePermission = useCallback(async (permission: Permission) => {
        if (!id || role?.isSystemRole) return;

        setUpdatingPermissions(prev => new Set(prev).add(permission.id));

        try {
            const has = hasPermission(permission.id);

            if (has) {
                await roleService.removePermission(id, permission.id);
                setRole(prev => prev ? {
                    ...prev,
                    permissions: prev.permissions?.filter(p => p.id !== permission.id)
                } : null);
            } else {
                await roleService.assignPermission(id, permission.id);
                setRole(prev => prev ? {
                    ...prev,
                    permissions: [...(prev.permissions || []), permission]
                } : null);
            }
        } catch (err) {
            console.error('Failed to update permission:', err);
            // Refresh data on error
            fetchRoleAndPermissions(id);
        } finally {
            setUpdatingPermissions(prev => {
                const next = new Set(prev);
                next.delete(permission.id);
                return next;
            });
        }
    }, [id, role, hasPermission]);

    // Group permissions by resource
    const groupedPermissions = allPermissions.reduce((acc, perm) => {
        const resource = perm.resource || 'Other';
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="h-96 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="h-64 bg-gray-200 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error && !role) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <AlertCircle className="h-16 w-16 text-red-400" />
                <h2 className="text-xl font-semibold text-gray-900">Role Not Found</h2>
                <p className="text-gray-500">{error}</p>
                <Button onClick={() => navigate('/dashboard/roles')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Roles
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/dashboard" className="hover:text-purple-600 transition-colors">
                    Dashboard
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/dashboard/roles" className="hover:text-purple-600 transition-colors">
                    Roles
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">{role?.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/dashboard/roles')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{role?.name}</h1>
                                {role?.isSystemRole && (
                                    <Badge variant="default" className="bg-amber-100 text-amber-700 border border-amber-200">
                                        System Role
                                    </Badge>
                                )}
                            </div>
                            <p className="text-gray-500 mt-0.5">{role?.description || 'No description'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!role?.isSystemRole && (
                        <>
                            <Button variant="secondary" className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                variant="secondary"
                                className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {role?.isSystemRole && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">System Role</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                            This is a system role and cannot be modified or deleted. System roles are protected to ensure core functionality.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Permissions List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lock className="h-5 w-5 text-purple-600" />
                                Permissions ({role?.permissions?.length || 0})
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => id && fetchRoleAndPermissions(id)}
                                className="gap-2 text-gray-500"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                                    <div key={resource}>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Badge variant="default" className="bg-gray-100 text-gray-600">
                                                {resource}
                                            </Badge>
                                        </h3>
                                        <div className="space-y-2">
                                            {permissions.map(permission => {
                                                const isAssigned = hasPermission(permission.id);
                                                const isUpdating = updatingPermissions.has(permission.id);

                                                return (
                                                    <div
                                                        key={permission.id}
                                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isAssigned
                                                                ? 'bg-purple-50 border-purple-200'
                                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                            } ${role?.isSystemRole ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onClick={() => !role?.isSystemRole && !isUpdating && togglePermission(permission)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-1.5 rounded-md ${isAssigned ? 'bg-purple-200' : 'bg-gray-200'
                                                                }`}>
                                                                <Lock className={`h-3.5 w-3.5 ${isAssigned ? 'text-purple-700' : 'text-gray-500'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-medium ${isAssigned ? 'text-purple-900' : 'text-gray-700'
                                                                    }`}>
                                                                    {permission.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {permission.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isUpdating ? (
                                                                <span className="h-5 w-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                                                            ) : isAssigned ? (
                                                                <div className="p-1 bg-purple-600 rounded-full">
                                                                    <Check className="h-3 w-3 text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="p-1 bg-gray-300 rounded-full">
                                                                    <X className="h-3 w-3 text-gray-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Lock className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Assigned Permissions</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {role?.permissions?.length || 0}
                                <span className="text-lg font-normal text-gray-500"> / {allPermissions.length}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Role Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Role ID</p>
                                <p className="font-mono text-sm text-gray-900">{role?.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {role?.isSystemRole ? 'System Role' : 'Custom Role'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-2">
                            <Button variant="secondary" className="w-full justify-start gap-2">
                                <Users className="h-4 w-4" />
                                View Users with this Role
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RoleDetailPage;
