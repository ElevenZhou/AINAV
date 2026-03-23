'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ToolCard from '../../components/ui/ToolCard';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [inputVal, setInputVal] = useState(initialQ);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!q.trim()) { setResult(null); return; }
    setLoading(true);
    fetch(`${API}/search?q=${encodeURIComponent(q)}&limit=20`)
      .then((r) => r.json())
      .then((data) => setResult(data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [q]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = inputVal.trim();
    if (v) {
      setQ(v);
      router.replace(`/search?q=${encodeURIComponent(v)}`);
    }
  }

  return (
    <main>
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>›</span>
        <span>搜索</span>
      </div>

      <form className="search-page-bar" onSubmit={handleSubmit}>
        <input ref={inputRef} value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="搜索 AI 工具..." autoFocus />
        <button type="submit">搜索</button>
      </form>

      {loading && <div className="empty-state">🔍 搜索中...</div>}

      {!loading && result && (
        <>
          <p className="search-count">找到 <strong>{result.total}</strong> 个与「{result.query}」相关的结果</p>
          {result.hits?.length > 0 ? (
            <div className="grid-4">
              {result.hits.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>没有找到相关工具 🥲</p>
              <p style={{ fontSize: 13 }}>试试其他关键词，或浏览<Link href="/tools" style={{ color: 'var(--accent)', marginLeft: 4 }}>全部工具</Link></p>
            </div>
          )}
        </>
      )}

      {!loading && !result && !q && (
        <div className="empty-state">输入关键词开始搜索，例如：ChatGPT、Midjourney、Cursor</div>
      )}

      <div className="ad-slot" style={{ marginTop: 40 }}>📢 广告位 · AD_SLOT_LIST_FEED_1</div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: 'center', color: '#888' }}>加载中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
