import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import {
    Search,
    Plus,
    Filter,
    Shield,
    Trash2,
    Edit,
    RefreshCw,
    Loader2,
    AlertCircle,
    Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import userService from '../../services/userService';
import { UserDto } from '../../types/user';
import { UserFormModal } from '../../components/modals/UserFormModal';
import { UserPermissionManagementModal } from '../../components/modals/UserPermissionManagementModal';
import { UserDetailModal } from '../../components/modals/UserDetailModal';

export const UsersPage = () => {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

    // Permission Modal state
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<UserDto | null>(null);
    const [permissionModalTab, setPermissionModalTab] = useState<'effective' | 'grant' | 'deny'>('effective');

    // Detail Modal state
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserDto | null>(null);

    // Fetch users from API
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle create user
    const handleAddUser = useCallback(() => {
        setSelectedUser(null);
        setModalMode('create');
        setIsModalOpen(true);
    }, []);

    // Handle edit user
    const handleEditUser = useCallback((user: UserDto) => {
        setSelectedUser(user);
        setModalMode('edit');
        setIsModalOpen(true);
    }, []);

    // Handle delete user
    const handleDeleteUser = useCallback(async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userService.delete(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Failed to delete user:', err);
            setError('Failed to delete user');
        }
    }, []);

    // Handle manage permissions directly (from table action)
    const handleManagePermissions = useCallback((user: UserDto, e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent row click
        setSelectedUserForPermissions(user);
        setPermissionModalTab('effective');
        setIsPermissionModalOpen(true);
    }, []);

    // Handle row click -> Open Detail Modal
    const handleRowClick = useCallback((user: UserDto) => {
        setSelectedUserForDetail(user);
        setIsDetailModalOpen(true);
    }, []);

    // Handle transitions from Detail Modal
    const handleOpenPermissionFromDetail = useCallback((tab: 'effective' | 'grant') => {
        if (selectedUserForDetail) {
            setSelectedUserForPermissions(selectedUserForDetail);
            setPermissionModalTab(tab);
            setIsDetailModalOpen(false);
            setIsPermissionModalOpen(true);
        }
    }, [selectedUserForDetail]);

    // Handle form submit
    const handleFormSubmit = useCallback(async (data: any) => {
        if (modalMode === 'create') {
            await userService.create({
                username: data.username,
                email: data.email,
                password: data.password,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                roleIds: data.roleIds
            });
        } else if (selectedUser) {
            await userService.update(selectedUser.id, {
                email: data.email,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined
            });
        }
        fetchUsers();
    }, [modalMode, selectedUser, fetchUsers]);

    // Format relative time
    const formatRelativeTime = (date: string | undefined | null): string => {
        if (!date) return 'Never';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return past.toLocaleDateString();
    };

    // Filter users by search query
    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<UserDto>[] = [
        {
            key: 'fullName',
            header: 'User',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar fallback={user.fullName || user.username} size="sm" />
                    <div>
                        <div className="font-medium text-gray-900">{user.fullName || user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'roles',
            header: 'Roles',
            render: (user) => (
                <div className="flex items-center gap-2 flex-wrap">
                    <Shield className="h-4 w-4 text-gray-400" />
                    {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                            <Badge key={index} variant={role === 'Admin' ? 'info' : 'default'}>
                                {role}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-sm text-gray-400">No roles</span>
                    )}
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (user) => (
                <Badge variant={user.isActive ? 'success' : 'default'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'lastLoginAt',
            header: 'Last Active',
            render: (user) => (
                <span className="text-sm text-gray-500">
                    {formatRelativeTime(user.lastLoginAt)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary-600" />
                        Users
                    </h1>
                    <p className="text-gray-500 mt-1">Manage user access and roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={fetchUsers}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleAddUser}
                        className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={fetchUsers} className="ml-auto">
                        Retry
                    </Button>
                </div>
            )}

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
                            <Badge variant="info" className="px-3 py-1">
                                {filteredUsers.length} users
                            </Badge>
                            <Button variant="secondary" className="gap-2 flex-1 sm:flex-none">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                            <span className="ml-3 text-gray-500">Loading users...</span>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredUsers}
                            onRowClick={handleRowClick}
                            renderActions={(user) => (
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={(e) => handleManagePermissions(user, e)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Manage Permissions"
                                    >
                                        <Shield className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditUser(user);
                                        }}
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteUser(user.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        />
                    )}
                </CardContent>
            </Card>

            {/* User Form Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                mode={modalMode}
                initialData={selectedUser ? {
                    id: selectedUser.id,
                    username: selectedUser.username,
                    email: selectedUser.email,
                    firstName: selectedUser.firstName || '',
                    lastName: selectedUser.lastName || '',
                    roleIds: []
                } : undefined}
            />

            {/* User Permission Management Modal */}
            {selectedUserForPermissions && (
                <UserPermissionManagementModal
                    isOpen={isPermissionModalOpen}
                    onClose={() => setIsPermissionModalOpen(false)}
                    userId={selectedUserForPermissions.id}
                    userName={selectedUserForPermissions.fullName || selectedUserForPermissions.username}
                    initialTab={permissionModalTab}
                />
            )}

            {/* User Detail Modal */}
            {selectedUserForDetail && (
                <UserDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    user={selectedUserForDetail}
                    onViewPermissions={() => handleOpenPermissionFromDetail('effective')}
                    onAddPermission={() => handleOpenPermissionFromDetail('grant')}
                />
            )}
        </div>
    );
};
