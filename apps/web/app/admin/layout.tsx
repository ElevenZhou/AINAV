'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: '📊 仪表盘', exact: true },
  { href: '/admin/tools', label: '🛠 工具管理' },
  { href: '/admin/cases', label: '📖 案例管理' },
  { href: '/admin/ads', label: '📢 广告管理' },
  { href: '/admin/categories', label: '📁 分类管理' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#1a1a2e',
        color: '#e0e0e0',
        flexShrink: 0,
        padding: '24px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 200,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>ai搭子 Admin</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>后台管理控制台</div>
        </div>
        <nav style={{ padding: '16px 0' }}>
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  color: active ? '#fff' : '#aaa',
                  textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: active ? '3px solid #0f8a5f' : '3px solid transparent',
                  fontSize: 14,
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '20px', marginTop: 'auto' }}>
          <Link href="/" style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}>
            ← 返回前台
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
