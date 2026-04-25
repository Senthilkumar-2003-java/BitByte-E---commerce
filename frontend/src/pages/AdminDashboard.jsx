import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

const COLORS = ['#4ade80', '#22d3ee', '#a78bfa', '#f472b6', '#f59e0b', '#60a5fa']

const ROLE_CFG_ADMIN = {
  dealer: { color: '#4ade80', label: '🏪 DEALER', idKey: 'dealer_id' },
  sub_dealer: { color: '#f59e0b', label: '🔗 SUB DEALER', idKey: 'sub_dealer_id' },
  promotor: { color: '#a78bfa', label: '🌟 PROMOTOR', idKey: 'promotor_id' },
  customer: { color: '#f472b6', label: '👤 CUSTOMER', idKey: 'customer_id' },
}

const ROLE_LABELS_ADMIN = {
  admin: { emoji: '🛡️', label: 'ADMIN', color: '#4ade80', idKey: 'admin_id' },
  dealer: { emoji: '🏪', label: 'DEALER', color: '#4ade80', idKey: 'dealer_id' },
  sub_dealer: { emoji: '🔗', label: 'SUB DEALER', color: '#f59e0b', idKey: 'sub_dealer_id' },
  promotor: { emoji: '🌟', label: 'PROMOTOR', color: '#a78bfa', idKey: 'promotor_id' },
  customer: { emoji: '👤', label: 'CUSTOMER', color: '#f472b6', idKey: 'customer_id' },
}

const OCCUPATIONS = ['employee', 'business', 'others']
const emptyForm = {
  initial: '', first_name: '', last_name: '', mobile_number: '', email: '', password: '',
  door_no: '', street_name: '', town_name: '', city_name: '',
  district: '', state: '', aadhaar_no: '', pan_no: '',
  occupation: '', occupation_detail: '', annual_salary: ''
}

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

const DEALER_COLORS = ['#4ade80', '#22d3ee', '#a78bfa', '#f472b6']

// ─── ADMIN CHAIN POPUP ───────────────────────────────────────────────────────
let _aChainPopupEl = null
let _aChainHideTimer = null

function hexToRgbA(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function removeAdminChainPopup() {
  document.querySelectorAll('#admin-chain-popup').forEach(el => el.remove())
  _aChainPopupEl = null
}

function scheduleHideAdminChainPopup() {
  clearTimeout(_aChainHideTimer)
  _aChainHideTimer = setTimeout(() => removeAdminChainPopup(), 200)
}

function showAdminChainPopup(anchorEl, ancestors, current, dark, text, subtext, superAdminEmail, adminData = null) {
  clearTimeout(_aChainHideTimer)
  removeAdminChainPopup()

  const popupBg = dark
    ? 'linear-gradient(160deg,#091525,#060e1c)'
    : 'linear-gradient(160deg,#ffffff,#f1f5f9)'
  const popupBorder = dark ? 'rgba(74,222,128,0.2)' : 'rgba(37,99,235,0.2)'

  const chain = [
    { type: 'super_admin', data: { email: superAdminEmail } },
    ...(adminData ? [{ type: 'admin', data: adminData }] : []),
    ...ancestors.map(a => ({ type: a.role, data: a.node })),
    { type: current.role, data: current.node },
  ]

  const el = document.createElement('div')
  el.id = 'admin-chain-popup'
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${popupBg}; border:1px solid ${popupBorder};
    border-radius:14px; padding:14px 16px;
    box-shadow:0 16px 48px rgba(0,0,0,0.55);
    animation:dealerPopupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
    min-width:210px; max-width:250px;
    max-height:82vh; overflow-y:auto; overflow-x:hidden;
    scroll-behavior:smooth; scrollbar-width:thin;
    scrollbar-color:rgba(74,222,128,0.35) transparent;
  `

  const itemsHtml = chain.map((item, idx) => {
    const isLast = idx === chain.length - 1
    const isSuperAdmin = item.type === 'super_admin'

    const arrowHtml = idx > 0 ? `
      <div style="display:flex;justify-content:center;padding:4px 0;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0px;">
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid rgba(74,222,128,0.6);"></div>
          <div style="width:2px;height:12px;background:linear-gradient(180deg,rgba(74,222,128,0.5),rgba(74,222,128,0.1));"></div>
        </div>
      </div>` : ''

    if (isSuperAdmin) {
      return `
        ${arrowHtml}
        <div style="border-radius:9px;padding:10px 12px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.25);">
          <div style="font-size:9px;color:#ffd700;font-weight:700;margin-bottom:4px;">🛡️ SUPER ADMIN</div>
          <div style="font-size:11px;color:${subtext};word-break:break-all;">${item.data.email || '—'}</div>
        </div>
      `
    }

    const cfg = ROLE_LABELS_ADMIN[item.type]
    if (!cfg) return ''
    const d = item.data || {}
    const idVal = d[cfg.idKey] || d.id || '—'
    const name = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'
    const phone = d.mobile_number || '—'
    const city = d.city_name || ''

    return `
      ${arrowHtml}
      <div style="border-radius:9px;padding:10px 12px;
        background:rgba(${hexToRgbA(cfg.color)},0.06);
        border:1px solid rgba(${hexToRgbA(cfg.color)},${isLast ? '0.55' : '0.2'});
        ${isLast ? `box-shadow:0 0 14px rgba(${hexToRgbA(cfg.color)},0.18);` : ''}">
        <div style="font-size:9px;color:${cfg.color};font-weight:700;margin-bottom:4px;">
          ${cfg.emoji} ${cfg.label}${isLast ? ' <span style="font-size:8px;opacity:0.6;">(CURRENT)</span>' : ''}
        </div>
        <div style="font-size:10px;color:${cfg.color};font-family:monospace;margin-bottom:3px;">${idVal}</div>
        <div style="font-size:12px;color:${text};font-weight:700;margin-bottom:4px;">${name}</div>
        ${phone !== '—' ? `<div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${phone}</div>` : ''}
        ${city ? `<div style="font-size:11px;color:${subtext};">📍 ${city}</div>` : ''}
      </div>
    `
  }).join('')

  el.innerHTML = `
    <div style="font-size:9px;color:#86efac;font-weight:700;letter-spacing:1.2px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${popupBorder};">
      🔗 HIERARCHY CHAIN
    </div>
    ${itemsHtml}
  `

  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = 250
  const popH = el.scrollHeight || 300
  let left = rect.right + 14
  let top = rect.top
  if (left + popW > window.innerWidth - 10) left = rect.left - popW - 14
  if (top < 8) top = 8
  if (top + popH > window.innerHeight - 8) top = window.innerHeight - popH - 8
  el.style.left = left + 'px'
  el.style.top = top + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_aChainHideTimer))
  el.addEventListener('mouseleave', () => scheduleHideAdminChainPopup())
  _aChainPopupEl = el
}

function printAdminPersonCard(node, role, color, ancestors, superAdminEmail) {
  const ROLE_PRINT = {
    admin: { label: 'ADMIN', emoji: '🛡️', idKey: 'admin_id' },
    dealer: { label: 'DEALER', emoji: '🏪', idKey: 'dealer_id' },
    sub_dealer: { label: 'SUB DEALER', emoji: '🔗', idKey: 'sub_dealer_id' },
    promotor: { label: 'PROMOTOR', emoji: '🌟', idKey: 'promotor_id' },
    customer: { label: 'CUSTOMER', emoji: '👤', idKey: 'customer_id' },
  }

  const chain = [
    { type: 'super_admin', data: { email: superAdminEmail } },
    ...ancestors.map(a => ({ type: a.role, data: a.node })),
    { type: role, data: node },
  ]

  const arrowDiv = `<div class="chain-arrow"><div style="display:flex;flex-direction:column;align-items:center;gap:0px;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid #94a3b8;"></div><div style="width:2px;height:12px;background:linear-gradient(180deg,#94a3b8,rgba(148,163,184,0.2));"></div></div></div>`

  const chainHtml = chain.map((item, idx) => {
    const isLast = idx === chain.length - 1
    const arrow = idx < chain.length - 1 ? arrowDiv : ''

    if (item.type === 'super_admin') {
      return `
        <div class="chain-item">
          <div class="chain-role">🛡️ SUPER ADMIN</div>
          <div class="chain-email">${item.data.email || '—'}</div>
        </div>${arrow}`
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
      </div>${arrow}`
  }).join('')

  const roleLabel = ROLE_PRINT[role]?.label || role.toUpperCase()
  const currentName = [node.first_name, node.last_name].filter(Boolean).join(' ') || '—'

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html><html><head>
    <title>${roleLabel} — ${currentName}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:'Inter',system-ui,sans-serif;background:#f8fafc;padding:40px;display:flex;justify-content:center;}
      .wrapper{max-width:480px;width:100%;}
      .header{text-align:center;margin-bottom:28px;}
      .header h1{font-size:20px;font-weight:800;color:#020617;}
      .header p{font-size:12px;color:#64748b;margin-top:4px;}
      .chain-item{background:#ffffff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 18px;}
      .chain-item.current{border-color:${color};background:${color}11;box-shadow:0 4px 16px ${color}22;}
      .chain-role{font-size:10px;font-weight:800;color:#64748b;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase;}
      .chain-item.current .chain-role{color:${color};}
      .chain-id{font-family:monospace;font-size:11px;color:${color};margin-bottom:4px;}
      .chain-name{font-size:16px;font-weight:800;color:#020617;margin-bottom:6px;}
      .chain-email{font-size:12px;color:#475569;}
      .chain-info{font-size:12px;color:#475569;margin-top:3px;}
      .chain-arrow{display:flex;justify-content:center;padding:4px 0;}
      .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:24px;letter-spacing:0.5px;}
      @media print{body{background:white;padding:20px;}.chain-item{box-shadow:none;}}
    </style>
    </head><body>
    <div class="wrapper">
      <div class="header">
        <h1>BitByte — ${roleLabel} Profile</h1>
        <p>Hierarchy Chain Report</p>
      </div>
      ${chainHtml}
      <div class="footer">Printed on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
    <script>window.onload=()=>{window.print()}<\/script>
    </body></html>
  `)
  printWindow.document.close()
}

// ─── ADMIN TREE NODE ─────────────────────────────────────────────────────────
function AdminTreeNode({ node, role, depth = 0, dark, text, subtext, colorIdx = 0, ancestors = [], superAdminEmail = '', adminData = null }) {
  const [expanded, setExpanded] = useState(depth < 2)

  const cfg = ROLE_CFG_ADMIN[role]
  const c = COLORS[colorIdx % COLORS.length]

  const childRole = {
    dealer: 'sub_dealer',
    sub_dealer: 'promotor',
    promotor: 'customer',
  }[role]

  const children = {
    dealer: node.sub_dealers,
    sub_dealer: node.promotors,
    promotor: node.customers,
  }[role] || []

  const hasChildren = children.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{
          background: dark ? `rgba(${hexToRgbA(c)},0.06)` : `rgba(${hexToRgbA(c)},0.08)`,
          border: `1px solid rgba(${hexToRgbA(c)},0.35)`,
          borderRadius: '12px', padding: '12px 16px',
          minWidth: '160px', maxWidth: '200px',
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'all 0.3s ease', position: 'relative',
        }}
        onMouseEnter={e => {
          clearTimeout(_aChainHideTimer)
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(${hexToRgbA(c)},0.25)`
          e.currentTarget.style.borderColor = `rgba(${hexToRgbA(c)},0.7)`
          showAdminChainPopup(e.currentTarget, ancestors, { node, role }, dark, text, subtext, superAdminEmail, adminData)
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = `rgba(${hexToRgbA(c)},0.35)`
          _aChainHideTimer = setTimeout(() => removeAdminChainPopup(), 300)
        }}
      >
        <div style={{ display: 'inline-block', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', marginBottom: '8px', background: `rgba(${hexToRgbA(c)},0.15)`, color: c, border: `1px solid rgba(${hexToRgbA(c)},0.35)` }}>
          {cfg.label}
        </div>
        <div style={{ color: c, fontFamily: 'monospace', fontSize: '10px', marginBottom: '4px', wordBreak: 'break-all' }}>
          {node[cfg.idKey]}
        </div>
        <div style={{ color: text, fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
          {node.first_name} {node.last_name || ''}
        </div>
        <div style={{ color: subtext, fontSize: '11px', marginBottom: '2px' }}>📞 {node.mobile_number}</div>
        {node.city_name && <div style={{ color: subtext, fontSize: '11px' }}>📍 {node.city_name}</div>}

        <div style={{ marginTop: '8px', width: '100%', height: 2, borderRadius: 2, background: `linear-gradient(90deg,rgba(${hexToRgbA(c)},0.2),${c})` }} />

        <button
          onClick={e => { e.stopPropagation(); printAdminPersonCard(node, role, c, adminData ? [{ type: 'admin', data: adminData }, ...ancestors] : ancestors, superAdminEmail) }}
          style={{ marginTop: '8px', width: '100%', padding: '3px 0', fontSize: '9px', fontWeight: 700, background: `rgba(${hexToRgbA(c)},0.1)`, border: `1px solid rgba(${hexToRgbA(c)},0.35)`, borderRadius: '6px', color: c, cursor: 'pointer', letterSpacing: '0.8px', transition: 'all 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.background = `rgba(${hexToRgbA(c)},0.25)`}
          onMouseLeave={e => e.currentTarget.style.background = `rgba(${hexToRgbA(c)},0.1)`}
        >🖨️ PRINT</button>

        {hasChildren && (
          <div style={{ position: 'absolute', top: '8px', right: '10px', color: c, fontSize: '10px', fontWeight: 700, transition: 'transform 0.3s ease', transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)' }}>▲</div>
        )}
        {hasChildren && (
          <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: c, color: '#000', fontSize: '9px', fontWeight: 800, padding: '1px 7px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
            {children.length} {childRole?.replace('_', ' ')}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ width: 2, height: 28, background: `linear-gradient(180deg,${c},rgba(${hexToRgbA(c)},0.3))`, marginTop: '10px' }} />
          <div style={{ position: 'relative', width: '100%' }}>
            {children.length > 1 && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `rgba(${hexToRgbA(c)},0.45)` }} />
            )}
            <div style={{ display: 'flex', justifyContent: children.length === 1 ? 'center' : 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              {children.map((child, ci) => (
                <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: children.length === 1 ? '0 0 auto' : 1 }}>
                  <div style={{ width: 2, height: 20, background: `rgba(${hexToRgbA(c)},0.5)` }} />
                  <AdminTreeNode
                    node={child}
                    role={childRole}
                    depth={depth + 1}
                    dark={dark}
                    text={text}
                    subtext={subtext}
                    colorIdx={colorIdx + ci + 1}
                    ancestors={[...ancestors, { node, role }]}
                    superAdminEmail={superAdminEmail}
                    adminData={adminData}
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

let _dpopupEl = null
let _dhideTimer = null

function removeDealerPopup() {
  document.querySelectorAll('#dealer-popup').forEach(el => el.remove())
  _dpopupEl = null
}

function scheduleDealerHide(setActiveDealer) {
  clearTimeout(_dhideTimer)
  _dhideTimer = setTimeout(() => {
    removeDealerPopup()
    setActiveDealer(null)
  }, 120)
}

function createDealerPopup(d, i, anchorEl, dark, subtext, text, currentAdmin) {
  removeDealerPopup()
  const c = DEALER_COLORS[i % DEALER_COLORS.length]
  const popupBg = dark ? 'linear-gradient(160deg,#091525,#060e1c)' : 'linear-gradient(160deg,#ffffff,#f1f5f9)'
  const popupBorder = dark ? 'rgba(74,222,128,0.25)' : 'rgba(37,99,235,0.25)'
  const saBoxBg = dark ? 'rgba(255,215,0,0.05)' : 'rgba(255,193,7,0.08)'
  const saBoxBorder = dark ? 'rgba(255,215,0,0.22)' : 'rgba(255,193,7,0.35)'
  const adminBoxBg = dark ? 'rgba(74,222,128,0.05)' : 'rgba(16,185,129,0.05)'
  const adminBoxBd = dark ? 'rgba(74,222,128,0.2)' : 'rgba(16,185,129,0.2)'
  const dealerBoxBg = dark ? 'rgba(34,211,238,0.04)' : 'rgba(37,99,235,0.05)'
  const dealerBoxBd = dark ? 'rgba(34,211,238,0.14)' : 'rgba(37,99,235,0.2)'
  const accentColor = dark ? '#4ade80' : '#16a34a'

  const el = document.createElement('div')   // ✅ இது முதல்ல வரணும்
  el.id = 'dealer-popup'
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${popupBg}; border:1px solid ${popupBorder};
    border-radius:14px; padding:14px;
    box-shadow:0 16px 48px rgba(0,0,0,0.45);
    animation:dealerPopupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
    min-width:210px; max-width:250px;
    display:flex; flex-direction:column; align-items:stretch;
  `

  el.innerHTML = `
    <div style="font-size:9px;color:${accentColor};font-weight:700;letter-spacing:1.3px;margin-bottom:11px;padding-bottom:9px;border-bottom:1px solid ${popupBorder};display:flex;align-items:center;gap:6px;">
      <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};display:inline-block;"></span>
      CREATED BY
    </div>

    <!-- Super Admin -->
    <div style="border-radius:9px;padding:10px;margin-bottom:6px;background:${saBoxBg};border:1px solid ${saBoxBorder};">
<div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(255,215,0,0.12);color:#ffd700;border:1px solid rgba(255,215,0,0.3);margin-bottom:6px;">🛡️ SUPER ADMIN</div>      <div style="font-size:11px;color:${subtext};word-break:break-all;">${localStorage.getItem('superAdminEmail') || localStorage.getItem('email') || '—'}</div>
      <div style="margin-top:5px;font-size:9px;padding:2px 7px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);border-radius:20px;color:#ffd700;display:inline-block;">● ONLINE</div>
    </div>

    <!-- Arrow SA → Admin -->
    <div style="display:flex;justify-content:center;padding:3px 0;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #ffd700;"></div>
        <div style="width:2px;height:7px;background:linear-gradient(180deg,#ffd700,#ffd70044);"></div>
      </div>
    </div>

    <!-- Admin -->
    <div style="border-radius:9px;padding:10px;margin-bottom:6px;background:${adminBoxBg};border:1px solid ${adminBoxBd};">
<div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.3);margin-bottom:6px;">🛡️ ADMIN</div>  
    <div style="font-size:10px;color:#4ade80;font-family:monospace;margin-bottom:3px;">${currentAdmin?.admin_id || '—'}</div>
      <div style="font-size:13px;font-weight:700;color:${text};margin-bottom:5px;">${currentAdmin?.first_name || currentAdmin?.admin_name || '—'}</div>
      <div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${currentAdmin?.mobile_number || currentAdmin?.admin_contact_no || '—'}</div>
      <div style="font-size:11px;color:${subtext};">📍 ${currentAdmin?.city_name || '—'}</div>
    </div>

    <!-- Arrow Admin → Dealer -->
    <div style="display:flex;justify-content:center;padding:3px 0;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid ${accentColor};"></div>
        <div style="width:2px;height:7px;background:linear-gradient(180deg,${accentColor},${accentColor}44);"></div>
      </div>
    </div>

    <!-- Dealer -->
    <div style="background:${dealerBoxBg};border:1px solid ${dealerBoxBd};border-radius:10px;padding:10px;">
      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(34,211,238,0.12);color:#22d3ee;border:1px solid rgba(34,211,238,0.25);margin-bottom:6px;">DEALER</div>
      <div style="font-size:10px;color:${c};font-family:monospace;margin-bottom:3px;">${d.dealer_id}</div>
      <div style="font-size:14px;font-weight:700;color:${text};margin-bottom:6px;">${d.first_name || ''}</div>
      <div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${d.mobile_number}</div>
      <div style="font-size:11px;color:${subtext};">📍 ${d.city_name}</div>
    </div>
  `
  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = el.offsetWidth || 250
  const popH = el.offsetHeight || 320
  let left = rect.right + 14
  let top = rect.top + (rect.height / 2) - (popH / 2)
  if (left + popW > window.innerWidth - 10) left = rect.left - popW - 14
  if (top < 8) top = 8
  if (top + popH > window.innerHeight - 8) top = window.innerHeight - popH - 8
  el.style.left = left + 'px'
  el.style.top = top + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_dhideTimer))
  el.addEventListener('mouseleave', () => scheduleDealerHide(setActiveDealer))
  _dpopupEl = el
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [dealers, setDealers] = useState([])
  const [admins, setAdmins] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [activeDealer, setActiveDealer] = useState(null)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [form, setForm] = useState(emptyForm)
  const canvasRef = useRef(null)

  // Elite Color Palette
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
    function init() { particlesArray = []; for (let i = 0; i < 60; i++)particlesArray.push(new Particle()) }
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

const fetchDealers = async () => {
  try {
    const [dealerRes, adminRes, hierarchyRes] = await Promise.allSettled([
      api.get('/dealers/'),
      api.get('/admins/list/'),
      api.get('/hierarchy/full/'),
    ])

    const adminList = adminRes.status === 'fulfilled' ? adminRes.value.data : []
    const flatDealers = dealerRes.status === 'fulfilled' ? dealerRes.value.data : []
    const hierarchyData = hierarchyRes.status === 'fulfilled' ? hierarchyRes.value.data : null

    // Build nested dealer map from hierarchy if available
    let nestedDealerMap = {}
    if (hierarchyData?.admins) {
      hierarchyData.admins.forEach(admin => {
        (admin.dealers || []).forEach(d => {
          nestedDealerMap[d.dealer_id] = d
        })
      })
    }

    const dealerData = flatDealers.map(d => {
      const nested = nestedDealerMap[d.dealer_id] || {}
      return {
        ...d,
        sub_dealers: (nested.sub_dealers || d.sub_dealers || []).map(sd => ({
          ...sd,
          promotors: (sd.promotors || []).map(p => ({
            ...p,
            customers: p.customers || []
          }))
        })),
        _admin: adminList.find(a =>
          String(a.id) === String(d.assigned_admin_id) ||
          String(a.id) === String(d.admin) ||
          String(a.email) === String(d.admin_email)
        ) || null
      }
    })

    setDealers(dealerData)
    setAdmins(adminList)
  } catch (err) { console.error('dealers error:', err) }
}
  const fetchAdmins = async () => {
    try { const res = await api.get('/admins/list/'); setAdmins(res.data) } catch (err) { console.error('admins error:', err.response?.status) }
  }
  useEffect(() => { fetchDealers(); fetchAdmins() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleAdminChange = (e) => {
    const id = parseInt(e.target.value)
    const admin = admins.find(a => a.id === id)
    setSelectedAdmin(admin || null)
    setForm({ ...form, assigned_admin_id: id })
  }
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/dealers/', form)
      setMsg('✅ Dealer created successfully!'); setMsgType('success')
      setShowForm(false); fetchDealers(); setForm(emptyForm); setSelectedAdmin(null)
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data)); setMsgType('error')
    }
  }

  const card = { background: cardBg, border: cardBorder, borderRadius: '20px', padding: '32px 36px', marginBottom: '24px' }
  const secHead = (color = '#a5f3fc') => ({ color, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px', paddingBottom: '14px', borderBottom: cardBorder })
  const secLabel = (color = '#a5f3fc') => ({ color, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0', paddingBottom: '10px', borderBottom: cardBorder })
  const inp = { width: '100%', background: inpBg, border: `1px solid ${inpBorder}`, borderRadius: '10px', padding: '12px 16px', color: text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
  const lbl = { display: 'block', color: subtext, fontSize: '12px', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.04em' }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, transition: 'background 0.8s ease, color 0.4s ease', fontFamily: '"Inter",system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .ad-inp:focus{border-color:#22d3ee !important}
        .ad-grad-btn{position:relative;overflow:hidden}
        .ad-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .ad-grad-btn:hover::after{animation:shimmer 1s infinite}
        .ad-tr:hover td{background:rgba(255,255,255,.02)}
        @keyframes dealerPopupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes dPulseGlow{0%,100%{box-shadow:0 0 8px rgba(74,222,128,0.15);}50%{box-shadow:0 0 22px rgba(74,222,128,0.35);}}
@keyframes dDotPulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.6);opacity:1;}}
.d-card{background:rgba(255,255,255,0.03);border:1px solid rgba(74,222,128,0.18);border-radius:14px;padding:14px 18px;min-width:140px;cursor:pointer;position:relative;overflow:hidden;transition:background 0.35s ease,border-color 0.35s ease,transform 0.4s cubic-bezier(0.34,1.4,0.64,1),box-shadow 0.35s ease;}
.d-card.d-active{background:rgba(74,222,128,0.07);border-color:rgba(74,222,128,0.65);transform:translateY(-6px) scale(1.02);box-shadow:0 12px 32px rgba(74,222,128,0.18);animation:dPulseGlow 2.5s ease-in-out infinite;}
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.45 }} />
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, top: '8%', left: '8%', width: '380px', height: '380px', background: dark ? 'rgba(34,211,238,0.08)' : 'rgba(37,99,235,0.08)' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, bottom: '10%', right: '4%', width: '460px', height: '460px', background: dark ? 'rgba(74,222,128,0.06)' : 'rgba(16,185,129,0.06)', animationDelay: '-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.x}%`, bottom: '-100px', width: p.size, height: p.size, borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%', border: `1px solid ${accent}44`, opacity: p.opacity, animation: `antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op': p.opacity, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position: 'relative', zIndex: 10, background: glass, borderBottom: `1px solid ${border}`, padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(16px)', transition: 'background 0.8s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
          <img
            src={logo}
            alt="BitByte Logo"
            style={{ width: 60, height: 50, borderRadius: '10px', objectFit: 'contain' }}
          />
          <span style={{ color: '#86efac', fontWeight: 700, fontSize: '14px' }}>🛡️ Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ color: subtext, fontSize: '14px' }}>{localStorage.getItem('email')}</span>

          {/* ── DARK / LIGHT TOGGLE ── */}
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
          <div style={{ background: msgType === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msgType === 'success' ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.3)'}`, color: msgType === 'success' ? '#4ade80' : '#f87171', borderRadius: '12px', padding: '14px 20px', fontSize: '14px', marginBottom: '20px' }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Dealer Management</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowHierarchy(true)}
              style={{ padding: '11px 28px', background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', fontWeight: 700, color: '#86efac', fontSize: '14px', cursor: 'pointer' }}>
              🏢 Dealer Hierarchy
            </button>
            <button onClick={() => setShowForm(!showForm)} className="ad-grad-btn"
              style={{ padding: '11px 28px', background: 'linear-gradient(90deg,#4ade80,#22d3ee)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#006165', fontSize: '14px', cursor: 'pointer' }}>
              {showForm ? 'Cancel' : '+ Create Dealer'}
            </button>
          </div>
        </div>

        {/* ── DEALER HIERARCHY MODAL ── */}
        {showHierarchy && (
          <div onClick={() => { setShowHierarchy(false); setActiveDealer(null); removeDealerPopup() }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: dark ? '#0f172a' : '#f8fafc', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '20px', padding: '32px', maxWidth: '960px', width: '95%', maxHeight: '80vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '14px', borderBottom: '1px solid rgba(74,222,128,0.1)' }}>
                <span style={{ color: '#86efac', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🏢 Dealer Hierarchy</span>
                <button onClick={() => { setShowHierarchy(false); setActiveDealer(null); removeDealerPopup() }}
                  style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>
                  ✕ Close
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto', overflowY: 'auto', scrollBehavior: 'smooth', scrollbarWidth: 'thin', scrollbarColor: 'rgba(74,222,128,0.35) transparent' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content', margin: '0 auto' }}>

                    {/* Admin Root Node */}
                    <div style={{
                      background: 'linear-gradient(135deg,rgba(74,222,128,0.13),rgba(34,211,238,0.08))',
                      border: '1px solid rgba(74,222,128,0.55)',
                      borderRadius: '16px', padding: '16px 48px',
                      fontWeight: 800, fontSize: '16px', color: '#4ade80',
                      animation: 'dPulseGlow 3s ease-in-out infinite',
                      boxShadow: '0 0 24px rgba(74,222,128,0.1)',
                    }}>
                      🛡️ Admin
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400, marginTop: '4px', textAlign: 'center' }}>
                        {localStorage.getItem('email')}
                      </div>
                    </div>

                    {/* Stem */}
                    <div style={{ width: 2, height: 32, background: 'linear-gradient(180deg,#4ade80,rgba(74,222,128,0.3))' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'dDotPulse 2s ease-in-out infinite' }} />
                      </div>
                    </div>

                    {dealers.length > 0 && (
                      <>
                        <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(74,222,128,0.5),transparent)', width: '80%' }} />
                        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', paddingTop: 0 }}>
                          {dealers.map((dealer, di) => (
                            <div key={dealer.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: 2, height: 24, background: 'rgba(74,222,128,0.5)', position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: COLORS[di % COLORS.length], animation: `dDotPulse ${1.8 + di * 0.2}s ease-in-out infinite` }} />
                              </div>
                              <AdminTreeNode
                                node={dealer}
                                role="dealer"
                                depth={0}
                                dark={dark}
                                text={text}
                                subtext={subtext}
                                colorIdx={di}
                                ancestors={[]}
                                superAdminEmail={localStorage.getItem('superAdminEmail') || ''}
                                adminData={dealer._admin || null}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {dealers.length === 0 && (
                      <div style={{ color: subtext, padding: '60px', textAlign: 'center', fontSize: '15px' }}>No dealers yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div style={card}>
            <p style={secHead('#86efac')}>Create New Dealer</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <p style={secLabel('#86efac')}>Account Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Initial</label><input name="initial" maxLength={5} value={form.initial} onChange={handleChange} className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>First Name *</label><input name="first_name" maxLength={100} value={form.first_name} onChange={handleChange} required className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>Last Name *</label><input name="last_name" maxLength={100} value={form.last_name} onChange={handleChange} required className="ad-inp" style={inp} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required placeholder="10-digit" className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="ad-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#86efac')}>Address</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required maxLength={100} className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required maxLength={100} className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#86efac')}>Identity</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Aadhaar No *</label><input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} placeholder="12-digit" className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>PAN No *</label><input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} placeholder="ABCDE1234F" className="ad-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#86efac')}>Occupation</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required className="ad-inp" style={{ ...inp, cursor: 'pointer' }}>
                    <option value="" style={{ background: '#1a1f26' }}>Select</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o} style={{ background: '#1a1f26' }}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} maxLength={25} className="ad-inp" style={inp} /></div>
                <div><label style={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required maxLength={10} placeholder="e.g. 500000" className="ad-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#86efac')}>Admin Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Admin ID *</label>
                  <select onChange={handleAdminChange} className="ad-inp" style={{ ...inp, cursor: 'pointer' }}>
                    <option value="" style={{ background: '#1a1f26' }}>Select Admin ID</option>
                    {admins.map(a => <option key={a.id} value={a.id} style={{ background: '#1a1f26' }}>{a.admin_id}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Admin Name</label>
                  <input value={selectedAdmin?.first_name || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div><label style={lbl}>Admin Contact</label>
                  <input value={selectedAdmin?.admin_contact_no || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" className="ad-grad-btn"
                  style={{ padding: '12px 28px', background: 'linear-gradient(90deg,#4ade80,#22d3ee)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#006165', fontSize: '14px', cursor: 'pointer' }}>
                  Create Dealer
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: '12px 24px', background: inpBg, border: `1px solid ${border}`, borderRadius: '12px', color: subtext, fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dealers Table */}
        <div style={card}>
          <p style={secHead('#86efac')}>My Dealers ({dealers.length})</p>
          {dealers.length === 0 ? (
            <p style={{ color: subtext, textAlign: 'center', padding: '60px 0', fontSize: '15px' }}>No dealers yet!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${inpBorder}` }}>
                    {['Dealer ID', 'First Name', 'Last Name', 'Email', 'Mobile', 'City', 'Created'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: subtext, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dealers.map((c, i) => (
                    <tr key={i} className="ad-tr" style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: '14px 16px', color: '#4ade80', fontFamily: 'monospace', fontSize: '13px' }}>{c.dealer_id}</td>
                      <td style={{ padding: '14px 16px', color: text }}>{c.first_name || ''}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{c.email}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{c.mobile_number}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{c.city_name}</td>
                      <td style={{ padding: '14px 16px', color: subtext, whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString()}</td>
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