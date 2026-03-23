import { listCases, getScenarios } from '../../lib/api';
import Link from 'next/link';

export const metadata = { title: '每日经典案例 - ai搭子' };

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; scenario?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;
  const scenario = sp?.scenario;

  const [data, scenarios] = await Promise.all([
    listCases({ page, limit: 12, ...(scenario ? { scenario } : {}) }).catch(() => ({
      items: [],
      total: 0,
      totalPages: 1,
    })),
    getScenarios().catch(() => []),
  ]);

  return (
    <main>
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>›</span>
        <span>每日案例</span>
      </div>

      <section className="hero" style={{ padding: '28px 32px' }}>
        <h1 style={{ margin: 0 }}>📖 每日经典案例</h1>
        <p style={{ marginTop: 8 }}>
          真实业务场景下的 AI 应用案例，含完整提示词、操作步骤和输出示例，日更不间断。
        </p>
      </section>

      {/* Scenario filter */}
      {scenarios.length > 0 && (
        <div className="tag-cloud" style={{ marginTop: 20 }}>
          <Link href="/cases" className="pill"
            style={!scenario ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : {}}>
            全部
          </Link>
          {scenarios.map((s: string) => (
            <Link key={s} href={`/cases?scenario=${encodeURIComponent(s)}`} className="pill"
              style={scenario === s ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : {}}>
              {s}
            </Link>
          ))}
        </div>
      )}

      <section className="section">
        <div className="grid-4">
          {data.items?.map((c: any) => (
            <Link key={c.id} href={`/cases/${c.id}`} className="case-card">
              <span className="case-scenario">{c.scenario}</span>
              <h3 style={{ margin: '8px 0 6px', fontSize: 16 }}>{c.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
                {c.summary?.slice(0, 80)}...
              </p>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
                {new Date(c.publishedAt).toLocaleDateString('zh-CN')}
              </div>
            </Link>
          ))}
        </div>

        {data.items?.length === 0 && (
          <div className="empty-state">暂无案例，请稍后再来 🥲</div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="pagination">
            {page > 1 && (
              <Link href={`/cases?page=${page - 1}${scenario ? `&scenario=${encodeURIComponent(scenario)}` : ''}`} className="page-btn">
                上一页
              </Link>
            )}
            {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/cases?page=${p}${scenario ? `&scenario=${encodeURIComponent(scenario)}` : ''}`}
                className={`page-btn ${p === page ? 'active' : ''}`}
              >
                {p}
              </Link>
            ))}
            {page < data.totalPages && (
              <Link href={`/cases?page=${page + 1}${scenario ? `&scenario=${encodeURIComponent(scenario)}` : ''}`} className="page-btn">
                下一页
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
