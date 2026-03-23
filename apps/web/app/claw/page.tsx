import { getClawTools, getClawFeatured } from '../../lib/api';
import ToolCard from '../../components/ui/ToolCard';
import Link from 'next/link';

export const metadata = {
  title: '爪专区 - AI Agents 工具集合 - ai搭子',
  description: '聚合 OpenClaw、Dify、n8n、Coze 等 AI Agent 与自动化工具',
};

export default async function ClawPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;

  const [featured, data] = await Promise.all([
    page === 1 ? getClawFeatured().catch(() => []) : Promise.resolve([]),
    getClawTools(page).catch(() => ({ items: [], total: 0, totalPages: 1 })),
  ]);

  return (
    <main>
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>›</span>
        <span>爪专区</span>
      </div>

      <section className="claw-hero">
        <h1>🤖 爪专区</h1>
        <p style={{ color: 'var(--muted)', marginTop: 8 }}>
          AI Agents & 自动化工具聚合区 · 无需编码，拖拽构建 AI 工作流
        </p>
        <div style={{ marginTop: 14 }}>
          <span className="pill">自动执行</span>
          <span className="pill">工作流编排</span>
          <span className="pill">多工具集成</span>
          <span className="pill">知识库 RAG</span>
        </div>
      </section>

      {featured.length > 0 && page === 1 && (
        <section className="section">
          <h2 style={{ margin: '0 0 16px' }}>🔥 精选推荐</h2>
          <div className="grid-4">
            {featured.map((tool: any) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <h2>全部 Agent 工具</h2>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>共 {data.total} 个</span>
        </div>
        <div className="grid-4">
          {data.items?.map((tool: any) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        {data.items?.length === 0 && (
          <div className="empty-state">工具收录中，请稍后...</div>
        )}
      </section>

      {data.totalPages > 1 && (
        <div className="pagination">
          {page > 1 && (
            <Link href={`/claw?page=${page - 1}`} className="page-btn">上一页</Link>
          )}
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/claw?page=${p}`} className={`page-btn ${p === page ? 'active' : ''}`}>
              {p}
            </Link>
          ))}
          {page < data.totalPages && (
            <Link href={`/claw?page=${page + 1}`} className="page-btn">下一页</Link>
          )}
        </div>
      )}

      <div className="ad-slot" style={{ marginTop: 40 }}>
        📢 广告位 · AD_SLOT_LIST_FEED_1 · 爪专区专属位
      </div>
    </main>
  );
}
