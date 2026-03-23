import { getToolBySlug, getTools } from '../../../lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tool = await getToolBySlug(slug);
    return {
      title: `${tool.name} - ai搭子`,
      description: tool.description.slice(0, 150),
    };
  } catch {
    return { title: '工具详情 - ai搭子' };
  }
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  let tool: any;
  try {
    tool = await getToolBySlug(slug);
  } catch {
    notFound();
  }

  // Related tools from same category
  let related: any[] = [];
  try {
    const res = await getTools({ categoryId: tool.category?.id, limit: 6 });
    related = (res.items || []).filter((t: any) => t.id !== tool.id).slice(0, 5);
  } catch { /* ignore */ }

  return (
    <main>
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>›</span>
        {tool.category && (
          <>
            <Link href={`/category/${tool.category.slug}`}>{tool.category.name}</Link>
            <span>›</span>
          </>
        )}
        <span>{tool.name}</span>
      </div>

      <section className="detail-hero">
        <div style={{ flexShrink: 0 }}>
          <div className="tool-icon" style={{ width: 64, height: 64, fontSize: 36, borderRadius: 16 }}>
            {tool.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tool.iconUrl} alt={tool.name} width={52} height={52} />
            ) : (
              <span>{tool.name[0]?.toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="detail-content">
          <h1 className="detail-title">{tool.name}</h1>
          <a href={tool.url} target="_blank" rel="noopener noreferrer" className="detail-url">
            {tool.url}
          </a>
          <p className="detail-desc">{tool.description}</p>
          {tool.tags?.length > 0 && (
            <div className="tag-cloud">
              {tool.tags.map((tag: any) => (
                <span className="pill" key={tag.id}>{tag.name}</span>
              ))}
            </div>
          )}
          <a href={tool.url} target="_blank" rel="noopener noreferrer" className="cta-button">
            立即访问 →
          </a>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>同类推荐</h2>
            {tool.category && (
              <Link href={`/category/${tool.category.slug}`} className="view-more">
                更多 {tool.category.name} →
              </Link>
            )}
          </div>
          <div className="grid-4">
            {related.map((t: any) => (
              <Link key={t.id} href={`/tools/${t.slug}`} className="tool-card">
                <div className="tool-card-header">
                  <div className="tool-icon">
                    <span>{t.name[0]?.toUpperCase()}</span>
                  </div>
                  <div className="tool-name">{t.name}</div>
                </div>
                <p className="tool-desc">{t.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="ad-slot" style={{ marginTop: 40 }}>
        📢 广告位 · AD_SLOT_DETAIL_BOTTOM · 联系投放
      </div>
    </main>
  );
}
