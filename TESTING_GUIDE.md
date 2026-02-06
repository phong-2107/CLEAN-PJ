# ?? USER PERMISSION TESTING GUIDE

## ?? PREREQUISITES

1. **Database ?ã ???c update:**
   ```bash
   dotnet ef database update -p src/CLEAN-Pl.Infrastructure -s src/CLEAN-Pl.API
   ```

2. **Seed permissions m?i:**
   - Option A: Reset database
     ```bash
     .\scripts\ResetAndSeed.ps1
     ```
   - Option B: Ch?y SQL script
     ```bash
     sqlcmd -S localhost -d CleanPlDb -i scripts\SeedUserPermissions.sql
     ```

3. **Start API:**
   ```bash
   dotnet run --project src/CLEAN-Pl.API
   ```

4. **M? Swagger UI:**
   - Navigate to: `https://localhost:7099/swagger` (ho?c port t??ng ?ng)
   - Ho?c: `http://localhost:5099/swagger`

---

## ?? B??C 1: LOGIN VÀ L?Y TOKEN

### 1.1. Login v?i Admin
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "usernameOrEmail": "admin",
  "password": "Admin@123"
}
```

**Response:** Copy `accessToken` ?? dùng cho các request sau

### 1.2. Authorize trong Swagger
- Click nút **?? Authorize** ? góc trên bên ph?i
- Nh?p: `Bearer {accessToken}` (thay {accessToken} b?ng token v?a l?y)
- Click **Authorize**

---

## ?? B??C 2: TEST SCENARIOS

### ? TEST CASE 1: Xem Danh Sách Users

```
GET /api/users
```

**Expected:** Danh sách users v?i admin và các user khác (n?u có)

**Note:** L?y userId ?? dùng cho các test sau (ví d?: userId = 2)

---

### ? TEST CASE 2: Xem Chi Ti?t Permissions c?a User

```
GET /api/users/{userId}/permissions/details
```

**Thay {userId} = 2** (ho?c userId c?a user b?n mu?n test)

**Expected Response:**
```json
{
  "userId": 2,
  "username": "testuser",
  "permissions": [
    {
      "permissionId": 1,
      "permissionName": "Product.Create",
      "resource": "Product",
      "action": "Create",
      "source": "Role",
      "sourceDetails": "Manager"
    }
  ]
}
```

**Gi?i thích:**
- `source: "Role"` = Permission t? role c?a user
- `sourceDetails` = Tên role

---

### ? TEST CASE 3: Grant Permission (Trao Quy?n ??c Bi?t)

**Scenario:** User có role "User" (ch? ??c Product), Admin mu?n t?m trao quy?n "Product.Delete"

```
POST /api/users/{userId}/permissions/grant
```

**Thay {userId} = 2**

**Request Body:**
```json
{
  "permissionId": 4,
  "reason": "Temporary access for product cleanup task - expires 2026-02-10"
}
```

**Expected Response:**
```json
{
  "message": "Permission granted successfully"
}
```

**Verify:**
- Call l?i `GET /api/users/2/permissions/details`
- Should see new permission v?i `source: "Granted"`

---

### ? TEST CASE 4: Deny Permission (Thu H?i Quy?n)

**Scenario:** User có role "Manager" (có Product.Delete), Admin mu?n thu h?i quy?n này

```
POST /api/users/{userId}/permissions/deny
```

**Thay {userId} = 2**

**Request Body:**
```json
{
  "permissionId": 4,
  "reason": "Junior manager - cannot delete products yet"
}
```

**Expected Response:**
```json
{
  "message": "Permission denied successfully"
}
```

**Verify:**
- Call l?i `GET /api/users/2/permissions/details`
- Permission "Product.Delete" should have `source: "Denied"`
- User s? KHÔNG còn permission này (dù role có)

---

### ? TEST CASE 5: Xem Danh Sách Overrides

```
GET /api/users/{userId}/permissions/overrides
```

**Thay {userId} = 2**

**Expected Response:**
```json
[
  {
    "permissionId": 4,
    "permissionName": "Product.Delete",
    "resource": "Product",
    "action": "Delete",
    "isGranted": false,
    "reason": "Junior manager - cannot delete products yet",
    "assignedAt": "2026-02-05T07:45:00Z",
    "assignedByUsername": "admin"
  }
]
```

---

### ? TEST CASE 6: Revoke Override (Khôi Ph?c V? Role)

**Scenario:** H?y b? override, user quay l?i permissions t? role

```
DELETE /api/users/{userId}/permissions/{permissionId}
```

**Thay:** 
- `{userId} = 2`
- `{permissionId} = 4`

**Expected Response:**
```json
{
  "message": "Permission override revoked successfully"
}
```

**Verify:**
- Call l?i `GET /api/users/2/permissions/details`
- Permission "Product.Delete" quay l?i state t? role

---

## ?? B??C 3: VERIFY TRONG DATABASE

### 3.1. Ki?m tra UserPermissions Table

```sql
SELECT 
    up.UserId,
    u.Username,
    p.Name AS PermissionName,
    up.IsGranted,
    up.Reason,
    up.AssignedAt,
    assignedBy.Username AS AssignedBy,
    up.RevokedAt,
    revokedBy.Username AS RevokedBy
FROM UserPermissions up
JOIN Users u ON up.UserId = u.Id
JOIN Permissions p ON up.PermissionId = p.Id
JOIN Users assignedBy ON up.AssignedByUserId = assignedBy.Id
LEFT JOIN Users revokedBy ON up.RevokedByUserId = revokedBy.Id
ORDER BY up.AssignedAt DESC;
```

### 3.2. Ki?m tra Cache Invalidation

**Cách 1: Ki?m tra log**
- Xem console output
- Tìm dòng: `Cache invalidated for user {userId}`

**Cách 2: Test performance**
- Call `GET /api/users/{userId}/permissions/details` l?n 1 ? Slow (DB query)
- Call l?i l?n 2 ngay sau ?ó ? Fast (from cache)
- Grant/Deny permission ? Cache invalidate
- Call l?i l?n 3 ? Slow (DB query again)

---

## ?? ADVANCED TEST SCENARIOS

### Scenario A: Multiple Overrides
```json
1. Grant: Product.Delete (permissionId: 4)
2. Deny: Product.Update (permissionId: 3)
3. Grant: User.Read (permissionId: 6)

Result: User có permissions = (Role Perms - Denied) + Granted
```

### Scenario B: Override Precedence
```json
User role: Manager (có Product.Delete)
Admin deny Product.Delete
? User KHÔNG còn Product.Delete (DENY > ROLE)

Admin grant Product.Delete l?i
? User có Product.Delete (GRANT thay DENY)
```

### Scenario C: Revoke và Re-grant
```json
1. Grant Product.Delete
2. Revoke ? User quay l?i role permissions
3. Grant l?i Product.Delete v?i reason khác
? T?o record m?i trong DB (soft delete pattern)
```

---

## ? EXPECTED BEHAVIORS

### 1. Permission Calculation Logic
```
Final Permissions = (Role Permissions - Denied) + Granted
```

### 2. Precedence Rule
```
DENY > GRANT > ROLE
```

### 3. Soft Delete
- Revoke không xóa record
- Set RevokedAt = current time
- Query ch? l?y records có RevokedAt = NULL

### 4. Cache Behavior
- Cache duration: 30 minutes
- Auto invalidate on Grant/Deny/Revoke
- Cache key: `user_perms_{userId}`

### 5. Audit Trail
- M?i thay ??i có AssignedBy/RevokedBy
- Có timestamp ??y ??
- Có reason field ?? gi?i thích

---

## ?? COMMON ISSUES & SOLUTIONS

### Issue 1: "Permission not found"
**Cause:** PermissionId không t?n t?i  
**Solution:** Ch?y `GET /api/permissions` ?? l?y danh sách ID

### Issue 2: "User not found"
**Cause:** UserId không t?n t?i  
**Solution:** Ch?y `GET /api/users` ?? l?y danh sách userId

### Issue 3: 403 Forbidden
**Cause:** User hi?n t?i không có permission ?? th?c hi?n action  
**Solution:** Login v?i admin account

### Issue 4: "User permission override not found"
**Cause:** Override không t?n t?i ho?c ?ã b? revoke  
**Solution:** Ki?m tra b?ng `GET /api/users/{userId}/permissions/overrides`

---

## ?? POSTMAN COLLECTION

Import collection này vào Postman ?? test nhanh:

```json
{
  "info": {
    "name": "User Permission Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"usernameOrEmail\": \"admin\",\n  \"password\": \"Admin@123\"\n}"
        }
      }
    },
    {
      "name": "2. Get User Permission Details",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/users/2/permissions/details",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ]
      }
    },
    {
      "name": "3. Grant Permission",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/users/2/permissions/grant",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"permissionId\": 4,\n  \"reason\": \"Test grant\"\n}"
        }
      }
    },
    {
      "name": "4. Deny Permission",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/users/2/permissions/deny",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"permissionId\": 3,\n  \"reason\": \"Test deny\"\n}"
        }
      }
    },
    {
      "name": "5. Get Overrides",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/users/2/permissions/overrides",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ]
      }
    },
    {
      "name": "6. Revoke Override",
      "request": {
        "method": "DELETE",
        "url": "{{baseUrl}}/api/users/2/permissions/4",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ]
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "https://localhost:7099"},
    {"key": "token", "value": ""}
  ]
}
```

**Usage:**
1. Import vào Postman
2. Set environment variable `baseUrl` và `token`
3. Run collection

---

## ?? LEARNING POINTS

1. **Hybrid RBAC + ABAC** = Best of both worlds
2. **Soft Delete** = Audit trail friendly
3. **Cache Invalidation** = Performance + Consistency
4. **Composite Key** = Prevent duplicates
5. **Factory Methods** = Domain-driven design
6. **Primary Constructors** = Modern C# syntax

---

## ?? CHECKLIST

- [ ] Database updated
- [ ] Permissions seeded
- [ ] API started successfully
- [ ] Login successful
- [ ] Can view user permissions
- [ ] Can grant permission
- [ ] Can deny permission
- [ ] Can revoke override
- [ ] Cache invalidation works
- [ ] Audit trail in database
- [ ] All 6 test cases passed

---

## ?? NEXT STEPS

1. **Unit Tests**: Create tests for `UserPermissionService`
2. **Integration Tests**: Test full flow with database
3. **Performance Test**: Load test with many users
4. **Frontend**: Build UI for permission management
5. **Monitoring**: Add metrics for permission checks

---

**Happy Testing! ??**
