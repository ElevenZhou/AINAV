'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

const navLinks = [
  { href: '/category/ai-chat', label: 'AI 对话' },
  { href: '/category/ai-writing', label: 'AI 写作' },
  { href: '/category/ai-image', label: 'AI 绘图' },
  { href: '/category/ai-video', label: 'AI 视频' },
  { href: '/category/ai-code', label: 'AI 编程' },
  { href: '/category/ai-agent', label: 'AI 智能体' },
  { href: '/claw', label: '爪专区 🤖' },
  { href: '/cases', label: '每日案例' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (v) {
      router.push(`/search?q=${encodeURIComponent(v)}`);
    }
  }

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        ai搭子
      </Link>

      <ul className="navbar-nav">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={pathname.startsWith(link.href) ? 'active' : ''}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSearch} className="search-wrap" style={{ marginLeft: 'auto' }}>
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索 AI 工具..."
          aria-label="搜索"
        />
      </form>
    </nav>
  );
}
