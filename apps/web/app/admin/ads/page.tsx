'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
function getKey() {
  return typeof window !== 'undefined' ? (localStorage.getItem('admin_key') ?? '') : '';
}

export default function AdminAdsPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [showNewSlot, setShowNewSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ code: '', name: '' });
  const [showNewAd, setShowNewAd] = useState<string | null>(null);
  const [newAd, setNewAd] = useState({
    title: '', linkUrl: '', advertiser: '', startDate: '', endDate: '', status: 'DRAFT',
  });

  async function load() {
    const res = await fetch(`${API}/admin/ads/slots`, { headers: { 'x-admin-key': getKey() } });
    if (res.ok) setSlots(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function createSlot() {
    await fetch(`${API}/admin/ads/slots`, {
      method: 'POST',
      headers: { 'x-admin-key': getKey(), 'content-type': 'application/json' },
      body: JSON.stringify(newSlot),
    });
    setShowNewSlot(false); setNewSlot({ code: '', name: '' }); load();
  }

  async function createAd(slotId: string) {
    await fetch(`${API}/admin/ads`, {
      method: 'POST',
      headers: { 'x-admin-key': getKey(), 'content-type': 'application/json' },
      body: JSON.stringify({ ...newAd, slotId }),
    });
    setShowNewAd(null); load();
  }

  async function updateAdStatus(id: string, status: string) {
    await fetch(`${API}/admin/ads/${id}`, {
      method: 'PUT',
      headers: { 'x-admin-key': getKey(), 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const statusColors: Record<string, string> = {
    ACTIVE: '#d4edda', DRAFT: '#e2e3e5', PAUSED: '#fff3cd', ENDED: '#f8d7da',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>📢 广告位管理</h1>
        <button
          onClick={() => setShowNewSlot(!showNewSlot)}
          style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          + 新增广告位
        </button>
      </div>

      {showNewSlot && (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px' }}>新增广告位</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              value={newSlot.code}
              onChange={(e) => setNewSlot({ ...newSlot, code: e.target.value })}
              placeholder="广告位代码（如 AD_SLOT_HOME_BANNER）"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}
            />
            <input
              value={newSlot.name}
              onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
              placeholder="广告位名称"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}
            />
            <button onClick={createSlot} style={{ padding: '8px 16px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              创建
            </button>
          </div>
        </div>
      )}

      {slots.map((slot) => (
        <div key={slot.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{slot.name}</div>
              <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace', marginTop: 2 }}>{slot.code}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: slot.enabled ? '#0f8a5f' : '#888' }}>
                {slot.enabled ? '✓ 启用' : '已禁用'}
              </span>
              <button
                onClick={() => setShowNewAd(showNewAd === slot.id ? null : slot.id)}
                style={{ padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
              >
                + 投放广告
              </button>
            </div>
          </div>

          {showNewAd === slot.id && (
            <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>投放新广告</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'title', label: '广告标题', placeholder: '广告标题' },
                  { key: 'advertiser', label: '广告主', placeholder: '公司名称' },
                  { key: 'linkUrl', label: '跳转链接', placeholder: 'https://...' },
                ].map((f) => (
                  <div key={f.key}>
                    <div style={{ fontSize: 12, marginBottom: 4, color: '#666' }}>{f.label}</div>
                    <input
                      value={(newAd as any)[f.key]}
                      onChange={(e) => setNewAd({ ...newAd, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4, color: '#666' }}>开始日期</div>
                  <input type="date" value={newAd.startDate} onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4, color: '#666' }}>结束日期</div>
                  <input type="date" value={newAd.endDate} onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={() => createAd(slot.id)} style={{ padding: '7px 14px', background: '#0f8a5f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  确认投放
                </button>
                <button onClick={() => setShowNewAd(null)} style={{ padding: '7px 14px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Ads table */}
          {slot.ads?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#555' }}>广告标题</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#555' }}>广告主</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#555' }}>状态</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#555' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {slot.ads.map((ad: any) => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '8px 12px' }}>{ad.title}</td>
                    <td style={{ padding: '8px 12px', color: '#666' }}>-</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        padding: '1px 8px', borderRadius: 999, fontSize: 11,
                        background: statusColors[ad.status] ?? '#eee',
                      }}>
                        {ad.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {ad.status !== 'ACTIVE' && (
                          <button onClick={() => updateAdStatus(ad.id, 'ACTIVE')} style={{ padding: '2px 8px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 4, cursor: 'pointer', fontSize: 11, color: '#155724' }}>
                            启用
                          </button>
                        )}
                        {ad.status === 'ACTIVE' && (
                          <button onClick={() => updateAdStatus(ad.id, 'PAUSED')} style={{ padding: '2px 8px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, cursor: 'pointer', fontSize: 11, color: '#856404' }}>
                            暂停
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#aaa', fontSize: 13, padding: '8px 0' }}>
              此广告位暂无投放中的广告
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
