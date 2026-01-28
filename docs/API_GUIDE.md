# Hướng Dẫn Chạy CLEAN-Pl API

---

## 1. Chuẩn Bị

### Yêu Cầu
- **.NET SDK 10.0+** → [Download](https://dotnet.microsoft.com/download)
- **SQL Server** (LocalDB, Express hoặc Full)

### Kiểm Tra
```powershell
dotnet --version
# Output: 10.x.x
```

---

## 2. Cấu Hình Database

Mở file `src\CLEAN-Pl.API\appsettings.json`, thay đổi `Server=`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=TEN_SERVER_CUA_BAN;Database=CleanPlDb;..."
}
```

**Ví dụ tên server:**
- `localhost` hoặc `.`
- `.\SQLEXPRESS`
- `(localdb)\mssqllocaldb`

---

## 3. Chạy Dự Án

```powershell
cd c:\Users\Admin\source\repos\CLEAN-PJ\src\CLEAN-Pl.API
dotnet run
```

**Kết quả:**
```
Now listening on: http://localhost:5036
Database seeding completed successfully
```

---

## 4. Truy Cập

| URL | Mô Tả |
|-----|-------|
| http://localhost:5036/ | Swagger UI |
| http://localhost:5036/api | API Info |
| http://localhost:5036/health | Health Check |

---

## 5. Đăng Nhập

### Tài Khoản Mặc Định
```
Username: admin
Password: Admin@123
```

### Cách Lấy Token

1. Mở Swagger UI: http://localhost:5036/
2. Tìm `/api/auth/login` → Click **Try it out**
3. Nhập:
```json
{
  "usernameOrEmail": "admin",
  "password": "Admin@123"
}
```
4. Click **Execute**
5. Copy `accessToken` từ response

### Sử Dụng Token

1. Click nút **Authorize** 🔐 (góc phải trên)
2. Dán token vào ô input
3. Click **Authorize**
4. Đóng popup
5. Giờ có thể test tất cả API

---

## 6. Test API

### Tạo Product Mới

**Endpoint:** `POST /api/products`

```json
{
  "name": "Laptop Dell",
  "description": "Laptop văn phòng",
  "price": 15000000,
  "stockQuantity": 10
}
```

### Xem Danh Sách Products

**Endpoint:** `GET /api/products`

---

## 7. Phân Quyền

| Role | Quyền |
|------|-------|
| **Admin** | Tất cả |
| **Manager** | CRUD Products |
| **User** | Chỉ xem Products |

---

## 8. Xử Lý Lỗi

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-------------|-----------|
| **401 Unauthorized** | Chưa đăng nhập hoặc token hết hạn | Đăng nhập lại |
| **403 Forbidden** | Không có quyền | Kiểm tra role/permission |
| **500 Server Error** | Lỗi database/server | Kiểm tra connection string |

---

## 9. Dừng Ứng Dụng

Nhấn `Ctrl + C` trong terminal để dừng.
