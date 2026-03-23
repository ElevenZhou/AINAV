import { getTools, getCategories } from '../../lib/api';
import ToolCard from '../../components/ui/ToolCard';
import Link from 'next/link';

export const metadata = { title: 'AI 工具集合 - ai搭子' };

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;
  const categoryId = sp?.categoryId;

  const [data, categories] = await Promise.all([
    getTools({ page, limit: 24, ...(categoryId ? { categoryId } : {}) }).catch(() => ({
      items: [],
      total: 0,
      totalPages: 1,
    })),
    getCategories().catch(() => []),
  ]);

  return (
    <main>
      <section className="section" style={{ marginTop: 20 }}>
        <div className="section-header">
          <h1 style={{ margin: 0, fontSize: 24 }}>🛠 全部 AI 工具</h1>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>共 {data.total} 个</span>
        </div>

        {/* Category filter */}
        <div className="tag-cloud">
          <Link href="/tools" className={`pill ${!categoryId ? 'active' : ''}`}
            style={!categoryId ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : {}}>
            全部
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/tools?categoryId=${cat.id}`}
              className="pill"
              style={categoryId === cat.id ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : {}}
            >
              {cat.iconEmoji} {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid-4" style={{ marginTop: 20 }}>
          {data.items?.map((tool: any) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {data.items?.length === 0 && (
          <div className="empty-state">暂无工具</div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="pagination">
            {page > 1 && (
              <Link href={`/tools?page=${page - 1}${categoryId ? `&categoryId=${categoryId}` : ''}`} className="page-btn">
                上一页
              </Link>
            )}
            {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/tools?page=${p}${categoryId ? `&categoryId=${categoryId}` : ''}`}
                className={`page-btn ${p === page ? 'active' : ''}`}
              >
                {p}
              </Link>
            ))}
            {page < data.totalPages && (
              <Link href={`/tools?page=${page + 1}${categoryId ? `&categoryId=${categoryId}` : ''}`} className="page-btn">
                下一页
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
