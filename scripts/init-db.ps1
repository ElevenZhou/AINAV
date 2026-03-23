# scripts/init-db.ps1 — Windows 一键初始化数据库（migrate + seed）
$ErrorActionPreference = "Stop"

Write-Host "📦 正在生成 Prisma Client..."
Push-Location apps/api
try {
    npx prisma generate

    Write-Host "🗃️  正在运行数据库迁移..."
    npx prisma migrate dev --name init --skip-seed

    Write-Host "🌱 正在填充种子数据..."
    npx prisma db seed

    Write-Host "✅ 数据库初始化完成！"
    Write-Host ""
    Write-Host "🔍 提示：开发服务器启动后运行以下命令同步搜索索引："
    Write-Host "   Invoke-WebRequest -Uri http://localhost:3001/api/v1/admin/search/sync -Method POST -Headers @{'x-admin-key'='changeme'}"
} finally {
    Pop-Location
}
