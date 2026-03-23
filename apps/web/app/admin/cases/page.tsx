'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
function getKey() {
  return typeof window !== 'undefined' ? (localStorage.getItem('admin_key') ?? '') : '';
}

const emptyForm = {
  title: '',
  summary: '',
  scenario: '',
  prompt: '',
  outputSample: '',
  steps: '',
  relatedToolSlugs: '',
  riskNote: '',
  isPinned: false,
  publishedAt: new Date().toISOString().slice(0, 16),
};

export default function AdminCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/admin/cases?limit=50`, { headers: { 'x-admin-key': getKey() } });
    if (res.ok) {
      const data = await res.json();
      setCases(data.items ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    const k = getKey();
    const body = {
      ...form,
      steps: form.steps.split('\n').filter(Boolean),
      relatedToolSlugs: form.relatedToolSlugs.split(',').map((s) => s.trim()).filter(Boolean),
      publishedAt: new Date(form.publishedAt).toISOString(),
    };

    const url = editId ? `${API}/admin/cases/${editId}` : `${API}/admin/cases`;
    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'x-admin-key': k, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false); setEditId(null); setForm(emptyForm); load();
    } else {
      alert('保存失败');
    }
  }

  async function del(id: string) {
    if (!confirm('确认删除？')) return;
    await fetch(`${API}/admin/cases/${id}`, { method: 'DELETE', headers: { 'x-admin-key': getKey() } });
    load();
  }

  function startEdit(c: any) {
    setEditId(c.id);
    setForm({
      title: c.title,
      summary: c.summary,
      scenario: c.scenario,
      prompt: c.prompt,
      outputSample: c.outputSample,
      steps: (c.steps ?? []).join('\n'),
      relatedToolSlugs: (c.relatedToolSlugs ?? []).join(', '),
      riskNote: c.riskNote ?? '',
      isPinned: c.isPinned ?? false,
      publishedAt: c.publishedAt ? new Date(c.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
    setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>📖 案例管理</h1>
        <button
          onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); }}
          style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          + 新增案例
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px' }}>{editId ? '编辑案例' : '新增案例'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { key: 'title', label: '标题' },
              { key: 'scenario', label: '场景标签' },
            ].map((f) => (
              <div key={f.key}>
                <div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>{f.label}</div>
                <input
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>发布时间</div>
              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
                置顶
              </label>
            </div>
          </div>
          {[
            { key: 'summary', label: '摘要', rows: 2 },
            { key: 'prompt', label: '核心提示词', rows: 4 },
            { key: 'outputSample', label: '输出示例', rows: 3 },
            { key: 'steps', label: '操作步骤（每行一条）', rows: 3 },
            { key: 'relatedToolSlugs', label: '相关工具 Slug（逗号分隔）', rows: 1 },
            { key: 'riskNote', label: '注意事项', rows: 2 },
          ].map((f) => (
            <div key={f.key} style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>{f.label}</div>
              <textarea
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                rows={f.rows}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, resize: 'vertical' }}
              />
            </div>
          ))}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={save} style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              {editId ? '保存修改' : '创建案例'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              取消
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>加载中...</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>标题</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>场景</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>发布时间</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < cases.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {c.isPinned && <span style={{ marginRight: 4, fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '1px 6px', borderRadius: 999 }}>置顶</span>}
                    {c.title}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: 'rgba(199,93,44,0.1)', color: '#c75d2c', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>
                      {c.scenario}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#888', fontSize: 12 }}>
                    {new Date(c.publishedAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(c)} style={{ padding: '4px 10px', background: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#0c5460' }}>
                        编辑
                      </button>
                      <button onClick={() => del(c.id)} style={{ padding: '4px 10px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#721c24' }}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cases.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>暂无案例</div>
          )}
        </div>
      )}
    </div>
  );
}
