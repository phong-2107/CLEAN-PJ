# ?? QUICK START - USER PERMISSION TESTING

## ?? M?C ?ÍCH
Test h? th?ng **User-Specific Permission Management** (Hybrid RBAC + ABAC) v?a ???c implement.

---

## ? QUICK START (3 B??C)

### 1. Ch?y Script T? ??ng
```bash
# Windows
.\start-test.bat

# Linux/Mac
chmod +x scripts/ResetAndSeed.ps1
./scripts/ResetAndSeed.ps1
```

### 2. M? Swagger UI
- URL: https://localhost:7099/swagger
- Ho?c: http://localhost:5099/swagger

### 3. Login và Test
- Username: `admin`
- Password: `Admin@123`
- Click **Authorize** trong Swagger
- B?t ??u test các endpoint

---

## ?? FILES ?Ã T?O

### Documentation
- `TESTING_GUIDE.md` - H??ng d?n test chi ti?t t?ng b??c
- `README_TESTING.md` - Quick start guide (file này)

### Scripts
- `scripts/ResetAndSeed.ps1` - Reset database và seed data
- `scripts/SeedUserPermissions.sql` - Seed ch? permissions m?i
- `scripts/VerifyUserPermissions.sql` - Verify k?t qu? trong DB
- `start-test.bat` - Quick start script (Windows)

### Postman
- `postman/UserPermissionTests.postman_collection.json` - Test collection ??y ??

---

## ?? TEST SCENARIOS

### Scenario 1: Grant Permission
```
User: Staff (ch? có Product.Read)
Admin grant: Product.Delete
Result: Staff có thêm Product.Delete
```

**Test:**
```
POST /api/users/2/permissions/grant
{
  "permissionId": 4,
  "reason": "Temporary cleanup access"
}
```

### Scenario 2: Deny Permission
```
User: Manager (có Product.Delete t? role)
Admin deny: Product.Delete
Result: Manager KHÔNG còn Product.Delete
```

**Test:**
```
POST /api/users/2/permissions/deny
{
  "permissionId": 4,
  "reason": "Junior manager restriction"
}
```

### Scenario 3: Revoke Override
```
User có override ? Admin revoke
Result: User quay l?i permissions t? role
```

**Test:**
```
DELETE /api/users/2/permissions/4
```

---

## ?? VERIFICATION

### Check trong Swagger
1. `GET /api/users/{userId}/permissions/details` - Xem t?ng h?p
2. `GET /api/users/{userId}/permissions/overrides` - Xem overrides

### Check trong Database
```bash
sqlcmd -S localhost -d CleanPlDb -i scripts/VerifyUserPermissions.sql
```

Ho?c ch?y t?ng query trong SSMS.

---

## ?? EXPECTED RESULTS

### Permission Details Response
```json
{
  "userId": 2,
  "username": "testuser",
  "permissions": [
    {
      "permissionId": 2,
      "permissionName": "Product.Read",
      "resource": "Product",
      "action": "Read",
      "source": "Role",
      "sourceDetails": "User, Manager"
    },
    {
      "permissionId": 4,
      "permissionName": "Product.Delete",
      "source": "Granted",
      "sourceDetails": "Temporary cleanup access"
    }
  ]
}
```

### Overrides Response
```json
[
  {
    "permissionId": 4,
    "permissionName": "Product.Delete",
    "resource": "Product",
    "action": "Delete",
    "isGranted": true,
    "reason": "Temporary cleanup access",
    "assignedAt": "2026-02-05T08:00:00Z",
    "assignedByUsername": "admin"
  }
]
```

---

## ?? KEY ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{userId}/permissions/details` | Xem t?ng h?p permissions |
| GET | `/api/users/{userId}/permissions/overrides` | Xem danh sách overrides |
| POST | `/api/users/{userId}/permissions/grant` | Trao quy?n ??c bi?t |
| POST | `/api/users/{userId}/permissions/deny` | Thu h?i quy?n |
| DELETE | `/api/users/{userId}/permissions/{permissionId}` | Revoke override |

---

## ?? TROUBLESHOOTING

### Issue: "Permission not found"
**Solution:**
```
GET /api/permissions
? L?y danh sách PermissionId
```

### Issue: "User not found"
**Solution:**
```
GET /api/users
? L?y danh sách UserId
```

### Issue: 403 Forbidden
**Solution:** Login v?i admin account

### Issue: Database connection failed
**Solution:** Check `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CleanPlDb;..."
  }
}
```

---

## ?? RESOURCES

- **Full Testing Guide:** `TESTING_GUIDE.md`
- **Postman Collection:** `postman/UserPermissionTests.postman_collection.json`
- **SQL Scripts:** `scripts/`
- **Architecture Doc:** Xem ph?n ??u conversation

---

## ? CHECKLIST

- [ ] Database updated (migration applied)
- [ ] Permissions seeded (4 new permissions)
- [ ] API started successfully
- [ ] Swagger accessible
- [ ] Login successful (admin/Admin@123)
- [ ] Can view user permissions
- [ ] Can grant permission
- [ ] Can deny permission
- [ ] Can revoke override
- [ ] Verified in database

---

## ?? LEARNING POINTS

1. **Hybrid RBAC + ABAC** = Linh ho?t nh?ng v?n d? qu?n lý
2. **Soft Delete** = Gi? audit trail ??y ??
3. **Cache Invalidation** = Performance + Consistency
4. **Composite Key** = Prevent duplicates
5. **Factory Methods** = Domain-driven design
6. **Primary Constructors** = Modern C# 12 syntax

---

## ?? NEXT STEPS

1. ? Run basic tests trong Swagger
2. ? Import Postman collection và test scenarios
3. ? Verify database v?i SQL scripts
4. ? Test cache invalidation
5. ? Create unit tests
6. ? Build frontend UI

---

**Happy Testing! ??**

Need help? Check `TESTING_GUIDE.md` for detailed instructions.
