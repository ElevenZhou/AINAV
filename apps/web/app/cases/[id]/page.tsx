import { apiFetch } from '../../../lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const c = await apiFetch<any>(`/cases/${id}`);
    return { title: `${c.title} - 每日案例 - ai搭子` };
  } catch {
    return { title: '案例详情 - ai搭子' };
  }
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  let c: any;
  try {
    c = await apiFetch<any>(`/cases/${id}`);
  } catch {
    notFound();
  }

  return (
    <main>
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>›</span>
        <Link href="/cases">每日案例</Link>
        <span>›</span>
        <span>{c.title?.slice(0, 20)}</span>
      </div>

      <article>
        <span className="case-scenario">{c.scenario}</span>
        <h1 style={{ fontSize: 28, margin: '10px 0 8px', lineHeight: 1.3 }}>{c.title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
          发布于 {new Date(c.publishedAt).toLocaleDateString('zh-CN')}
        </p>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--muted)' }}>场景摘要</h2>
          <p style={{ margin: 0, lineHeight: 1.7 }}>{c.summary}</p>
        </div>

        {c.steps?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>📋 操作步骤</h2>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
              {c.steps.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>💬 核心提示词</h2>
          <pre style={{
            background: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 13,
            lineHeight: 1.7,
            margin: 0,
          }}>{c.prompt}</pre>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>✅ 输出示例</h2>
          <pre style={{
            background: '#f8fff4',
            border: '1px solid #d4edda',
            padding: 16,
            borderRadius: 8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 13,
            lineHeight: 1.7,
            margin: 0,
          }}>{c.outputSample}</pre>
        </div>

        {c.riskNote && (
          <div className="card" style={{ marginBottom: 20, borderColor: '#f5c6cb', background: '#fff5f5' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 16, color: '#c0392b' }}>⚠️ 注意事项</h2>
            <p style={{ margin: 0, color: '#721c24' }}>{c.riskNote}</p>
          </div>
        )}

        {c.relatedToolSlugs?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 16, marginBottom: 10 }}>🔗 相关工具</h2>
            <div className="tag-cloud">
              {c.relatedToolSlugs.map((slug: string) => (
                <Link key={slug} href={`/tools/${slug}`} className="pill">
                  {slug} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
        <Link href="/cases" className="page-btn">← 返回案例列表</Link>
        <Link href="/" className="page-btn">🏠 首页</Link>
      </div>

      <div className="ad-slot" style={{ marginTop: 24 }}>
        📢 广告位 · AD_SLOT_LIST_FEED_1
      </div>
    </main>
  );
}
