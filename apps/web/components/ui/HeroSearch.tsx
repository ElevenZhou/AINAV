'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <form className="hero-search" onSubmit={handleSearch}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索 ChatGPT、Midjourney、Cursor..."
        aria-label="搜索AI工具"
      />
      <button type="submit">搜索</button>
    </form>
  );
}
