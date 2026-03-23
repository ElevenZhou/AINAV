import Link from 'next/link';
import { getCategories, getTopTools, getTodayCase } from '../lib/api';
import ToolCard from '../components/ui/ToolCard';
import HeroSearch from '../components/ui/HeroSearch';

async function safeGetCategories() {
  try { return await getCategories(); } catch { return []; }
}
async function safeGetTopTools() {
  try { return await getTopTools(12); } catch { return []; }
}
async function safeGetTodayCase() {
  try { return await getTodayCase(); } catch { return null; }
}

export default async function HomePage() {
  const [categories, topTools, todayCase] = await Promise.all([
    safeGetCategories(),
    safeGetTopTools(),
    safeGetTodayCase(),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <h1>ai搭子 · AI中文导航</h1>
        <p>收录最新最全的 AI 工具，响应快速，每日精选真实业务案例，支持 Agent API 调用。</p>
        <HeroSearch />
        <div style={{ marginTop: 14 }}>
          <span className="pill">日更收录</span>
          <span className="pill">Meilisearch 搜索</span>
          <span className="pill">Agent API</span>
          <span className="pill">爪专区</span>
        </div>
      </section>

      {/* Category Grid */}
      <section className="section">
        <div className="section-header">
          <h2>全部分类</h2>
        </div>
        <div className="grid">
          {categories.length > 0 ? categories.map((cat: any) => (
            <Link href={`/category/${cat.slug}`} className="card" key={cat.id}>
              <h3>{cat.iconEmoji} {cat.name}</h3>
              <p>{cat.description || cat.name}</p>
              {cat._count?.tools > 0 && (
                <p style={{ marginTop: 6, color: 'var(--accent)', fontSize: 12 }}>
                  {cat._count.tools} 个工具
                </p>
              )}
            </Link>
          )) : (
            // Fallback static categories before DB is ready
            [
              { title: 'AI 对话', desc: '助手、问答、多模态', slug: 'ai-chat', emoji: '💬' },
              { title: 'AI 写作', desc: '文案、营销、内容创作', slug: 'ai-writing', emoji: '✍️' },
              { title: 'AI 绘图', desc: '图像生成、修图、商品图', slug: 'ai-image', emoji: '🎨' },
              { title: 'AI 视频', desc: '文生视频、数字人、剪辑', slug: 'ai-video', emoji: '🎬' },
              { title: 'AI 编程', desc: 'IDE、代码生成、代码审查', slug: 'ai-code', emoji: '💻' },
              { title: 'AI 智能体', desc: 'Agent、工作流自动化', slug: 'ai-agent', emoji: '🤖' },
              { title: 'AI 音频', desc: '音乐生成、语音合成', slug: 'ai-audio', emoji: '🎵' },
              { title: 'AI 效率', desc: '搜索增强、知识管理', slug: 'ai-productivity', emoji: '⚡' },
            ].map((item) => (
              <Link href={`/category/${item.slug}`} className="card" key={item.slug}>
                <h3>{item.emoji} {item.title}</h3>
                <p>{item.desc}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Top Tools */}
      {topTools.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>🔥 热门工具 TOP 12</h2>
            <Link href="/tools" className="view-more">查看全部 →</Link>
          </div>
          <div className="grid-4">
            {topTools.map((tool: any) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Daily Case */}
      <section className="section">
        <div className="section-header">
          <h2>📖 今日经典案例</h2>
          <Link href="/cases" className="view-more">查看历史 →</Link>
        </div>
        {todayCase ? (
          <Link href={`/cases/${todayCase.id}`} className="case-card">
            <span className="case-scenario">{todayCase.scenario}</span>
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{todayCase.title}</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              {todayCase.summary}
            </p>
            {todayCase.relatedToolSlugs?.length > 0 && (
              <div className="tag-cloud" style={{ marginTop: 12 }}>
                {todayCase.relatedToolSlugs.map((slug: string) => (
                  <span className="pill" key={slug}>{slug}</span>
                ))}
              </div>
            )}
          </Link>
        ) : (
          <div className="card">
            <h3>🚀 即将上线</h3>
            <p>每日精选真实业务案例，含完整提示词、操作步骤和效果展示，日更不间断。</p>
          </div>
        )}
      </section>

      {/* Claw Zone Preview */}
      <section className="section">
        <div className="section-header">
          <h2>🤖 爪专区（AI Agents）</h2>
          <Link href="/claw" className="view-more">进入专区 →</Link>
        </div>
        <div className="card">
          <p>
            OpenClaw、Dify、n8n、Coze 等自动化 Agent 工具聚合区。无需编码，拖拽构建 AI 工作流，
            连接多种数据源和 API。
          </p>
          <div style={{ marginTop: 12 }}>
            <Link href="/claw" className="cta-button">
              探索爪专区 →
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <div className="ad-slot" style={{ marginTop: 40 }}>
        📢 广告位招募中 · 联系我们 · AD_SLOT_HOME_TOP_BANNER
      </div>
    </main>
  );
}

