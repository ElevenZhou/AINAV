#!/usr/bin/env bash
# scripts/init-db.sh — 一键初始化数据库（migrate + seed）
set -e

echo "📦 正在生成 Prisma Client..."
cd apps/api
npx prisma generate

echo "🗃️  正在运行数据库迁移..."
npx prisma migrate dev --name init --skip-seed

echo "🌱 正在填充种子数据..."
npx prisma db seed

echo "🔍 正在同步 Meilisearch 索引..."
curl -s -X POST http://localhost:3001/api/v1/admin/search/sync \
  -H "x-admin-key: ${ADMIN_SECRET:-changeme}" | echo "  索引同步完成"

echo "✅ 数据库初始化完成！"
