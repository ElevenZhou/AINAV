import { getCategoryBySlug, getCategories } from '../../../lib/api';
import ToolCard from '../../../components/ui/ToolCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const cat = await getCategoryBySlug(slug);
    return { title: `${cat?.name ?? slug} - AI工具 - ai搭子` };
  } catch {
    return { title: 'AI工具分类 - ai搭子' };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category: any;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  if (!category) notFound();

  const tools: any[] = category.tools ?? [];

  return (
    <main>
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>›</span>
        <span>{category.name}</span>
      </div>

      <section className="hero" style={{ padding: '28px 32px' }}>
        <h1 style={{ margin: 0 }}>
          {category.iconEmoji && <span style={{ marginRight: 8 }}>{category.iconEmoji}</span>}
          {category.name}
        </h1>
        {category.description && (
          <p style={{ marginTop: 8 }}>{category.description}</p>
        )}
        <div style={{ marginTop: 12 }}>
          <span className="pill">{tools.length} 个工具</span>
        </div>
      </section>

      <section className="section">
        <div className="grid-4">
          {tools.map((tool: any) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        {tools.length === 0 && (
          <div className="empty-state">此分类暂无工具，正在收录中...</div>
        )}
      </section>

      <div className="ad-slot" style={{ marginTop: 40 }}>
        📢 广告位 · AD_SLOT_LIST_FEED_1
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  try {
    const cats = await getCategories();
    return cats.map((c: any) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}
