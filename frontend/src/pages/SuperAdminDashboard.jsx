import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

const OCCUPATION_OPTIONS = ['employee', 'business', 'others']

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

const COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#f59e0b', '#60a5fa']

// ─── ROLE CONFIG ───────────────────────────────────────────────────────────────
const ROLE_CFG = {
  admin: { color: '#22d3ee', label: '🛡️ ADMIN', idKey: 'admin_id' },
  dealer: { color: '#4ade80', label: '🏪 DEALER', idKey: 'dealer_id' },
  sub_dealer: { color: '#f59e0b', label: '🔗 SUB DEALER', idKey: 'sub_dealer_id' },
  promotor: { color: '#a78bfa', label: '🌟 PROMOTOR', idKey: 'promotor_id' },
  customer: { color: '#f472b6', label: '👤 CUSTOMER', idKey: 'customer_id' },
}

// ─── TREE NODE COMPONENT ───────────────────────────────────────────────────────
function TreeNode({ node, role, depth = 0, dark, text, subtext, colorIdx = 0, ancestors = [], superAdminEmail = '' }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const cfg = ROLE_CFG[role]
  const c = COLORS[colorIdx % COLORS.length]

  const childRole = {
    admin: 'dealer',
    dealer: 'sub_dealer',
    sub_dealer: 'promotor',
    promotor: 'customer',
  }[role]

  const children = {
    admin: node.dealers,
    dealer: node.sub_dealers,
    sub_dealer: node.promotors,
    promotor: node.customers,
  }[role] || []

  const hasChildren = children.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      {/* Node Card */}
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{
          background: dark ? `rgba(${hexToRgb(c)},0.06)` : `rgba(${hexToRgb(c)},0.08)`,
          border: `1px solid rgba(${hexToRgb(c)},0.35)`,
          borderRadius: '12px',
          padding: '12px 16px',
          minWidth: '160px',
          maxWidth: '200px',
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      onMouseEnter={e => {
  clearTimeout(_chainHideTimer)
  e.currentTarget.style.transform = 'translateY(-3px)'
  e.currentTarget.style.boxShadow = `0 8px 24px rgba(${hexToRgb(c)},0.25)`
  e.currentTarget.style.borderColor = `rgba(${hexToRgb(c)},0.7)`
  showChainPopup(e.currentTarget, ancestors, { node, role }, dark, text, subtext, superAdminEmail)
}}
      onMouseLeave={e => {
  e.currentTarget.style.transform = 'translateY(0)'
  e.currentTarget.style.boxShadow = 'none'
  e.currentTarget.style.borderColor = `rgba(${hexToRgb(c)},0.35)`
  _chainHideTimer = setTimeout(() => removeChainPopup(), 300)
}}
      >
        {/* Role Badge */}
        <div style={{
          display: 'inline-block', fontSize: '9px', fontWeight: 700,
          padding: '2px 8px', borderRadius: '20px', marginBottom: '8px',
          background: `rgba(${hexToRgb(c)},0.15)`,
          color: c, border: `1px solid rgba(${hexToRgb(c)},0.35)`,
        }}>
          {cfg.label}
        </div>

        {/* ID */}
        <div style={{ color: c, fontFamily: 'monospace', fontSize: '10px', marginBottom: '4px', wordBreak: 'break-all' }}>
          {node[cfg.idKey]}
        </div>

        {/* Name */}
        <div style={{ color: text, fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
          {node.first_name} {node.last_name || ''}
        </div>

        {/* Phone */}
        <div style={{ color: subtext, fontSize: '11px', marginBottom: '2px' }}>
          📞 {node.mobile_number}
        </div>

        {/* City */}
        {node.city_name && (
          <div style={{ color: subtext, fontSize: '11px' }}>📍 {node.city_name}</div>
        )}

      {/* Gradient bar */}
<div style={{
  marginTop: '8px', width: '100%', height: 2, borderRadius: 2,
  background: `linear-gradient(90deg,rgba(${hexToRgb(c)},0.2),${c})`,
}} />

{/* Print Button */}
<button
 onClick={e => {
  e.stopPropagation()
  printPersonCard(node, role, cfg, c, ancestors, superAdminEmail)
}}
  style={{
    marginTop: '8px', width: '100%',
    padding: '3px 0', fontSize: '9px', fontWeight: 700,
    background: `rgba(${hexToRgb(c)},0.1)`,
    border: `1px solid rgba(${hexToRgb(c)},0.35)`,
    borderRadius: '6px', color: c, cursor: 'pointer',
    letterSpacing: '0.8px', transition: 'all 0.2s ease',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = `rgba(${hexToRgb(c)},0.25)`
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = `rgba(${hexToRgb(c)},0.1)`
  }}
>
  🖨️ PRINT
</button>

        {/* Expand indicator */}
      {hasChildren && (
  <div style={{
    position: 'absolute', top: '8px', right: '10px',
    color: c, fontSize: '10px', fontWeight: 700,
    transition: 'transform 0.3s ease',
    transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
  }}>
    ▲
  </div>
)}

        {/* Children count badge */}
        {hasChildren && (
          <div style={{
            position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
            background: c, color: '#000', fontSize: '9px', fontWeight: 800,
            padding: '1px 7px', borderRadius: '20px', whiteSpace: 'nowrap',
          }}>
            {children.length} {childRole?.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

          {/* ── Vertical stem down from parent ── */}
          <div style={{ width: 2, height: 28, background: `linear-gradient(180deg,${c},rgba(${hexToRgb(c)},0.3))`, marginTop: '10px' }} />

          {/* ── Horizontal line + children ── */}
          <div style={{ position: 'relative', width: '100%' }}>

            {/* Horizontal connector line — spans full width */}
            {children.length > 1 && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `rgba(${hexToRgb(c)},0.45)`,
              }} />
            )}

            {/* Children row */}
            <div style={{
              display: 'flex',
              justifyContent: children.length === 1 ? 'center' : 'space-between',
              alignItems: 'flex-start',
              gap: '8px',
              paddingTop: '0',
            }}>
              {children.map((child, ci) => (
                <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: children.length === 1 ? '0 0 auto' : 1 }}>
                  {/* Vertical stem down to each child */}
                  <div style={{ width: 2, height: 20, background: `rgba(${hexToRgb(c)},0.5)` }} />
                  <TreeNode
                    node={child}
                    role={childRole}
                    depth={depth + 1}
                    dark={dark}
                    text={text}
                    subtext={subtext}
                    colorIdx={colorIdx + ci + 1}
                    ancestors={[...ancestors, { node, role }]}
                    superAdminEmail={superAdminEmail}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// hex to rgb helper
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

let _popupEl = null
let _hideTimer = null

// ─── CHAIN POPUP (hover on any tree node) ──────────────────────────────────
const ROLE_LABELS = {
  admin: { emoji: '🛡️', label: 'ADMIN', color: '#22d3ee', idKey: 'admin_id' },
  dealer: { emoji: '🏪', label: 'DEALER', color: '#4ade80', idKey: 'dealer_id' },
  sub_dealer: { emoji: '🔗', label: 'SUB DEALER', color: '#f59e0b', idKey: 'sub_dealer_id' },
  promotor: { emoji: '🌟', label: 'PROMOTOR', color: '#a78bfa', idKey: 'promotor_id' },
  customer: { emoji: '👤', label: 'CUSTOMER', color: '#f472b6', idKey: 'customer_id' },
}

let _chainPopupEl = null
let _chainHideTimer = null

function removeChainPopup() {
  document.querySelectorAll('#chain-popup').forEach(el => el.remove())
  _chainPopupEl = null
}

function scheduleHideChainPopup() {
  clearTimeout(_chainHideTimer)
  _chainHideTimer = setTimeout(() => removeChainPopup(), 200)
}

function printPersonCard(node, role, cfg, color, ancestors, superAdminEmail) {
  const ROLE_PRINT = {
    admin:      { label: 'ADMIN',      emoji: '🛡️', idKey: 'admin_id' },
    dealer:     { label: 'DEALER',     emoji: '🏪', idKey: 'dealer_id' },
    sub_dealer: { label: 'SUB DEALER', emoji: '🔗', idKey: 'sub_dealer_id' },
    promotor:   { label: 'PROMOTOR',   emoji: '🌟', idKey: 'promotor_id' },
    customer:   { label: 'CUSTOMER',   emoji: '👤', idKey: 'customer_id' },
  }

  // Full chain: Super Admin + ancestors + current
  const chain = [
    { type: 'super_admin', data: { email: superAdminEmail } },
    ...ancestors.map(a => ({ type: a.role, data: a.node })),
    { type: role, data: node },
  ]

  const chainHtml = chain.map((item, idx) => {
    const isLast = idx === chain.length - 1

    if (item.type === 'super_admin') {
      return `
        <div class="chain-item ${isLast ? 'current' : ''}">
          <div class="chain-role">🛡️ SUPER ADMIN</div>
          <div class="chain-email">${item.data.email || '—'}</div>
        </div>
        ${idx < chain.length - 1 ? `<div class="chain-arrow"><div style="display:flex;flex-direction:column;align-items:center;gap:0px;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid #94a3b8;"></div><div style="width:2px;height:12px;background:linear-gradient(180deg,#94a3b8,rgba(148,163,184,0.2));"></div></div></div>` : ''}      `
    }

    const r = ROLE_PRINT[item.type]
    if (!r) return ''
    const d = item.data || {}
    const idVal = d[r.idKey] || d.id || '—'
    const name = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'
    const phone = d.mobile_number || '—'
    const city = d.city_name || '—'

    return `
      <div class="chain-item ${isLast ? 'current' : ''}">
        <div class="chain-role">${r.emoji} ${r.label}</div>
        <div class="chain-id">${idVal}</div>
        <div class="chain-name">${name}</div>
        <div class="chain-info">📞 ${phone}</div>
        <div class="chain-info">📍 ${city}</div>
      </div>
      ${idx < chain.length - 1 ? `<div class="chain-arrow"><div style="display:flex;flex-direction:column;align-items:center;gap:0px;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid #94a3b8;"></div><div style="width:2px;height:12px;background:linear-gradient(180deg,#94a3b8,rgba(148,163,184,0.2));"></div></div></div>` : ''}
    `
  }).join('')

  const currentName = [node.first_name, node.last_name].filter(Boolean).join(' ') || '—'
  const roleLabel = ROLE_PRINT[role]?.label || role.toUpperCase()

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${roleLabel} — ${currentName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #f8fafc;
          padding: 40px;
          display: flex; justify-content: center;
        }
        .wrapper {
          max-width: 480px; width: 100%;
        }
        .header {
          text-align: center;
          margin-bottom: 28px;
        }
        .header h1 {
          font-size: 20px; font-weight: 800; color: #020617;
        }
        .header p {
          font-size: 12px; color: #64748b; margin-top: 4px;
        }
        .chain-item {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 18px;
        }
        .chain-item.current {
          border-color: ${color};
          background: ${color}11;
          box-shadow: 0 4px 16px ${color}22;
        }
        .chain-role {
          font-size: 10px; font-weight: 800;
          color: #64748b; letter-spacing: 1px;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .chain-item.current .chain-role {
          color: ${color};
        }
        .chain-id {
          font-family: monospace; font-size: 11px;
          color: ${color}; margin-bottom: 4px;
        }
        .chain-name {
          font-size: 16px; font-weight: 800;
          color: #020617; margin-bottom: 6px;
        }
        .chain-email {
          font-size: 12px; color: #475569;
        }
        .chain-info {
          font-size: 12px; color: #475569;
          margin-top: 3px;
        }
        .chain-arrow {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}
.chain-arrow::before {
  content: '';
  display: flex;
  flex-direction: column;
  align-items: center;
}
        .footer {
          text-align: center;
          font-size: 10px; color: #94a3b8;
          margin-top: 24px; letter-spacing: 0.5px;
        }
        @media print {
          body { background: white; padding: 20px; }
          .chain-item { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>BitByte — ${roleLabel} Profile</h1>
          <p>Hierarchy Chain Report</p>
        </div>
        ${chainHtml}
        <div class="footer">
          Printed on ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}
        </div>
      </div>
      <script>window.onload = () => { window.print() }<\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
} 

function showChainPopup(anchorEl, ancestors, current, dark, text, subtext, superAdminEmail) {
  clearTimeout(_chainHideTimer)
  removeChainPopup()

  const chain = [
    { type: 'super_admin', data: { email: superAdminEmail } },
    ...ancestors.map(a => ({ type: a.role, data: a.node })),
    { type: current.role, data: current.node },
  ]

  const el = document.createElement('div')
  el.id = 'chain-popup'

  // Inject scrollbar styles once
  if (!document.getElementById('chain-popup-styles')) {
    const s = document.createElement('style')
    s.id = 'chain-popup-styles'
    s.textContent = `
      #chain-popup::-webkit-scrollbar{width:6px}
      #chain-popup::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);border-radius:10px;margin:4px 0}
      #chain-popup::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#22d3ee,#4ade80);border-radius:10px;box-shadow:0 0 6px rgba(34,211,238,0.4)}
      #chain-popup::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#67e8f9,#86efac)}
      #chain-popup{scrollbar-color:rgba(34,211,238,0.5) rgba(255,255,255,0.03)}
    `
    document.head.appendChild(s)
  }

  const isDark = dark
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${isDark ? 'rgba(5,10,20,0.97)' : 'rgba(248,250,252,0.98)'};
    border:1px solid ${isDark ? 'rgba(34,211,238,0.22)' : 'rgba(37,99,235,0.18)'};
    border-radius:20px; padding:20px;
    box-shadow:${isDark
      ? '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(34,211,238,0.06), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(37,99,235,0.05)'};
    animation:acpSlideIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
    min-width:200px; max-width:260px;
    max-height:85vh; overflow-y:auto; overflow-x:hidden;
    scroll-behavior:smooth; scrollbar-width:thin;
    scroll-padding:8px;
    -webkit-overflow-scrolling:touch;
    backdrop-filter:blur(28px);
    font-family:'Inter',system-ui,sans-serif;
  `

  const totalNodes = chain.length

  const itemsHtml = chain.map((item, idx) => {
    const isLast = idx === chain.length - 1
    const isSuperAdmin = item.type === 'super_admin'

    const arrowHtml = idx > 0 ? `
      <div style="display:flex;justify-content:center;padding:5px 0;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
          <div style="width:1.5px;height:16px;background:linear-gradient(180deg,rgba(34,211,238,0.65),rgba(34,211,238,0.1));"></div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid rgba(34,211,238,0.5);"></div>
        </div>
      </div>` : ''

    if (isSuperAdmin) {
      return `
        ${arrowHtml}
        <div style="
          border-radius:14px;padding:14px 16px;
          background:${isDark ? 'linear-gradient(135deg,rgba(255,215,0,0.09),rgba(255,140,0,0.04))' : 'linear-gradient(135deg,rgba(255,215,0,0.14),rgba(255,140,0,0.06))'};
          border:1px solid rgba(255,215,0,0.28);
          position:relative;overflow:hidden;
        ">
          <div style="position:absolute;top:-10px;right:-10px;width:70px;height:70px;background:radial-gradient(circle,rgba(255,215,0,0.14),transparent 70%);pointer-events:none;"></div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#ffd700,#ff8c00);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;box-shadow:0 4px 12px rgba(255,215,0,0.35);">🛡️</div>
            <div>
              <div style="font-size:9px;color:#ffd700;font-weight:800;letter-spacing:1.8px;">SUPER ADMIN</div>
              <div style="font-size:8px;color:rgba(255,215,0,0.45);margin-top:2px;letter-spacing:0.5px;">ROOT • FULL ACCESS</div>
            </div>
            <div style="margin-left:auto;display:flex;align-items:center;gap:5px;">
              <div style="width:7px;height:7px;border-radius:50%;background:#4ade80;animation:acpPulse 1.8s ease-in-out infinite;box-shadow:0 0 8px rgba(74,222,128,0.9);"></div>
              <span style="font-size:9px;color:#4ade80;font-weight:700;">LIVE</span>
            </div>
          </div>
          <div style="font-size:12px;color:${isDark ? '#cbd5e1' : '#475569'};word-break:break-all;font-family:monospace;letter-spacing:0.3px;">${item.data.email || '—'}</div>
        </div>
      `
    }

    const cfg = ROLE_LABELS[item.type]
    if (!cfg) return ''
    const d = item.data || {}
    const idVal = d[cfg.idKey] || d.id || '—'
    const name = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'
    const phone = d.mobile_number || '—'
    const city = d.city_name || ''
    const rc = hexToRgb(cfg.color)

    return `
      ${arrowHtml}
      <div style="
        border-radius:14px;padding:14px 16px;
        background:${isLast
          ? `linear-gradient(135deg,rgba(${rc},0.13),rgba(${rc},0.05))`
          : `rgba(${rc},0.04)`};
        border:${isLast
          ? `1.5px solid rgba(${rc},0.55)`
          : `1px solid rgba(${rc},0.16)`};
        position:relative;overflow:hidden;
        ${isLast ? `animation:acpGlow 3s ease-in-out infinite;` : ''}
      ">
        ${isLast ? `<div style="position:absolute;top:-15px;right:-15px;width:80px;height:80px;background:radial-gradient(circle,rgba(${rc},0.18),transparent 70%);pointer-events:none;"></div>` : ''}

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:11px;">
          <div style="width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,${cfg.color},rgba(${rc},0.45));display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;box-shadow:0 4px 12px rgba(${rc},0.3);">${cfg.emoji}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:9px;color:${cfg.color};font-weight:800;letter-spacing:1.8px;">${cfg.label}</div>
            <div style="font-size:9px;color:${cfg.color};font-family:monospace;opacity:0.6;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${idVal}</div>
          </div>
          ${isLast ? `
          <div style="font-size:8px;font-weight:800;padding:3px 9px;border-radius:20px;
            background:rgba(${rc},0.18);color:${cfg.color};
            border:1px solid rgba(${rc},0.4);
            animation:acpBadgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
            white-space:nowrap;letter-spacing:0.5px;">● CURRENT</div>` : ''}
        </div>

        <div style="font-size:14px;color:${isDark ? '#f1f5f9' : '#0f172a'};font-weight:700;margin-bottom:9px;letter-spacing:-0.3px;">${name}</div>

        <div style="display:flex;flex-direction:column;gap:6px;">
          ${phone !== '—' ? `
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:20px;height:20px;border-radius:6px;background:rgba(${rc},0.12);border:1px solid rgba(${rc},0.2);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;">📞</div>
            <span style="font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};">${phone}</span>
          </div>` : ''}
          ${city ? `
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:20px;height:20px;border-radius:6px;background:rgba(${rc},0.12);border:1px solid rgba(${rc},0.2);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;">📍</div>
            <span style="font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};">${city}</span>
          </div>` : ''}
        </div>
      </div>
    `
  }).join('')

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid ${isDark ? 'rgba(34,211,238,0.1)' : 'rgba(37,99,235,0.08)'};">
      <div style="display:flex;align-items:center;gap:9px;">
        <div style="width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#22d3ee,#4ade80);display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 4px 10px rgba(34,211,238,0.4);">🔗</div>
        <div>
          <div style="font-size:11px;color:${isDark ? '#22d3ee' : '#2563eb'};font-weight:800;letter-spacing:1.8px;">HIERARCHY CHAIN</div>
          <div style="font-size:9px;color:${isDark ? '#475569' : '#94a3b8'};margin-top:2px;">${totalNodes} level${totalNodes !== 1 ? 's' : ''} deep</div>
        </div>
      </div>
      <div style="
        font-size:9px;font-weight:800;padding:4px 11px;border-radius:20px;
        background:linear-gradient(90deg,rgba(34,211,238,0.15),rgba(74,222,128,0.12),rgba(34,211,238,0.15));
        background-size:200% auto;
        animation:acpShimmer 2.5s linear infinite;
        border:1px solid rgba(34,211,238,0.22);
        color:${isDark ? '#67e8f9' : '#2563eb'};
        letter-spacing:1px;">● LIVE</div>
    </div>

    ${itemsHtml}

    <div style="margin-top:14px;padding-top:12px;border-top:1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'};">
      <div style="font-size:9px;color:${isDark ? '#334155' : '#cbd5e1'};text-align:center;letter-spacing:0.8px;font-weight:600;">BitByte Network • Hierarchy View</div>
    </div>
  `

  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = 280
  const popH = Math.min(el.scrollHeight || 460, window.innerHeight * 0.85)
  let left = rect.right + 18
  let top = rect.top + (rect.height / 2) - (popH / 2)
  if (left + popW > window.innerWidth - 12) left = rect.left - popW - 18
  if (top < 12) top = 12
  if (top + popH > window.innerHeight - 12) top = window.innerHeight - popH - 12
  el.style.left = left + 'px'
  el.style.top = top + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_chainHideTimer))
  el.addEventListener('mouseleave', () => scheduleHideChainPopup())
  _chainPopupEl = el
}

function removeAdminPopup() {
  document.querySelectorAll('#admin-popup').forEach(el => el.remove())
  _popupEl = null
}

function scheduleHidePopup(setActiveAdmin) {
  clearTimeout(_hideTimer)
  _hideTimer = setTimeout(() => {
    removeAdminPopup()
    setActiveAdmin(null)
  }, 120)
}

function createAdminPopup(a, i, anchorEl, dark, subtext, text) {
  removeAdminPopup()
  const c = COLORS[i % COLORS.length]
  const popupBg = dark ? 'linear-gradient(160deg,#091525,#060e1c)' : 'linear-gradient(160deg,#ffffff,#f1f5f9)'
  const popupBorder = dark ? 'rgba(34,211,238,0.25)' : 'rgba(37,99,235,0.25)'
  const saBoxBg = dark ? 'rgba(255,215,0,0.05)' : 'rgba(255,193,7,0.08)'
  const saBoxBorder = dark ? 'rgba(255,215,0,0.22)' : 'rgba(255,193,7,0.35)'
  const adminBoxBg = dark ? 'rgba(34,211,238,0.04)' : 'rgba(37,99,235,0.05)'
  const adminBoxBd = dark ? 'rgba(34,211,238,0.14)' : 'rgba(37,99,235,0.2)'
  const accentColor = dark ? '#22d3ee' : '#2563eb'

  const el = document.createElement('div')
  el.id = 'admin-popup'
  el.style.cssText = `
  position:fixed; z-index:9999;
  background:${popupBg}; border:1px solid ${popupBorder};
  border-radius:14px; padding:14px;
  box-shadow:0 16px 48px rgba(0,0,0,0.45);
  animation:popupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
  min-width:200px; max-width:240px;
  max-height:82vh;
  overflow-y:auto;
  overflow-x:hidden;
  scroll-behavior:smooth;
  scrollbar-width:thin;
  scrollbar-color:rgba(34,211,238,0.4) transparent;
`
  el.innerHTML = `
    <div style="font-size:9px;color:${accentColor};font-weight:700;letter-spacing:1.3px;margin-bottom:11px;padding-bottom:9px;border-bottom:1px solid ${popupBorder};display:flex;align-items:center;gap:6px;">
      <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};display:inline-block;"></span>
      CREATED BY
    </div>
    <div style="border-radius:9px;padding:11px;margin-bottom:10px;background:${saBoxBg};border:1px solid ${saBoxBorder};">
      <div style="font-size:9px;color:#ffd700;font-weight:700;margin-bottom:5px;">🛡️ SUPER ADMIN</div>
      <div style="font-size:11px;color:${subtext};word-break:break-all;">${localStorage.getItem('email')}</div>
      <div style="margin-top:6px;font-size:9px;padding:2px 8px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);border-radius:20px;color:#ffd700;display:inline-block;">● ONLINE</div>
    </div>
    <div style="display:flex;justify-content:center;align-items:center;padding:4px 0;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid ${accentColor};"></div>
        <div style="width:2px;height:7px;background:linear-gradient(180deg,${accentColor},${accentColor}44);"></div>
      </div>
    </div>
    <div style="background:${adminBoxBg};border:1px solid ${adminBoxBd};border-radius:10px;padding:11px;">
      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(34,211,238,0.12);color:#22d3ee;border:1px solid rgba(34,211,238,0.25);margin-bottom:6px;">ADMIN</div>
      <div style="font-size:10px;color:${c};font-family:monospace;margin-bottom:3px;">${a.admin_id}</div>
      <div style="font-size:13px;color:${text};font-weight:700;margin-bottom:6px;">${a.first_name}</div>
      <div style="font-size:11px;color:${subtext};margin-bottom:3px;">📞 ${a.mobile_number}</div>
      <div style="font-size:11px;color:${subtext};">📍 ${a.city_name}</div>
    </div>
  `
  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = el.offsetWidth || 230
  const popH = el.offsetHeight || 220
  let left = rect.right + 14
  let top = rect.top + (rect.height / 2) - (popH / 2)
  if (left + popW > window.innerWidth - 10) left = rect.left - popW - 14
  if (top < 8) top = 8
  if (top + popH > window.innerHeight - 8) top = window.innerHeight - popH - 8
  el.style.left = left + 'px'
  el.style.top = top + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_hideTimer))
  el.addEventListener('mouseleave', () => scheduleHidePopup(setActiveAdmin))
  _popupEl = el
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [admins, setAdmins] = useState([])
  const [hierarchyData, setHierarchyData] = useState(null)
  const [hierarchyLoading, setHierarchyLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [activeAdmin, setActiveAdmin] = useState(null)
  const hideTimer = useRef(null)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    initial: '', first_name: '', last_name: '', mobile_number: '', door_no: '', street_name: '', town_name: '',
    city_name: '', district: '', state: '', email: '', password: '',
    aadhaar_no: '', pan_no: '', occupation: 'employee', occupation_detail: '',
    annual_salary: '', admin_name: '', admin_id: '', admin_contact_no: ''
  })
  const canvasRef = useRef(null)

  const bg = dark ? '#020617' : '#f8fafc'
  const text = dark ? '#f8fafc' : '#020617'
  const subtext = dark ? '#94a3b8' : '#64748b'
  const accent = dark ? '#22d3ee' : '#2563eb'
  const border = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const glass = dark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.7)'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cardBorder = dark ? '1px solid rgba(103,232,249,0.1)' : '1px solid rgba(0,0,0,0.1)'
  const inpBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const inpBorder = dark ? '#374151' : '#d1d5db'

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId, particlesArray = []
    const mouse = { x: null, y: null, radius: 150 }
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const handleMouseMove = (e) => { mouse.x = e.x; mouse.y = e.y }
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    handleResize()
    class Particle {
      constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2 + 1; this.speedX = (Math.random() - .5) * .8; this.speedY = (Math.random() - .5) * .8 }
      update() {
        this.x += this.speedX; this.y += this.speedY
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1
        let dx = mouse.x - this.x, dy = mouse.y - this.y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < mouse.radius) { const fx = dx / d, fy = dy / d, f = (mouse.radius - d) / mouse.radius; this.x -= fx * f * 5; this.y -= fy * f * 5 }
      }
      draw() { ctx.fillStyle = dark ? 'rgba(34,211,238,0.5)' : 'rgba(37,99,235,0.4)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill() }
    }
    function init() { particlesArray = []; for (let i = 0; i < 60; i++) particlesArray.push(new Particle()) }
    function connect() {
      for (let a = 0; a < particlesArray.length; a++) for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x, dy = particlesArray[a].y - particlesArray[b].y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 150) { ctx.strokeStyle = dark ? `rgba(34,211,238,${1 - d / 150})` : `rgba(37,99,235,${0.5 - d / 300})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke() }
      }
    }
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particlesArray.forEach(p => { p.update(); p.draw() }); connect(); animationFrameId = requestAnimationFrame(animate) }
    init(); animate()
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId) }
  }, [dark])

  const fetchAdmins = async () => {
    try { const res = await api.get('/admins/'); setAdmins(res.data) } catch { }
  }

  const fetchHierarchy = async () => {
    setHierarchyLoading(true)
    try {
      const res = await api.get('/hierarchy/full/')
      setHierarchyData(res.data)
    } catch (err) {
      console.error('Hierarchy fetch error:', err)
    }
    setHierarchyLoading(false)
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleOpenHierarchy = () => {
    setShowHierarchy(true)
    fetchHierarchy()
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/admins/', form)
      setMsg('✅ Admin created successfully!')
      setShowForm(false)
      fetchAdmins()
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data))
    }
  }

  const s = {
    card: { background: cardBg, border: cardBorder, borderRadius: '20px', padding: '32px 36px', marginBottom: '24px' },
    secHead: { color: '#a5f3fc', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px', paddingBottom: '14px', borderBottom: cardBorder },
    secSub: { color: '#a5f3fc', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0', paddingBottom: '10px', borderBottom: cardBorder },
    lbl: { display: 'block', color: subtext, fontSize: '12px', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.04em' },
    inp: { width: '100%', background: inpBg, border: `1px solid ${inpBorder}`, borderRadius: '10px', padding: '12px 16px', color: text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  }

  // Count total members
  const totalStats = hierarchyData ? {
    admins: hierarchyData.admins.length,
    dealers: hierarchyData.admins.reduce((a, ad) => a + ad.dealers.length, 0),
    subDealers: hierarchyData.admins.reduce((a, ad) => a + ad.dealers.reduce((b, d) => b + d.sub_dealers.length, 0), 0),
    promotors: hierarchyData.admins.reduce((a, ad) => a + ad.dealers.reduce((b, d) => b + d.sub_dealers.reduce((c, sd) => c + sd.promotors.length, 0), 0), 0),
    customers: hierarchyData.admins.reduce((a, ad) => a + ad.dealers.reduce((b, d) => b + d.sub_dealers.reduce((c, sd) => c + sd.promotors.reduce((e, pr) => e + pr.customers.length, 0), 0), 0), 0),
  } : null

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, transition: 'background 0.8s ease, color 0.4s ease', fontFamily: '"Inter",system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 8px rgba(34,211,238,0.15);}50%{box-shadow:0 0 22px rgba(34,211,238,0.35);}}
        @keyframes dotPulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.6);opacity:1;}}
        @keyframes popupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .sa-inp:focus{border-color:#22d3ee !important}
        .sa-grad-btn{position:relative;overflow:hidden}
        .sa-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .sa-grad-btn:hover::after{animation:shimmer 1s infinite}
        .sa-tr:hover td{background:rgba(255,255,255,.02)}
        @keyframes acpSlideIn{from{opacity:0;transform:translateX(18px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes acpPulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes acpGlow{0%,100%{box-shadow:0 0 0px rgba(34,211,238,0)}50%{box-shadow:0 0 20px rgba(34,211,238,0.22)}}
        @keyframes acpShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes acpBadgePop{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}

        .h-card{background:rgba(255,255,255,0.03);border:1px solid rgba(165,243,252,0.18);border-radius:14px;padding:14px 18px;min-width:140px;cursor:pointer;position:relative;overflow:hidden;transition:background 0.35s ease,border-color 0.35s ease,transform 0.4s cubic-bezier(0.34,1.4,0.64,1),box-shadow 0.35s ease;}
        .h-card.h-active{background:rgba(34,211,238,0.07);border-color:rgba(34,211,238,0.65);transform:translateY(-6px) scale(1.02);box-shadow:0 12px 32px rgba(34,211,238,0.18);animation:pulseGlow 2.5s ease-in-out infinite;}
        .tree-node-enter{animation:fadeIn 0.4s ease both;}
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.45 }} />

      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, top: '8%', left: '8%', width: '380px', height: '380px', background: dark ? 'rgba(34,211,238,0.08)' : 'rgba(37,99,235,0.08)' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, bottom: '10%', right: '4%', width: '460px', height: '460px', background: dark ? 'rgba(236,72,153,0.05)' : 'rgba(219,39,119,0.05)', animationDelay: '-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.x}%`, bottom: '-100px', width: p.size, height: p.size, borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%', border: `1px solid ${accent}44`, opacity: p.opacity, animation: `antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op': p.opacity, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position: 'relative', zIndex: 10, background: glass, borderBottom: `1px solid ${border}`, padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(16px)', transition: 'background 0.8s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
          <img src={logo} alt="BitByte Logo" style={{ width: 60, height: 50, borderRadius: '10px', objectFit: 'contain' }} />
          <span style={{ color: '#a5f3fc', fontWeight: 700, fontSize: '14px' }}>🛡️ Super Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ color: subtext, fontSize: '14px' }}>{localStorage.getItem('email')}</span>
          <button onClick={() => setDark(!dark)}
            style={{ padding: '8px 16px', borderRadius: '16px', border: `1px solid ${border}`, background: 'transparent', color: text, cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.3s ease' }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding: '8px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '36px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {msg && (
          <div style={{ background: msg.includes('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('✅') ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.3)'}`, color: msg.includes('✅') ? '#4ade80' : '#f87171', borderRadius: '12px', padding: '14px 20px', fontSize: '14px', marginBottom: '20px' }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Admin Management</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleOpenHierarchy}
              style={{ padding: '11px 28px', background: 'rgba(165,243,252,0.08)', border: '1px solid rgba(103,232,249,0.3)', borderRadius: '12px', fontWeight: 700, color: '#a5f3fc', fontSize: '14px', cursor: 'pointer' }}>
              🏢 Admin Hierarchy
            </button>
            <button onClick={() => setShowForm(!showForm)} className="sa-grad-btn"
              style={{ padding: '11px 28px', background: 'linear-gradient(90deg,#22d3ee,#4ade80)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#006165', fontSize: '14px', cursor: 'pointer' }}>
              {showForm ? 'Cancel' : '+ Create Admin'}
            </button>
          </div>
        </div>

        {/* ── FULL HIERARCHY MODAL ── */}
 {/* ── FULL HIERARCHY MODAL ── */}
{showHierarchy && (
  <div
    onClick={() => { setShowHierarchy(false); setActiveAdmin(null); removeAdminPopup() }}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ background: dark ? '#0a1628' : '#f8fafc', border: '1px solid rgba(103,232,249,0.2)', borderRadius: '24px', width: '95%', maxWidth: '1100px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >

      {/* HEADER - fixed top */}
      <div style={{ flexShrink: 0, padding: '20px 28px', borderBottom: '1px solid rgba(103,232,249,0.1)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <span style={{ color: '#a5f3fc', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🏢 Full Organization Hierarchy</span>
          {totalStats && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'Admins',      count: totalStats.admins,      color: '#22d3ee' },
                { label: 'Dealers',     count: totalStats.dealers,     color: '#4ade80' },
                { label: 'Sub Dealers', count: totalStats.subDealers,  color: '#f59e0b' },
                { label: 'Promotors',   count: totalStats.promotors,   color: '#a78bfa' },
                { label: 'Customers',   count: totalStats.customers,   color: '#f472b6' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `rgba(${hexToRgb(s.color)},0.08)`, border: `1px solid rgba(${hexToRgb(s.color)},0.25)`, borderRadius: '20px', padding: '3px 12px' }}>
                  <span style={{ color: s.color, fontWeight: 800, fontSize: '13px' }}>{s.count}</span>
                  <span style={{ color: subtext, fontSize: '11px' }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => { setShowHierarchy(false); setActiveAdmin(null); removeAdminPopup() }}
          style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}
        >✕ Close</button>
      </div>

      {/* SCROLL AREA - middle scrolls */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: '28px 32px', scrollBehavior: 'smooth', scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,211,238,0.4) rgba(255,255,255,0.03)' }}>

        {/* Loading */}
        {hierarchyLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '16px' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(34,211,238,0.2)', borderTop: '3px solid #22d3ee', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: subtext, fontSize: '14px' }}>Loading hierarchy...</span>
          </div>
        )}

        {/* Tree */}
        {!hierarchyLoading && hierarchyData && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content', margin: '0 auto' }}>

            {/* Super Admin Root Node */}
            <div style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,215,0,0.05))', border: '1px solid rgba(255,215,0,0.5)', borderRadius: '16px', padding: '16px 48px', fontWeight: 800, fontSize: '16px', color: '#ffd700', animation: 'pulseGlow 3s ease-in-out infinite', boxShadow: '0 0 24px rgba(255,215,0,0.1)', textAlign: 'center' }}>
              🛡️ Super Admin
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400, marginTop: '4px' }}>
                {localStorage.getItem('email')}
              </div>
            </div>

            {/* Stem */}
            <div style={{ width: 2, height: 32, background: 'linear-gradient(180deg,#ffd700,rgba(255,215,0,0.3))' }} />

            {hierarchyData.admins.length > 0 && (
              <>
                <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent)', width: '80%' }} />
                <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {hierarchyData.admins.map((admin, ai) => (
                    <div key={admin.id} className="tree-node-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 2, height: 24, background: 'rgba(255,215,0,0.5)' }} />
                      <TreeNode
                        node={admin}
                        role="admin"
                        depth={0}
                        dark={dark}
                        text={text}
                        subtext={subtext}
                        colorIdx={ai}
                        ancestors={[]}
                        superAdminEmail={localStorage.getItem('email') || ''}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {hierarchyData.admins.length === 0 && (
              <div style={{ color: subtext, padding: '60px', textAlign: 'center', fontSize: '15px' }}>No admins created yet.</div>
            )}

          </div>
        )}

        {!hierarchyLoading && !hierarchyData && (
          <div style={{ color: subtext, padding: '60px', textAlign: 'center', fontSize: '15px' }}>Failed to load hierarchy.</div>
        )}

      </div>

      {/* LEGEND - fixed bottom */}
      {!hierarchyLoading && (
        <div style={{ flexShrink: 0, padding: '14px 28px', borderTop: '1px solid rgba(103,232,249,0.08)', display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {[
            { role: 'Super Admin', color: '#ffd700', emoji: '🛡️' },
            { role: 'Admin',       color: '#22d3ee', emoji: '🛡️' },
            { role: 'Dealer',      color: '#4ade80', emoji: '🏪' },
            { role: 'Sub Dealer',  color: '#f59e0b', emoji: '🔗' },
            { role: 'Promotor',    color: '#a78bfa', emoji: '🌟' },
            { role: 'Customer',    color: '#f472b6', emoji: '👤' },
          ].map(l => (
            <div key={l.role} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: l.color }} />
              <span style={{ color: subtext, fontSize: '11px' }}>{l.emoji} {l.role}</span>
            </div>
          ))}
          <div style={{ color: subtext, fontSize: '11px', width: '100%', textAlign: 'center' }}>
            💡 Click any node to expand/collapse its children
          </div>
        </div>
      )}

    </div>
  </div>
)}

        {/* Create Admin Form - unchanged */}
        {showForm && (
          <div style={s.card}>
            <p style={s.secHead}>Create New Admin</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={s.secSub}>👤 Personal Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Initial</label>
                  <input name="initial" maxLength={5} value={form.initial} onChange={handleChange} className="sa-inp" style={s.inp} />
                </div>
                <div><label style={s.lbl}>First Name *</label>
                  <input name="first_name" maxLength={100} value={form.first_name} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
                <div><label style={s.lbl}>Last Name *</label>
                  <input name="last_name" maxLength={100} value={form.last_name} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Mobile *</label>
                  <input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
                <div>
                  <label style={s.lbl}>Admin ID</label>
                  <div style={{ ...s.inp, opacity: 0.55, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#22d3ee', fontFamily: 'monospace', fontSize: '13px' }}>BBADM{new Date().getFullYear()}</span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>&lt;auto-generated&gt;</span>
                  </div>
                </div>
              </div>
              <p style={s.secSub}>Account Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
                <div><label style={s.lbl}>Password *</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
              </div>
              <p style={s.secSub}>📍 Address</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
              </div>
              <p style={s.secSub}>🪪 Identity</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Aadhaar No *</label><input name="aadhaar_no" maxLength={12} value={form.aadhaar_no} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>PAN No *</label><input name="pan_no" maxLength={10} value={form.pan_no} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
              </div>
              <p style={s.secSub}>💼 Occupation</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} className="sa-inp" style={{ ...s.inp, cursor: 'pointer' }}>
                    {OCCUPATION_OPTIONS.map(o => <option key={o} value={o} style={{ background: '#1a1f26' }}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={s.lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" className="sa-grad-btn"
                  style={{ padding: '12px 28px', background: 'linear-gradient(90deg,#22d3ee,#4ade80)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#006165', fontSize: '14px', cursor: 'pointer' }}>
                  Create Admin
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: '12px 24px', background: inpBg, border: `1px solid ${border}`, borderRadius: '12px', color: subtext, fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins Table */}
        <div style={s.card}>
          <p style={s.secHead}>All Admins ({admins.length})</p>
          {admins.length === 0 ? (
            <p style={{ color: subtext, textAlign: 'center', padding: '60px 0', fontSize: '15px' }}>No admins yet!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${inpBorder}` }}>
                    {['First Name', 'Last Name', 'Email', 'Mobile', 'Admin ID', 'City'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: subtext, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a, i) => (
                    <tr key={i} className="sa-tr" style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: '14px 16px', color: text }}>{a.first_name}</td>
                      <td style={{ padding: '14px 16px', color: text }}>{a.last_name}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{a.email}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{a.mobile_number}</td>
                      <td style={{ padding: '14px 16px', color: '#22d3ee', fontFamily: 'monospace' }}>{a.admin_id}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{a.city_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}