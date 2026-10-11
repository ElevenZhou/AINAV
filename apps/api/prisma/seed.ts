import { PrismaClient, ToolStatus, AdStatus, Role } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvForSeed() {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(process.cwd(), '../../.env.example'),
    resolve(__dirname, '../../../.env'),
    resolve(__dirname, '../../../.env.example'),
  ];

  const envFile = candidates.find((file) => existsSync(file));
  if (!envFile) return;

  const lines = readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const [key, ...rest] = line.split('=');
    if (!key || rest.length === 0) continue;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rest.join('=').trim();
  }
}

loadEnvForSeed();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Categories ─────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'ai-writing' },
      update: {},
      create: { name: 'AI 写作', slug: 'ai-writing', iconEmoji: '✍️', description: 'AI 辅助写作、文案生成工具', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-image' },
      update: {},
      create: { name: 'AI 绘图', slug: 'ai-image', iconEmoji: '🎨', description: 'AI 图像生成与编辑工具', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-code' },
      update: {},
      create: { name: 'AI 编程', slug: 'ai-code', iconEmoji: '💻', description: 'AI 代码生成与辅助开发工具', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-chat' },
      update: {},
      create: { name: 'AI 对话', slug: 'ai-chat', iconEmoji: '💬', description: '大语言模型对话助手', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-agent' },
      update: {},
      create: { name: 'AI 智能体', slug: 'ai-agent', iconEmoji: '🤖', description: 'Agent 与自动化执行工具', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-audio' },
      update: {},
      create: { name: 'AI 音频', slug: 'ai-audio', iconEmoji: '🎵', description: 'AI 音乐、语音合成与处理', sortOrder: 6 },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-video' },
      update: {},
      create: { name: 'AI 视频', slug: 'ai-video', iconEmoji: '🎬', description: 'AI 视频生成与编辑工具', sortOrder: 7 },
    }),
    prisma.category.upsert({
      where: { slug: 'ai-productivity' },
      update: {},
      create: { name: 'AI 效率', slug: 'ai-productivity', iconEmoji: '⚡', description: 'AI 效率提升与自动化工具', sortOrder: 8 },
    }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
  console.log(`✅ ${categories.length} categories seeded`);

  // ── Tags ───────────────────────────────────────────────────────────
  const tags = await Promise.all(
    ['免费', '国产', '开源', 'API可用', '中文优化', '移动端', '企业版', '新上线'].map((name) => {
      const slug = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase();
      return prisma.tag.upsert({
        where: { slug: `tag-${slug}` },
        update: {},
        create: { name, slug: `tag-${slug}` },
      });
    }),
  );
  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t]));
  console.log(`✅ ${tags.length} tags seeded`);

  // ── Helper ─────────────────────────────────────────────────────────
  async function upsertTool(data: {
    name: string;
    slug: string;
    description: string;
    url: string;
    categorySlug: string;
    isClaw?: boolean;
    hotScore?: number;
    tagNames?: string[];
  }) {
    const { categorySlug, tagNames = [], ...rest } = data;
    const cat = catMap[categorySlug];
    if (!cat) return;
    return prisma.tool.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...rest,
        searchText: [rest.name, rest.description, cat.name, ...tagNames].join(' '),
        hotScore: rest.hotScore ?? 0,
        status: ToolStatus.PUBLISHED,
        categoryId: cat.id,
        tags: {
          create: tagNames
            .map((n) => tagMap[n])
            .filter(Boolean)
            .map((t) => ({ tagId: t.id })),
        },
      },
    });
  }

  // ── Tools ──────────────────────────────────────────────────────────
  const toolsData = [
    // AI Chat
    { name: 'ChatGPT', slug: 'chatgpt', description: 'OpenAI 出品的强大对话 AI，支持多轮对话、代码生成、文档撰写等多种任务。', url: 'https://chat.openai.com', categorySlug: 'ai-chat', hotScore: 100, tagNames: ['API可用'] },
    { name: 'Claude', slug: 'claude', description: 'Anthropic 的安全导向对话 AI，擅长长文档分析、创意写作，安全性出色。', url: 'https://claude.ai', categorySlug: 'ai-chat', hotScore: 92, tagNames: ['API可用'] },
    { name: 'Kimi', slug: 'kimi', description: '月之暗面出品，支持最长 200 万字上下文，中文理解能力强，完全免费使用。', url: 'https://kimi.moonshot.cn', categorySlug: 'ai-chat', hotScore: 88, tagNames: ['国产', '免费', '中文优化'] },
    { name: '文心一言', slug: 'wenxin', description: '百度出品的大语言模型，深度整合百度生态，擅长中文创作和知识问答。', url: 'https://yiyan.baidu.com', categorySlug: 'ai-chat', hotScore: 82, tagNames: ['国产', '免费', '中文优化'] },
    { name: '通义千问', slug: 'tongyi', description: '阿里云出品的多模态大模型，支持文本、图片、文档理解，API 按量付费。', url: 'https://tongyi.aliyun.com', categorySlug: 'ai-chat', hotScore: 80, tagNames: ['国产', 'API可用', '中文优化'] },
    // AI Writing
    { name: 'Notion AI', slug: 'notion-ai', description: '内置于 Notion 的 AI 写作助手，支持一键生成摘要、扩写、改写等操作。', url: 'https://notion.so', categorySlug: 'ai-writing', hotScore: 78, tagNames: ['API可用'] },
    { name: '秘塔写作猫', slug: 'xiezuomao', description: '国产 AI 写作平台，支持公文写作、营销文案、学术论文等多种场景。', url: 'https://xiezuomao.com', categorySlug: 'ai-writing', hotScore: 72, tagNames: ['国产', '中文优化', '免费'] },
    { name: 'Jasper AI', slug: 'jasper-ai', description: '专注营销内容的 AI 写作工具，支持 Blog、广告文案、社交媒体内容生成。', url: 'https://jasper.ai', categorySlug: 'ai-writing', hotScore: 70 },
    // AI Image
    { name: 'Midjourney', slug: 'midjourney', description: '顶级 AI 图像生成工具，通过提示词生成高质量艺术级图片，支持多种风格。', url: 'https://midjourney.com', categorySlug: 'ai-image', hotScore: 98, tagNames: ['API可用'] },
    { name: 'DALL-E 3', slug: 'dalle-3', description: 'OpenAI 最新图像生成模型，与 ChatGPT 深度集成，支持精准语义理解。', url: 'https://openai.com/dall-e-3', categorySlug: 'ai-image', hotScore: 90, tagNames: ['API可用'] },
    { name: '即梦 AI', slug: 'jimeng', description: '字节跳动出品，支持文生图、图生图，界面简洁，中文提示词效果好。', url: 'https://jimeng.jianying.com', categorySlug: 'ai-image', hotScore: 75, tagNames: ['国产', '免费', '中文优化'] },
    { name: 'Stable Diffusion', slug: 'stable-diffusion', description: '开源图像生成模型，可本地部署，社区生态庞大，支持高度定制化训练。', url: 'https://stability.ai', categorySlug: 'ai-image', hotScore: 85, tagNames: ['开源', 'API可用'] },
    // AI Code
    { name: 'GitHub Copilot', slug: 'github-copilot', description: 'GitHub + OpenAI 联合出品，编辑器内实时代码补全，支持主流语言和 IDE。', url: 'https://github.com/features/copilot', categorySlug: 'ai-code', hotScore: 95, tagNames: ['API可用'] },
    { name: 'Cursor', slug: 'cursor', description: '专为 AI 编程设计的代码编辑器，原生集成多模型对话，支持大范围重构。', url: 'https://cursor.sh', categorySlug: 'ai-code', hotScore: 90, tagNames: ['API可用'] },
    { name: '通义灵码', slug: 'tongyi-lingma', description: '阿里云出品的 AI 编程助手，支持 VS Code / JetBrains，对中文注释友好。', url: 'https://lingma.aliyun.com', categorySlug: 'ai-code', hotScore: 74, tagNames: ['国产', '免费', '中文优化'] },
    { name: 'v0 by Vercel', slug: 'v0-vercel', description: '输入文字描述自动生成 React + Tailwind UI 组件代码，前端神器。', url: 'https://v0.dev', categorySlug: 'ai-code', hotScore: 82, tagNames: ['新上线', 'API可用'] },
    // AI Agent / Claw
    { name: 'OpenClaw', slug: 'openclaw', description: '强大的 AI Agents 执行平台，支持自然语言驱动的任务链与工具调用。', url: 'https://openclaw.ai', categorySlug: 'ai-agent', isClaw: true, hotScore: 88, tagNames: ['新上线', 'API可用'] },
    { name: 'n8n', slug: 'n8n', description: '可视化工作流自动化平台，支持数百种集成，可本地部署，适合企业级场景。', url: 'https://n8n.io', categorySlug: 'ai-agent', isClaw: true, hotScore: 80, tagNames: ['开源', 'API可用'] },
    { name: 'Dify', slug: 'dify', description: '国产开源 LLM 应用开发平台，内置 RAG、Agent、Workflow，一站式构建 AI 应用。', url: 'https://dify.ai', categorySlug: 'ai-agent', isClaw: true, hotScore: 85, tagNames: ['国产', '开源', 'API可用', '中文优化'] },
    { name: 'AutoGPT', slug: 'autogpt', description: '最早的 AI 自主 Agent 开源项目，支持任务规划、网络搜索、代码执行。', url: 'https://agpt.co', categorySlug: 'ai-agent', isClaw: true, hotScore: 75, tagNames: ['开源'] },
    { name: 'Coze', slug: 'coze', description: '字节跳动出品的智能体构建平台，支持发布到多渠道，内置丰富插件市场。', url: 'https://coze.com', categorySlug: 'ai-agent', isClaw: true, hotScore: 83, tagNames: ['国产', '免费', '中文优化', '新上线'] },
    // AI Audio
    { name: 'Suno AI', slug: 'suno', description: '输入歌词一键生成带人声的完整歌曲，支持多种曲风，质量惊艳。', url: 'https://suno.ai', categorySlug: 'ai-audio', hotScore: 86, tagNames: ['免费'] },
    { name: 'ElevenLabs', slug: 'elevenlabs', description: '顶级 AI 语音克隆与合成平台，声音自然逼真，支持多语言和情感控制。', url: 'https://elevenlabs.io', categorySlug: 'ai-audio', hotScore: 84, tagNames: ['API可用'] },
    // AI Video
    { name: 'Sora', slug: 'sora', description: 'OpenAI 发布的文生视频模型，支持长达 60 秒的高质量视频生成。', url: 'https://openai.com/sora', categorySlug: 'ai-video', hotScore: 92, tagNames: ['新上线'] },
    { name: '可灵 AI', slug: 'kling', description: '快手出品的 AI 视频生成工具，国内可用，支持文生视频和图生视频。', url: 'https://klingai.com', categorySlug: 'ai-video', hotScore: 84, tagNames: ['国产', '中文优化', '新上线'] },
    // AI Productivity
    { name: 'Perplexity AI', slug: 'perplexity', description: 'AI 驱动的搜索引擎，实时联网检索并给出有出处的精准答案。', url: 'https://perplexity.ai', categorySlug: 'ai-productivity', hotScore: 88, tagNames: ['免费', 'API可用'] },
    { name: 'Monica AI', slug: 'monica', description: '全能 AI 浏览器助手，侧边栏对话、网页总结、翻译，支持 Chrome 扩展。', url: 'https://monica.im', categorySlug: 'ai-productivity', hotScore: 76, tagNames: ['免费', '中文优化', '移动端'] },
  ];

  let toolCount = 0;
  for (const t of toolsData) {
    await upsertTool(t);
    toolCount++;
  }
  console.log(`✅ ${toolCount} tools seeded`);

  // ── Daily Cases ────────────────────────────────────────────────────
  const cases = [
    {
      title: '外贸商品描述多语言批量生成',
      summary: '使用 AI 将中文商品描述批量翻译并改写为专业的英语/西班牙语电商文案，效率提升 10 倍。',
      scenario: '跨境电商',
      prompt: '我有一批商品，每个商品有中文名称和简单描述。请帮我将以下商品信息改写为专业的英文亚马逊商品标题（100字以内）和5条卖点（Bullet Points），语气积极，突出核心卖点：\n\n商品名称：[商品名]\n中文描述：[描述]',
      outputSample: 'Title: Premium Wireless Noise-Cancelling Headphones - 40H Battery Life, Deep Bass...\n• Crystal-clear audio with active noise cancellation...\n• Comfortable over-ear design with memory foam cushions...',
      steps: ['整理中文商品资料表格', '使用 ChatGPT/通义千问 批量处理', '人工抽检质量', '导入亚马逊后台'],
      relatedToolSlugs: ['chatgpt', 'tongyi', 'kimi'],
      publishedAt: new Date(),
      isPinned: true,
    },
    {
      title: '用 AI 10分钟生成完整营销方案',
      summary: '从产品定位到传播策略，用结构化提示词让 AI 帮你输出可落地的营销推广方案。',
      scenario: '营销推广',
      prompt: '你是一位资深营销策划师。请根据以下产品信息，制定一份完整的数字营销方案：\n\n产品：[产品名称]\n目标用户：[用户画像]\n预算：[预算区间]\n\n请包含：1. 核心传播策略 2. 渠道组合建议 3. 内容创意方向 4. KPI 指标设定',
      outputSample: '## 营销方案\n### 一、核心传播策略\n围绕"效率革命"核心主张...\n### 二、渠道组合\n- 微信生态（40%预算）...',
      steps: ['填写产品信息模板', '投喂 AI 生成初稿', '与团队讨论修改', '细化执行计划'],
      relatedToolSlugs: ['chatgpt', 'claude', 'kimi'],
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      title: 'Cursor + AI 一天完成毕业设计代码',
      summary: '非计算机专业的同学，用 Cursor AI 编辑器从零完成一个 Web 全栈项目，含前后端和数据库。',
      scenario: '学习成长',
      prompt: '我是一名非计算机专业学生，需要完成一个学生信息管理系统。\n\n需求：\n- 前端：React 页面，可以增删改查学生信息\n- 后端：Node.js Express API\n- 数据库：SQLite\n\n请先帮我规划项目结构，然后逐步实现每个功能。',
      outputSample: '好的，让我们一步步来。首先规划项目结构：\n```\nstudent-mgmt/\n  frontend/ (React)\n  backend/ (Express)\n  README.md\n```\n接下来创建后端...',
      steps: ['安装 Cursor 编辑器', '描述项目需求让 AI 规划架构', 'AI 逐模块生成代码', '运行调试，AI 协助排错'],
      relatedToolSlugs: ['cursor', 'chatgpt', 'github-copilot'],
      publishedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      title: 'Midjourney 快速出品电商主图',
      summary: '用结构化提示词生成专业级电商产品主图，完全不需要摄影师和修图师。',
      scenario: '设计创作',
      prompt: 'Professional product photography, [产品名称], clean white background, soft studio lighting, high detail, 8K resolution, commercial photography style, Amazon product listing photo --ar 1:1 --style raw --v 6',
      outputSample: '[生成的产品图片示例：纯白背景上的产品特写，专业打光，高清细节]',
      steps: ['确定产品关键词', '套用提示词模板', '调整风格参数', '选择最佳出图下载'],
      relatedToolSlugs: ['midjourney', 'dalle-3'],
      publishedAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      title: '用 Dify 搭建企业知识库问答机器人',
      summary: '无需写代码，上传 PDF/Word 文档，10 分钟搭建一个基于内部知识库的 AI 客服助手。',
      scenario: '企业效率',
      prompt: '（此案例为操作流程演示，无需特定提示词）\n1. 在 Dify 创建知识库\n2. 上传公司制度 PDF\n3. 创建对话型应用\n4. 关联知识库\n5. 配置角色提示词：你是公司 HR 助手，只回答企业制度相关问题，引用来源。',
      outputSample: '用户：年假有几天？\nHR助手：根据公司制度（第3章第2条），员工工作满1年享有5天带薪年假，满3年享有10天，满10年享有15天。',
      steps: ['注册 Dify 账号', '创建知识库并上传文档', '等待向量化完成', '创建对话应用并配置', '分享给同事使用'],
      relatedToolSlugs: ['dify', 'openclaw'],
      publishedAt: new Date(Date.now() - 4 * 86400000),
    },
  ];

  for (const c of cases) {
    await prisma.dailyCase.upsert({
      where: { id: c.title.slice(0, 10) + '-seed' },
      update: {},
      create: { id: c.title.slice(0, 10) + '-seed', ...c },
    });
  }
  console.log(`✅ ${cases.length} daily cases seeded`);

  // ── Ad Slots ───────────────────────────────────────────────────────
  const slots = [
    { code: 'AD_SLOT_HOME_TOP_BANNER', name: '首页顶部横幅' },
    { code: 'AD_SLOT_HOME_SIDE_1', name: '首页侧边栏 1' },
    { code: 'AD_SLOT_LIST_FEED_1', name: '工具列表信息流 1' },
    { code: 'AD_SLOT_DETAIL_BOTTOM', name: '工具详情页底部' },
  ];

  const now = new Date();
  const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  for (const slot of slots) {
    const s = await prisma.adSlot.upsert({
      where: { code: slot.code },
      update: {},
      create: slot,
    });
    // Create a placeholder ad for each slot
    const existingAd = await prisma.ad.findFirst({ where: { slotId: s.id } });
    if (!existingAd) {
      await prisma.ad.create({
        data: {
          slotId: s.id,
          title: `${slot.name} - 招商中`,
          linkUrl: 'https://ainav.example.com/advertise',
          advertiser: 'ai搭子',
          status: AdStatus.DRAFT,
          startDate: now,
          endDate: futureDate,
        },
      });
    }
  }
  console.log(`✅ ${slots.length} ad slots seeded`);

  // ── Default admin user ───────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ainav.local';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, isActive: true },
    create: {
      email: adminEmail,
      displayName: 'Default Admin',
      role: Role.ADMIN,
      passwordHash: process.env.ADMIN_PASSWORD_HASH ?? '',
      isActive: true,
    },
  });
  console.log(`✅ default admin ready: ${adminEmail}`);

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
