'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ADMIN_KEY = typeof window !== 'undefined' ? (localStorage.getItem('admin_key') ?? '') : '';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function StatCard({ title, value, link }: { title: string; value: number | string; link: string }) {
  return (
    <Link href={link} style={{
      display: 'block',
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: 12,
      padding: '20px 24px',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'box-shadow 0.15s',
    }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{value}</div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem('admin_key') ?? '';
    setKey(k);
    if (k) fetchStats(k);
  }, []);

  async function fetchStats(k: string) {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers: { 'x-admin-key': k } });
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
  }

  function saveKey() {
    localStorage.setItem('admin_key', key);
    setSaved(true);
    fetchStats(key);
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 22 }}>📊 仪表盘</h1>

      {/* Admin key setup */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Admin Key 设置</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="输入 ADMIN_SECRET 值"
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}
          />
          <button
            onClick={saveKey}
            style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {saved ? '已保存 ✓' : '保存并登录'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Key 保存在浏览器 localStorage，仅供本地开发使用。</p>
      </div>

      {/* Stats */}
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          <StatCard title="已发布工具" value={stats.totalTools} link="/admin/tools" />
          <StatCard title="待审核工具" value={stats.pendingTools} link="/admin/tools?tab=pending" />
          <StatCard title="案例总数" value={stats.totalCases} link="/admin/cases" />
          <StatCard title="分类数量" value={stats.totalCategories} link="/admin/categories" />
        </div>
      ) : (
        <div style={{ color: '#888', padding: 40, textAlign: 'center' }}>
          请设置 Admin Key 后查看统计数据
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginTop: 32, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>快速操作</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/tools?tab=pending" style={{ padding: '8px 16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, textDecoration: 'none', color: '#856404', fontSize: 14 }}>
            审核待审工具
          </Link>
          <Link href="/admin/cases" style={{ padding: '8px 16px', background: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: 8, textDecoration: 'none', color: '#0c5460', fontSize: 14 }}>
            + 新增案例
          </Link>
          <button
            onClick={async () => {
              const k = localStorage.getItem('admin_key') ?? '';
              await fetch(`${API}/admin/search/sync`, { method: 'POST', headers: { 'x-admin-key': k } });
              alert('搜索索引同步完成');
            }}
            style={{ padding: '8px 16px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 8, color: '#155724', fontSize: 14, cursor: 'pointer' }}
          >
            同步搜索索引
          </button>
        </div>
      </div>
    </div>
  );
}
