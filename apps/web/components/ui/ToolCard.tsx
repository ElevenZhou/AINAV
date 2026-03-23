import Link from 'next/link';

type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  url: string;
  iconUrl?: string | null;
  hotScore?: number;
  category?: { name: string; slug: string } | null;
};

export default function ToolCard({ tool }: { tool: Tool }) {
  const initial = tool.name[0]?.toUpperCase() ?? 'A';
  const isHot = (tool.hotScore ?? 0) >= 85;

  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card">
      <div className="tool-card-header">
        <div className="tool-icon">
          {tool.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tool.iconUrl} alt={tool.name} width={28} height={28} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div>
          <div className="tool-name">
            {tool.name}
            {isHot && <span className="badge-hot">HOT</span>}
          </div>
          {tool.category && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {tool.category.name}
            </div>
          )}
        </div>
      </div>
      <p className="tool-desc">{tool.description}</p>
      {tool.category && (
        <div className="tool-footer">
          <span className="tool-category">{tool.category.name}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>访问 →</span>
        </div>
      )}
    </Link>
  );
}
