'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function getAdminKey() {
	return typeof window !== 'undefined' ? (localStorage.getItem('admin_key') ?? '') : '';
}

function AdminToolsContent() {
	const searchParams = useSearchParams();
	const defaultTab = searchParams.get('tab') === 'pending' ? 'pending' : 'all';
	const [tab, setTab] = useState<'all' | 'pending'>(defaultTab as any);
	const [tools, setTools] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [categories, setCategories] = useState<any[]>([]);
	const [form, setForm] = useState({ name: '', slug: '', url: '', description: '', categoryId: '', isClaw: false });

	async function load() {
		setLoading(true);
		const k = getAdminKey();
		try {
			const endpoint = tab === 'pending' ? '/admin/tools/pending' : '/admin/tools?limit=50';
			const res = await fetch(`${API}${endpoint}`, { headers: { 'x-admin-key': k } });
			if (!res.ok) { setTools([]); return; }
			const data = await res.json();
			setTools(Array.isArray(data) ? data : (data.items ?? []));
		} catch { setTools([]); }
		finally { setLoading(false); }
	}

	async function loadCategories() {
		const res = await fetch(`${API}/categories`);
		if (res.ok) setCategories(await res.json());
	}

	useEffect(() => { load(); loadCategories(); }, [tab]);

	async function approve(id: string) {
		const k = getAdminKey();
		await fetch(`${API}/admin/tools/${id}/approve`, { method: 'POST', headers: { 'x-admin-key': k } });
		load();
	}

	async function reject(id: string) {
		const note = prompt('拒绝理由（可选）') ?? '';
		const k = getAdminKey();
		await fetch(`${API}/admin/tools/${id}/reject`, {
			method: 'POST',
			headers: { 'x-admin-key': k, 'content-type': 'application/json' },
			body: JSON.stringify({ note }),
		});
		load();
	}

	async function offline(id: string) {
		const k = getAdminKey();
		await fetch(`${API}/admin/tools/${id}/offline`, { method: 'POST', headers: { 'x-admin-key': k } });
		load();
	}

	async function createTool() {
		const k = getAdminKey();
		const res = await fetch(`${API}/admin/tools`, {
			method: 'POST',
			headers: { 'x-admin-key': k, 'content-type': 'application/json' },
			body: JSON.stringify(form),
		});
		if (res.ok) {
			setShowForm(false);
			setForm({ name: '', slug: '', url: '', description: '', categoryId: '', isClaw: false });
			load();
		} else {
			alert('创建失败，请检查字段');
		}
	}

	const statusColors: Record<string, string> = { PUBLISHED: '#d4edda', PENDING: '#fff3cd', OFFLINE: '#f8d7da' };
	const statusLabels: Record<string, string> = { PUBLISHED: '已发布', PENDING: '待审核', OFFLINE: '已下线' };

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
				<h1 style={{ margin: 0, fontSize: 22 }}>🛠 工具管理</h1>
				<button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
					+ 新增工具
				</button>
			</div>

			{showForm && (
				<div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, marginBottom: 20 }}>
					<h3 style={{ margin: '0 0 16px' }}>新增工具</h3>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						{[
							{ key: 'name', label: '工具名称', placeholder: 'ChatGPT' },
							{ key: 'slug', label: 'Slug', placeholder: 'chatgpt' },
							{ key: 'url', label: '访问链接', placeholder: 'https://...' },
						].map((f) => (
							<div key={f.key}>
								<div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>{f.label}</div>
								<input value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }} />
							</div>
						))}
						<div>
							<div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>分类</div>
							<select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}>
								<option value="">选择分类</option>
								{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
							</select>
						</div>
					</div>
					<div style={{ marginTop: 12 }}>
						<div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>工具描述</div>
						<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, resize: 'vertical' }} />
					</div>
					<div style={{ marginTop: 8 }}>
						<label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
							<input type="checkbox" checked={form.isClaw} onChange={(e) => setForm({ ...form, isClaw: e.target.checked })} />
							加入爪专区
						</label>
					</div>
					<div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
						<button onClick={createTool} style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>创建工具</button>
						<button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>取消</button>
					</div>
				</div>
			)}

			<div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
				{(['all', 'pending'] as const).map((t) => (
					<button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', border: '1px solid', borderRadius: 8, background: tab === t ? '#0f8a5f' : '#fff', color: tab === t ? '#fff' : '#555', borderColor: tab === t ? '#0f8a5f' : '#ddd', cursor: 'pointer', fontSize: 14 }}>
						{t === 'all' ? '全部工具' : '待审核'}
					</button>
				))}
				<button onClick={load} style={{ marginLeft: 'auto', padding: '6px 12px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>🔄 刷新</button>
			</div>

			{loading ? (
				<div style={{ textAlign: 'center', padding: 40, color: '#888' }}>加载中...</div>
			) : (
				<div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
						<thead>
							<tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
								<th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>工具名称</th>
								<th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>分类</th>
								<th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>状态</th>
								<th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>操作</th>
							</tr>
						</thead>
						<tbody>
							{tools.map((tool, i) => (
								<tr key={tool.id} style={{ borderBottom: i < tools.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
									<td style={{ padding: '12px 16px' }}>
										<div style={{ fontWeight: 600 }}>{tool.name}</div>
										<div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
											<a href={tool.url} target="_blank" rel="noopener noreferrer" style={{ color: '#888' }}>{tool.url?.slice(0, 40)}</a>
										</div>
									</td>
									<td style={{ padding: '12px 16px', color: '#555' }}>{tool.category?.name ?? '-'}</td>
									<td style={{ padding: '12px 16px' }}>
										<span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, background: statusColors[tool.status] ?? '#eee', color: '#333' }}>
											{statusLabels[tool.status] ?? tool.status}
										</span>
									</td>
									<td style={{ padding: '12px 16px' }}>
										<div style={{ display: 'flex', gap: 6 }}>
											{tool.status === 'PENDING' && (
												<>
													<button onClick={() => approve(tool.id)} style={{ padding: '4px 10px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#155724' }}>✓ 通过</button>
													<button onClick={() => reject(tool.id)} style={{ padding: '4px 10px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#721c24' }}>✗ 拒绝</button>
												</>
											)}
											{tool.status === 'PUBLISHED' && (
												<button onClick={() => offline(tool.id)} style={{ padding: '4px 10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#856404' }}>下线</button>
											)}
											<Link href={`/tools/${tool.slug}`} target="_blank" style={{ padding: '4px 10px', background: '#e2e3e5', border: '1px solid #d6d8db', borderRadius: 6, textDecoration: 'none', fontSize: 12, color: '#383d41' }}>预览</Link>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{tools.length === 0 && (
						<div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
							{tab === 'pending' ? '没有待审核的工具 ✅' : '暂无工具'}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function AdminToolsPage() {
	return (
		<Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#888' }}>加载中...</div>}>
			<AdminToolsContent />
		</Suspense>
	);
}
