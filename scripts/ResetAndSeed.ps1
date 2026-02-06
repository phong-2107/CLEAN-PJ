# ====================================================
# RESET DATABASE VÀ SEED DATA
# S? d?ng khi mu?n reset toàn b? database
# ====================================================

Write-Host "?? Resetting database..." -ForegroundColor Yellow

# Drop database
dotnet ef database drop -p src/CLEAN-Pl.Infrastructure -s src/CLEAN-Pl.API --force

# Apply all migrations
Write-Host "?? Applying migrations..." -ForegroundColor Yellow
dotnet ef database update -p src/CLEAN-Pl.Infrastructure -s src/CLEAN-Pl.API

# Run application (seeder will auto-run)
Write-Host "?? Starting API (seeder will auto-run)..." -ForegroundColor Green
dotnet run --project src/CLEAN-Pl.API

Write-Host "? Done! Database reset and seeded." -ForegroundColor Green
