'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
function getKey() {
  return typeof window !== 'undefined' ? (localStorage.getItem('admin_key') ?? '') : '';
}

const emptyForm = { name: '', slug: '', description: '', iconEmoji: '', sortOrder: 0 };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch(`${API}/admin/categories`, { headers: { 'x-admin-key': getKey() } });
    if (res.ok) setCategories(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function save() {
    const url = editId ? `${API}/admin/categories/${editId}` : `${API}/admin/categories`;
    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'x-admin-key': getKey(), 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
    });
    if (res.ok) {
      setShowForm(false); setEditId(null); setForm(emptyForm); load();
    } else {
      alert('保存失败');
    }
  }

  async function del(id: string) {
    if (!confirm('确认删除分类？该分类下工具将失去分类关联。')) return;
    await fetch(`${API}/admin/categories/${id}`, { method: 'DELETE', headers: { 'x-admin-key': getKey() } });
    load();
  }

  function startEdit(c: any) {
    setEditId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', iconEmoji: c.iconEmoji ?? '', sortOrder: c.sortOrder ?? 0 });
    setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>📁 分类管理</h1>
        <button
          onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); }}
          style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          + 新增分类
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px' }}>{editId ? '编辑分类' : '新增分类'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'name', label: '分类名称', placeholder: 'AI 写作' },
              { key: 'slug', label: 'Slug', placeholder: 'ai-writing' },
              { key: 'iconEmoji', label: '图标 Emoji', placeholder: '✍️' },
              { key: 'sortOrder', label: '排序权重', placeholder: '1' },
            ].map((f) => (
              <div key={f.key}>
                <div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>{f.label}</div>
                <input
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, marginBottom: 4, color: '#555' }}>描述</div>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}
            />
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={save} style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              {editId ? '保存修改' : '创建'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              取消
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>分类名称</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Slug</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>工具数量</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < categories.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ marginRight: 6 }}>{c.iconEmoji}</span>{c.name}
                </td>
                <td style={{ padding: '12px 16px', color: '#888', fontFamily: 'monospace', fontSize: 12 }}>{c.slug}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{c._count?.tools ?? 0}</td>
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
      </div>
    </div>
  );
}
