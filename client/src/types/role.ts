export interface Permission {
    id: string;
    name: string;
    description?: string;
    resource?: string;
    action?: string;
    group?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    isSystemRole?: boolean;
    permissions?: Permission[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
    id: string;
}
