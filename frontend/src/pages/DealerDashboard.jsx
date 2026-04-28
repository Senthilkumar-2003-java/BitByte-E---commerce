import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

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

const SD_COLORS = ['#f59e0b', '#22d3ee', '#a78bfa', '#f472b6']

let _sdPopupEl = null
let _sdHideTimer = null

function removeSubDealerPopup() {
  document.querySelectorAll('#sd-popup').forEach(el => el.remove())
  _sdPopupEl = null
}

function scheduleSDHide(setActiveSD) {
  clearTimeout(_sdHideTimer)
  _sdHideTimer = setTimeout(() => {
    removeSubDealerPopup()
    setActiveSD(null)
  }, 120)
}

function createSubDealerPopup(sd, i, anchorEl, dark, subtext, text, currentDealer) {
  removeSubDealerPopup()
  const c = SD_COLORS[i % SD_COLORS.length]

  const popupBg = dark ? 'linear-gradient(160deg,#0d1a0d,#060e1c)' : 'linear-gradient(160deg,#ffffff,#f1f5f9)'
  const popupBorder = dark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.35)'
  const accentColor = dark ? '#f59e0b' : '#d97706'

  // Super Admin box
  const saBoxBg = dark ? 'rgba(255,215,0,0.05)' : 'rgba(255,193,7,0.08)'
  const saBoxBorder = dark ? 'rgba(255,215,0,0.22)' : 'rgba(255,193,7,0.35)'

  // Admin box
  const adminBoxBg = dark ? 'rgba(74,222,128,0.05)' : 'rgba(16,185,129,0.05)'
  const adminBoxBd = dark ? 'rgba(74,222,128,0.2)' : 'rgba(16,185,129,0.2)'

  // Dealer box
  const dealerBoxBg = dark ? 'rgba(245,158,11,0.05)' : 'rgba(245,158,11,0.08)'
  const dealerBoxBd = dark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.3)'

  // Sub Dealer box
  const sdBoxBg = dark ? 'rgba(34,211,238,0.04)' : 'rgba(37,99,235,0.05)'
  const sdBoxBd = dark ? 'rgba(34,211,238,0.14)' : 'rgba(37,99,235,0.2)'

  const el = document.createElement('div')
  el.id = 'sd-popup'
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${popupBg}; border:1px solid ${popupBorder};
    border-radius:14px; padding:14px;
    box-shadow:0 16px 48px rgba(0,0,0,0.45);
    animation:sdPopupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
    min-width:210px; max-width:260px;
    display:flex; flex-direction:column; align-items:stretch;
  `

  el.innerHTML = `
    <div style="font-size:9px;color:${accentColor};font-weight:700;letter-spacing:1.3px;margin-bottom:11px;padding-bottom:9px;border-bottom:1px solid ${popupBorder};display:flex;align-items:center;gap:6px;">
      <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};display:inline-block;"></span>
      CREATED BY
    </div>

    <!-- Super Admin -->
    <div style="border-radius:9px;padding:10px;margin-bottom:6px;background:${saBoxBg};border:1px solid ${saBoxBorder};">
      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(255,215,0,0.12);color:#ffd700;border:1px solid rgba(255,215,0,0.3);margin-bottom:6px;">🛡️ SUPER ADMIN</div>
      <div style="font-size:11px;color:${subtext};word-break:break-all;">${localStorage.getItem('superAdminEmail') || localStorage.getItem('email') || '—'}</div>
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
      <div style="font-size:10px;color:#4ade80;font-family:monospace;margin-bottom:3px;">${currentDealer?.admin_id}</div>
     <div style="font-size:13px;font-weight:700;color:${text};margin-bottom:5px;">${currentDealer?.admin_name}</div>
     <div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${currentDealer?.admin_contact_no}</div>
    </div>

    <!-- Arrow Admin → Dealer -->
    <div style="display:flex;justify-content:center;padding:3px 0;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #4ade80;"></div>
        <div style="width:2px;height:7px;background:linear-gradient(180deg,#4ade80,#4ade8044);"></div>
      </div>
    </div>

    <!-- Dealer -->
    <div style="border-radius:9px;padding:10px;margin-bottom:6px;background:${dealerBoxBg};border:1px solid ${dealerBoxBd};">
      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(245,158,11,0.12);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);margin-bottom:6px;">🏪 DEALER</div>
      <div style="font-size:10px;color:#f59e0b;font-family:monospace;margin-bottom:3px;">${currentDealer?.dealer_id}</div>
<div style="font-size:13px;font-weight:700;color:${text};margin-bottom:5px;">${currentDealer?.dealer_name}</div>
<div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${currentDealer?.mobile_number}</div>
<div style="font-size:11px;color:${subtext};">📍 ${currentDealer?.city_name}</div>
    </div>

    <!-- Arrow Dealer → Sub Dealer -->
    <div style="display:flex;justify-content:center;padding:3px 0;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid ${accentColor};"></div>
        <div style="width:2px;height:7px;background:linear-gradient(180deg,${accentColor},${accentColor}44);"></div>
      </div>
    </div>

    <!-- Sub Dealer -->
    <div style="background:${sdBoxBg};border:1px solid ${sdBoxBd};border-radius:10px;padding:10px;">
      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(34,211,238,0.12);color:#22d3ee;border:1px solid rgba(34,211,238,0.25);margin-bottom:6px;">SUB DEALER</div>
      <div style="font-size:10px;color:${c};font-family:monospace;margin-bottom:3px;">${sd.sub_dealer_id}</div>
      <div style="font-size:14px;font-weight:700;color:${text};margin-bottom:6px;">${sd.first_name || sd.name}</div>
      <div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${sd.mobile_number}</div>
      <div style="font-size:11px;color:${subtext};">📍 ${sd.city_name}</div>
    </div>
  `
  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = el.offsetWidth || 260
  const popH = el.offsetHeight || 400
  let left = rect.right + 14
  let top = rect.top + (rect.height / 2) - (popH / 2)
  if (left + popW > window.innerWidth - 10) left = rect.left - popW - 14
  if (top < 8) top = 8
  if (top + popH > window.innerHeight - 8) top = window.innerHeight - popH - 8
  el.style.left = left + 'px'
  el.style.top = top + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_sdHideTimer))
  el.addEventListener('mouseleave', () => scheduleSDHide(setActiveSD))
  _sdPopupEl = el
}

// ── hex helper ──
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

// ── Tree colors ──
const DL_TREE_COLORS = ['#f59e0b','#22d3ee','#a78bfa','#f472b6','#4ade80','#60a5fa']

const DL_ROLE_CFG = {
  sub_dealer: { color:'#22d3ee', label:'🔗 SUB DEALER', idKey:'sub_dealer_id' },
  promotor:   { color:'#a78bfa', label:'🌟 PROMOTOR',   idKey:'promotor_id' },
  customer:   { color:'#f472b6', label:'👤 CUSTOMER',   idKey:'customer_id' },
}

// ── Chain popup globals ──
let _dlChainPopupEl = null
let _dlChainHideTimer = null

function removeDLChainPopup() {
  document.querySelectorAll('#dl-chain-popup').forEach(el => el.remove())
  _dlChainPopupEl = null
}

function showDLChainPopup(anchorEl, ancestors, current, dark, text, subtext, dealerProfile) {
  clearTimeout(_dlChainHideTimer)
  removeDLChainPopup()

  const CHAIN_LABELS = {
    super_admin: { emoji: '🛡️', label: 'SUPER ADMIN', color: '#ffd700', idKey: null },
    admin:       { emoji: '🛡️', label: 'ADMIN',       color: '#4ade80', idKey: 'admin_id' },
    dealer:      { emoji: '🏪', label: 'DEALER',       color: '#f59e0b', idKey: 'dealer_id' },
    sub_dealer:  { emoji: '🔗', label: 'SUB DEALER',   color: '#22d3ee', idKey: 'sub_dealer_id' },
    promotor:    { emoji: '🌟', label: 'PROMOTOR',     color: '#a78bfa', idKey: 'promotor_id' },
    customer:    { emoji: '👤', label: 'CUSTOMER',     color: '#f472b6', idKey: 'customer_id' },
  }

  const chain = [
    { type: 'super_admin', data: { email: localStorage.getItem('superAdminEmail') || '—' } },
    ...(dealerProfile?.admin_id ? [{
      type: 'admin',
      data: { admin_id: dealerProfile.admin_id, first_name: dealerProfile.admin_name, mobile_number: dealerProfile.admin_contact_no }
    }] : []),
    { type: 'dealer', data: { dealer_id: dealerProfile?.dealer_id, first_name: dealerProfile?.first_name, last_name: dealerProfile?.last_name, mobile_number: dealerProfile?.mobile_number, city_name: dealerProfile?.city_name } },
    ...ancestors.map(a => ({ type: a.role, data: a.node })),
    { type: current.role, data: current.node },
  ]

  const el = document.createElement('div')
  el.id = 'dl-chain-popup'

  // Inject scrollbar styles once
  if (!document.getElementById('dl-chain-popup-styles')) {
    const s = document.createElement('style')
    s.id = 'dl-chain-popup-styles'
    s.textContent = `
      #dl-chain-popup::-webkit-scrollbar{width:6px}
      #dl-chain-popup::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);border-radius:10px;margin:4px 0}
      #dl-chain-popup::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#f59e0b,#22d3ee);border-radius:10px;box-shadow:0 0 6px rgba(245,158,11,0.4)}
      #dl-chain-popup::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#fcd34d,#67e8f9)}
      #dl-chain-popup{scrollbar-color:rgba(245,158,11,0.5) rgba(255,255,255,0.03)}
    `
    document.head.appendChild(s)
  }

  const isDark = dark
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${isDark ? 'rgba(5,10,20,0.97)' : 'rgba(248,250,252,0.98)'};
    border:1px solid ${isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.28)'};
    border-radius:20px; padding:20px;
    box-shadow:${isDark
      ? '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(245,158,11,0.06), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(245,158,11,0.05)'};
    animation:acpSlideIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
    min-width:200px; max-width:280px;
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
    const cfg = CHAIN_LABELS[item.type]
    if (!cfg) return ''

    const arrowHtml = idx > 0 ? `
      <div style="display:flex;justify-content:center;padding:5px 0;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
          <div style="width:1.5px;height:16px;background:linear-gradient(180deg,rgba(245,158,11,0.65),rgba(245,158,11,0.1));"></div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid rgba(245,158,11,0.5);"></div>
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

    const d = item.data || {}
    const idVal = cfg.idKey ? (d[cfg.idKey] || '—') : ''
    const name  = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'
    const phone = d.mobile_number || '—'
    const city  = d.city_name || ''
    const rc    = hexToRgb(cfg.color)

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
            ${idVal ? `<div style="font-size:9px;color:${cfg.color};font-family:monospace;opacity:0.6;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${idVal}</div>` : ''}
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
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid ${isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.12)'};">
      <div style="display:flex;align-items:center;gap:9px;">
        <div style="width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#f59e0b,#22d3ee);display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 4px 10px rgba(245,158,11,0.4);">🔗</div>
        <div>
          <div style="font-size:11px;color:${isDark ? '#fcd34d' : '#d97706'};font-weight:800;letter-spacing:1.8px;">HIERARCHY CHAIN</div>
          <div style="font-size:9px;color:${isDark ? '#475569' : '#94a3b8'};margin-top:2px;">${totalNodes} level${totalNodes !== 1 ? 's' : ''} deep</div>
        </div>
      </div>
      <div style="
        font-size:9px;font-weight:800;padding:4px 11px;border-radius:20px;
        background:linear-gradient(90deg,rgba(245,158,11,0.15),rgba(34,211,238,0.12),rgba(245,158,11,0.15));
        background-size:200% auto;
        animation:acpShimmer 2.5s linear infinite;
        border:1px solid rgba(245,158,11,0.25);
        color:${isDark ? '#fcd34d' : '#d97706'};
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
  let top  = rect.top + (rect.height / 2) - (popH / 2)
  if (left + popW > window.innerWidth - 12) left = rect.left - popW - 18
  if (top < 12) top = 12
  if (top + popH > window.innerHeight - 12) top = window.innerHeight - popH - 12
  el.style.left = left + 'px'
  el.style.top  = top  + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_dlChainHideTimer))
  el.addEventListener('mouseleave', () => { _dlChainHideTimer = setTimeout(() => removeDLChainPopup(), 200) })
  _dlChainPopupEl = el
}

// ── Print ──
function printDLCard(node, role, color, ancestors, dealerProfile) {
  const ROLE_PRINT = {
    sub_dealer: { label:'SUB DEALER', emoji:'🔗', idKey:'sub_dealer_id' },
    promotor:   { label:'PROMOTOR',   emoji:'🌟', idKey:'promotor_id' },
    customer:   { label:'CUSTOMER',   emoji:'👤', idKey:'customer_id' },
  }
  const arrowDiv = `<div class="chain-arrow"><div style="display:flex;flex-direction:column;align-items:center;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid #94a3b8;"></div><div style="width:2px;height:12px;background:linear-gradient(180deg,#94a3b8,rgba(148,163,184,0.2));"></div></div></div>`

  const chain = [
    { type:'super_admin', label:'SUPER ADMIN', emoji:'🛡️', data:{ email: localStorage.getItem('superAdminEmail') || '—' } },
    ...(dealerProfile?.admin_id ? [{ type:'admin', label:'ADMIN', emoji:'🛡️', data:{ admin_id: dealerProfile.admin_id, first_name: dealerProfile.admin_name, mobile_number: dealerProfile.admin_contact_no } }] : []),
    { type:'dealer', label:'DEALER', emoji:'🏪', data:{ dealer_id: dealerProfile?.dealer_id, first_name: dealerProfile?.first_name, last_name: dealerProfile?.last_name, mobile_number: dealerProfile?.mobile_number, city_name: dealerProfile?.city_name } },
    ...ancestors.map(a => ({ type: a.role, label: a.role.replace('_',' ').toUpperCase(), emoji:'', data: a.node })),
    { type: role, label: ROLE_PRINT[role]?.label || role.toUpperCase(), emoji: ROLE_PRINT[role]?.emoji || '', data: node },
  ]

  const idMap = { admin:'admin_id', dealer:'dealer_id', sub_dealer:'sub_dealer_id', promotor:'promotor_id', customer:'customer_id' }

  const chainHtml = chain.map((item, idx) => {
    const isLast = idx === chain.length - 1
    const arrow  = idx < chain.length - 1 ? arrowDiv : ''
    const d = item.data || {}
    if (item.type === 'super_admin') {
      return `<div class="chain-item"><div class="chain-role">${item.emoji} ${item.label}</div><div class="chain-email">${d.email || '—'}</div></div>${arrow}`
    }
    const idKey = idMap[item.type]
    const idVal = idKey ? (d[idKey] || '—') : ''
    const name  = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'
    return `
      <div class="chain-item ${isLast ? 'current' : ''}">
        <div class="chain-role">${item.emoji} ${item.label}</div>
        ${idVal ? `<div class="chain-id">${idVal}</div>` : ''}
        <div class="chain-name">${name}</div>
        <div class="chain-info">📞 ${d.mobile_number || '—'}</div>
        <div class="chain-info">📍 ${d.city_name || '—'}</div>
      </div>${arrow}`
  }).join('')

  const currentName = [node.first_name, node.last_name].filter(Boolean).join(' ') || '—'
  const roleLabel   = ROLE_PRINT[role]?.label || role.toUpperCase()
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head><title>${roleLabel} — ${currentName}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',system-ui,sans-serif;background:#f8fafc;padding:40px;display:flex;justify-content:center;}.wrapper{max-width:480px;width:100%;}.header{text-align:center;margin-bottom:28px;}.header h1{font-size:20px;font-weight:800;color:#020617;}.header p{font-size:12px;color:#64748b;margin-top:4px;}.chain-item{background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 18px;}.chain-item.current{border-color:${color};background:${color}11;box-shadow:0 4px 16px ${color}22;}.chain-role{font-size:10px;font-weight:800;color:#64748b;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase;}.chain-item.current .chain-role{color:${color};}.chain-id{font-family:monospace;font-size:11px;color:${color};margin-bottom:4px;}.chain-name{font-size:16px;font-weight:800;color:#020617;margin-bottom:6px;}.chain-email,.chain-info{font-size:12px;color:#475569;margin-top:3px;}.chain-arrow{display:flex;justify-content:center;padding:4px 0;}.footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:24px;}@media print{body{background:white;padding:20px;}.chain-item{box-shadow:none;}}</style>
    </head><body><div class="wrapper"><div class="header"><h1>BitByte — ${roleLabel} Profile</h1><p>Hierarchy Chain Report</p></div>${chainHtml}<div class="footer">Printed on ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div></div><script>window.onload=()=>{window.print()}<\/script></body></html>`)
  win.document.close()
}

// ── DL Tree Node ──
function DLTreeNode({ node, role, depth=0, dark, text, subtext, colorIdx=0, ancestors=[], dealerProfile=null }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const cfg = DL_ROLE_CFG[role]
  const c   = DL_TREE_COLORS[colorIdx % DL_TREE_COLORS.length]

  const childRole = { sub_dealer:'promotor', promotor:'customer' }[role]
  const children  = { sub_dealer: node.promotors, promotor: node.customers }[role] || []
  const hasChildren = children.length > 0

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:0 }}>
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{
          background: dark ? `rgba(${hexToRgb(c)},0.06)` : `rgba(${hexToRgb(c)},0.08)`,
          border:`1px solid rgba(${hexToRgb(c)},0.35)`,
          borderRadius:'12px', padding:'12px 16px',
          minWidth:'160px', maxWidth:'200px',
          cursor: hasChildren ? 'pointer' : 'default',
          transition:'all 0.3s ease', position:'relative',
        }}
        onMouseEnter={e => {
          clearTimeout(_dlChainHideTimer)
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(${hexToRgb(c)},0.25)`
          e.currentTarget.style.borderColor = `rgba(${hexToRgb(c)},0.7)`
          showDLChainPopup(e.currentTarget, ancestors, { node, role }, dark, text, subtext, dealerProfile)
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = `rgba(${hexToRgb(c)},0.35)`
          _dlChainHideTimer = setTimeout(() => removeDLChainPopup(), 300)
        }}
      >
        <div style={{ display:'inline-block', fontSize:'9px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', marginBottom:'8px', background:`rgba(${hexToRgb(c)},0.15)`, color:c, border:`1px solid rgba(${hexToRgb(c)},0.35)` }}>
          {cfg.label}
        </div>
        <div style={{ color:c, fontFamily:'monospace', fontSize:'10px', marginBottom:'4px', wordBreak:'break-all' }}>{node[cfg.idKey]}</div>
        <div style={{ color:text, fontWeight:700, fontSize:'13px', marginBottom:'6px' }}>{node.first_name || '—'} {node.last_name || ''}</div>
        <div style={{ color:subtext, fontSize:'11px', marginBottom:'2px' }}>📞 {node.mobile_number}</div>
        {node.city_name && <div style={{ color:subtext, fontSize:'11px' }}>📍 {node.city_name}</div>}

        <div style={{ marginTop:'8px', width:'100%', height:2, borderRadius:2, background:`linear-gradient(90deg,rgba(${hexToRgb(c)},0.2),${c})` }} />

        <button
          onClick={e => { e.stopPropagation(); printDLCard(node, role, c, ancestors, dealerProfile) }}
          style={{ marginTop:'8px', width:'100%', padding:'3px 0', fontSize:'9px', fontWeight:700, background:`rgba(${hexToRgb(c)},0.1)`, border:`1px solid rgba(${hexToRgb(c)},0.35)`, borderRadius:'6px', color:c, cursor:'pointer', letterSpacing:'0.8px', transition:'all 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.background = `rgba(${hexToRgb(c)},0.25)`}
          onMouseLeave={e => e.currentTarget.style.background = `rgba(${hexToRgb(c)},0.1)`}
        >🖨️ PRINT</button>

        {hasChildren && (
          <div style={{ position:'absolute', top:'8px', right:'10px', color:c, fontSize:'10px', fontWeight:700, transition:'transform 0.3s ease', transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)' }}>▲</div>
        )}
        {hasChildren && (
          <div style={{ position:'absolute', bottom:'-10px', left:'50%', transform:'translateX(-50%)', background:c, color:'#000', fontSize:'9px', fontWeight:800, padding:'1px 7px', borderRadius:'20px', whiteSpace:'nowrap' }}>
            {children.length} {childRole?.replace('_',' ')}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}>
          <div style={{ width:2, height:28, background:`linear-gradient(180deg,${c},rgba(${hexToRgb(c)},0.3))`, marginTop:'10px' }} />
          <div style={{ position:'relative', width:'100%' }}>
            {children.length > 1 && (
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`rgba(${hexToRgb(c)},0.45)` }} />
            )}
            <div style={{ display:'flex', justifyContent: children.length===1 ? 'center' : 'space-between', alignItems:'flex-start', gap:'8px' }}>
              {children.map((child, ci) => (
                <div key={child.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex: children.length===1 ? '0 0 auto' : 1 }}>
                  <div style={{ width:2, height:20, background:`rgba(${hexToRgb(c)},0.5)` }} />
                  <DLTreeNode
                    node={child}
                    role={childRole}
                    depth={depth+1}
                    dark={dark}
                    text={text}
                    subtext={subtext}
                    colorIdx={colorIdx+ci+1}
                    ancestors={[...ancestors, { node, role }]}
                    dealerProfile={dealerProfile}
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

export default function DealerDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [subDealers, setSubDealers] = useState([])
  const [dealers, setDealers] = useState([])
  const [myProfile, setMyProfile] = useState(null)       // ← current dealer's full profile
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [activeSD, setActiveSD] = useState(null)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [form, setForm] = useState(emptyForm)
  const [showAnnouncements, setShowAnnouncements] = useState(false)
const [announcements, setAnnouncements] = useState([])
const [unreadCount, setUnreadCount] = useState(0)
const [showProfile, setShowProfile] = useState(false)
const [profileData, setProfileData] = useState(null)

// ── ADD after existing useState ──
  const [replyAnn,        setReplyAnn]        = useState(null)
  const [replyText,       setReplyText]       = useState('')
  const [replyLoading,    setReplyLoading]    = useState(false)
  const [replyMsg,        setReplyMsg]        = useState('')
  const [repliedIds,      setRepliedIds]      = useState(new Set())
  const [annReplies,      setAnnReplies]      = useState({})
  const [replyPopupAnnId, setReplyPopupAnnId] = useState(null)

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
  constructor() {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 4 + 2 
    this.speedX = (Math.random() - 0.5) * 0.3
    this.speedY = (Math.random() - 0.5) * 0.3
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    if (this.x > canvas.width || this.x < 0) this.speedX *= -1
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1

    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x
      let dy = mouse.y - this.y
      let distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < mouse.radius) {
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance
        const force = (mouse.radius - distance) / mouse.radius
        this.x += forceDirectionX * force * 2
        this.y += forceDirectionY * force * 2
      }
    }
  }                          // ← update() ends here

draw() {
  ctx.fillStyle = dark ? 'rgba(34, 211, 238, 0.9)' : 'rgba(37, 99, 235, 0.8)'
  ctx.save()
  ctx.translate(this.x, this.y)
  ctx.beginPath()
  
  const spikes = 5
  const outerRadius = this.size * 1
  const innerRadius = this.size * 0.4
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / spikes - Math.PI / 2
    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

}  
    function init() { particlesArray = []; for (let i = 0; i < 60; i++) particlesArray.push(new Particle()) }
    function connect() {
      for (let a = 0; a < particlesArray.length; a++) for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x, dy = particlesArray[a].y - particlesArray[b].y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 150) { ctx.strokeStyle = dark ? `rgba(245,158,11,${1 - d / 150})` : `rgba(245,158,11,${0.5 - d / 300})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke() }
      }
    }
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particlesArray.forEach(p => { p.update(); p.draw() }); connect(); animationFrameId = requestAnimationFrame(animate) }
    init(); animate()

  
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId) }
  }, [dark])

  // Fetch current dealer's profile (has admin_name, admin_id, admin_contact_no)
  const fetchMyProfile = async () => {
    try {
      const res = await api.get('/dashboard/')
      setMyProfile(res.data)
    } catch (err) { console.error('profile error:', err) }
  }

 const fetchSubDealers = async () => {
  try {
    const [sdRes, promotorRes, customerRes] = await Promise.allSettled([
      api.get('/sub-dealers/'),
      api.get('/promotors/list/'),  // PromotorListForView endpoint
      api.get('/customers/'),
    ])

    const sdList       = sdRes.status       === 'fulfilled' ? sdRes.value.data       : []
    const promotorList = promotorRes.status === 'fulfilled' ? promotorRes.value.data : []
    const customerList = customerRes.status === 'fulfilled' ? customerRes.value.data : []

    // superAdminEmail
    try {
      const hRes = await api.get('/hierarchy/full/')
      if (hRes?.data?.super_admin_email) {
        localStorage.setItem('superAdminEmail', hRes.data.super_admin_email)
      }
    } catch(e) {}

    // customers attach to promotors, promotors attach to sub dealers
    const enriched = sdList.map(sd => ({
      ...sd,
      promotors: promotorList
        .filter(p => String(p.assigned_sub_dealer_id) === String(sd.id))
        .map(p => ({
          ...p,
          customers: customerList.filter(c =>
            String(c.assigned_promotor_id) === String(p.id)
          )
        }))
    }))

    setSubDealers(enriched)
  } catch(err) { console.error(err) }
}

  const fetchDealers = async () => {
    try { const res = await api.get('/dealers/list/'); setDealers(res.data) } catch (err) { console.error(err) }
  }

  const fetchAnnouncements = async () => {
  try {
    const res = await api.get('/announcements/')
    const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setAnnouncements(sorted)
    const lastSeen = parseInt(localStorage.getItem('dealerAnnouncementSeen') || '0')
    const unread = sorted.filter(a => new Date(a.created_at).getTime() > lastSeen).length
    setUnreadCount(unread)
  } catch {}
}


// ── REPLY HELPERS ──────────────────────────────────────────────────
  function extractIdsFromTitle(title) {
    return title.match(/BB[A-Z]+\d+/g) || []
  }

  function isCurrentUserMentioned(title) {
    const myId = myProfile?.dealer_id
    if (!myId) return false
    return extractIdsFromTitle(title).includes(myId)
  }

  async function fetchReplies(annId) {
    try {
      const res = await api.get(`/announcements/${annId}/replies/`)
      setAnnReplies(prev => ({ ...prev, [annId]: res.data }))
    } catch {}
  }

  async function submitReply() {
    if (!replyText.trim()) return
    setReplyLoading(true)
    try {
      await api.post(`/announcements/${replyAnn.id}/replies/`, { message: replyText })
      setRepliedIds(prev => new Set([...prev, replyAnn.id]))
      setReplyMsg('✅ Wish sent!')
      setReplyText('')
    } catch (err) {
      if (err.response?.data?.error === 'Already replied') {
        setRepliedIds(prev => new Set([...prev, replyAnn.id]))
        setReplyMsg('⚠️ Already sent!')
      } else { setReplyMsg('❌ Failed.') }
    }
    setReplyLoading(false)
  }
  // ── END REPLY HELPERS ──────────────────────────────────────────────
useEffect(() => { 
  fetchSubDealers(); fetchDealers(); fetchMyProfile(); fetchAnnouncements()
  const interval = setInterval(fetchAnnouncements, 30000)
  return () => clearInterval(interval)
}, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleDealerChange = (e) => {
    const id = parseInt(e.target.value)
    const dealer = dealers.find(d => d.id === id)
    setSelectedDealer(dealer || null)
    setForm({ ...form, assigned_dealer_id: id })
  }
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/sub-dealers/', form)
      setMsg('✅ Sub Dealer created successfully!'); setMsgType('success')
      setShowForm(false); fetchSubDealers(); setForm(emptyForm); setSelectedDealer(null)
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data)); setMsgType('error')
    }
  }

  const card = { background: cardBg, border: cardBorder, borderRadius: '20px', padding: '32px 36px', marginBottom: '24px' }
  const secHead = (color = '#fcd34d') => ({ color, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px', paddingBottom: '14px', borderBottom: cardBorder })
  const secLabel = (color = '#fcd34d') => ({ color, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0', paddingBottom: '10px', borderBottom: cardBorder })
  const inp = { width: '100%', background: inpBg, border: `1px solid ${inpBorder}`, borderRadius: '10px', padding: '12px 16px', color: text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
  const lbl = { display: 'block', color: subtext, fontSize: '12px', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.04em' }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, transition: 'background 0.8s ease, color 0.4s ease', fontFamily: '"Inter",system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes sdPopupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes sdPulseGlow{0%,100%{box-shadow:0 0 8px rgba(245,158,11,0.15);}50%{box-shadow:0 0 22px rgba(245,158,11,0.35);}}
        @keyframes sdDotPulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.6);opacity:1;}}
        @keyframes dlPopupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes sdDotPulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.6);opacity:1;}}
        @keyframes acpSlideIn{from{opacity:0;transform:translateX(18px) scale(0.95)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes acpPulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes acpGlow{0%,100%{box-shadow:0 0 0px rgba(245,158,11,0)}50%{box-shadow:0 0 20px rgba(245,158,11,0.22)}}
        @keyframes acpShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes acpBadgePop{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}
        .dl-inp:focus{border-color:#f59e0b !important}
        .dl-grad-btn{position:relative;overflow:hidden}
        .dl-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .dl-grad-btn:hover::after{animation:shimmer 1s infinite}
        .dl-tr:hover td{background:rgba(255,255,255,.02)}
        .sd-card{background:rgba(255,255,255,0.03);border:1px solid rgba(245,158,11,0.18);border-radius:14px;padding:14px 18px;min-width:140px;cursor:pointer;position:relative;overflow:hidden;transition:background 0.35s ease,border-color 0.35s ease,transform 0.4s cubic-bezier(0.34,1.4,0.64,1),box-shadow 0.35s ease;}
        .sd-card.sd-active{background:rgba(245,158,11,0.07);border-color:rgba(245,158,11,0.65);transform:translateY(-6px) scale(1.02);box-shadow:0 12px 32px rgba(245,158,11,0.18);animation:sdPulseGlow 2.5s ease-in-out infinite;}
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.45 }} />
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, top: '8%', left: '8%', width: '380px', height: '380px', background: dark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.06)' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, bottom: '10%', right: '4%', width: '460px', height: '460px', background: dark ? 'rgba(34,211,238,0.05)' : 'rgba(34,211,238,0.04)', animationDelay: '-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.x}%`, bottom: '-100px', width: p.size, height: p.size, borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%', border: `1px solid ${accent}44`, opacity: p.opacity, animation: `antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op': p.opacity, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position: 'relative', zIndex: 10, background: glass, borderBottom: `1px solid ${border}`, padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(16px)', transition: 'background 0.8s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
          <img src={logo} alt="BitByte Logo" style={{ width: 60, height: 50, borderRadius: '10px', objectFit: 'contain' }} />
          <span style={{ color: '#fcd34d', fontWeight: 700, fontSize: '14px' }}>🏪 Dealer Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

{/* 👤 Profile Icon */}
<div
  onClick={() => { setShowProfile(true) }}
  style={{ cursor: 'pointer', width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(34,211,238,0.15))', border: '2px solid rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.25s ease' }}
  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.3)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.9)' }}
  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)' }}
  title="View Profile"
>🏪</div>    
      {/* 📢 Announcement Bell */}
<div
  onClick={() => { setShowAnnouncements(true); localStorage.setItem('dealerAnnouncementSeen', Date.now().toString()); setUnreadCount(0) }}
  style={{ position: 'relative', cursor: 'pointer', padding: '6px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' }}
  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
>
  <span style={{ fontSize: '18px', lineHeight: 1 }}>📢</span>
  {unreadCount > 0 && (
    <div style={{ position: 'absolute', top: '-7px', right: '-7px', background: 'linear-gradient(135deg,#f59e0b,#fcd34d)', color: '#000', borderRadius: '50%', minWidth: '18px', height: '18px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxShadow: '0 2px 8px rgba(245,158,11,0.5)', border: '1.5px solid #020617' }}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  )}
</div>
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
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Sub Dealer Management</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowHierarchy(true)}
              style={{ padding: '11px 28px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', fontWeight: 700, color: '#fcd34d', fontSize: '14px', cursor: 'pointer' }}>
              🏢 Sub Dealer Hierarchy
            </button>
            <button onClick={() => setShowForm(!showForm)} className="dl-grad-btn"
              style={{ padding: '11px 28px', background: 'linear-gradient(90deg,#f59e0b,#22d3ee)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#003b40', fontSize: '14px', cursor: 'pointer' }}>
              {showForm ? 'Cancel' : '+ Create Sub Dealer'}
            </button>
          </div>
        </div>

        

{/* ── ANNOUNCEMENT VIEW MODAL (Dealer) ── */}
{showAnnouncements && (
  <div onClick={() => setShowAnnouncements(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div onClick={e => e.stopPropagation()} style={{ background: dark ? 'linear-gradient(145deg,#0a1628,#060e1c)' : '#f8fafc', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '24px', width: '95%', maxWidth: '560px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={{ flexShrink: 0, padding: '24px 28px', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(34,211,238,0.15))', border: '1px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📢</div>
          <div>
            <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '14px' }}>ANNOUNCEMENTS</div>
            <div style={{ color: subtext, fontSize: '11px', marginTop: '2px' }}>{announcements.length} total from Super Admin</div>
          </div>
        </div>
        <button onClick={() => setShowAnnouncements(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {announcements.length === 0 ? (
          <div style={{ textAlign: 'center', color: subtext, padding: '60px 0', fontSize: '15px' }}>No announcements yet.</div>
        ) : announcements.map((ann, idx) => {
          const isMentioned = isCurrentUserMentioned(ann.title)
          const alreadyReplied = repliedIds.has(ann.id)
          const replies = annReplies[ann.id] || []
          return (
            <div key={ann.id} style={{ background: idx === 0 ? (dark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.05)') : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'), border: `1px solid ${idx === 0 ? 'rgba(245,158,11,0.35)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`, borderRadius: '14px', padding: '16px 18px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {idx === 0 && <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>● NEW</span>}
                  <span style={{ color: idx === 0 ? '#f59e0b' : text, fontWeight: 700, fontSize: '14px' }}>{ann.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: subtext, fontSize: '10px', whiteSpace: 'nowrap' }}>{new Date(ann.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <button disabled={alreadyReplied} onClick={() => { setReplyAnn(ann); setReplyMsg(''); setReplyText('') }} style={{ padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '20px', cursor: alreadyReplied ? 'not-allowed' : 'pointer', background: alreadyReplied ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.15)', border: `1px solid ${alreadyReplied ? 'rgba(255,255,255,0.1)' : 'rgba(245,158,11,0.4)'}`, color: alreadyReplied ? subtext : '#f59e0b', whiteSpace: 'nowrap' }}>
                    {alreadyReplied ? '✓ Wished' : '💬 Reply'}
                  </button>
                </div>
              </div>
              <p style={{ color: dark ? '#cbd5e1' : '#475569', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{ann.message}</p>
              {isMentioned && (
                <div onMouseEnter={() => { setReplyPopupAnnId(ann.id); fetchReplies(ann.id) }} onMouseLeave={() => setReplyPopupAnnId(null)} style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ fontSize: '10px', color: '#f59e0b', padding: '3px 14px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', cursor: 'default', background: 'rgba(245,158,11,0.06)', fontWeight: 600 }}>
                    🎂 You are mentioned · {replies.length} wish{replies.length !== 1 ? 'es' : ''} — hover to see
                  </div>
                  {replyPopupAnnId === ann.id && (
                    <div style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', background: dark ? 'rgba(5,10,20,0.97)' : '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '14px 16px', minWidth: '260px', maxWidth: '340px', maxHeight: '260px', overflowY: 'auto', zIndex: 9999, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', letterSpacing: '1.5px', marginBottom: '10px' }}>💬 WISHES ({replies.length})</div>
                      {replies.length === 0 ? <div style={{ color: subtext, fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>No wishes yet</div>
                      : replies.map(r => (
                        <div key={r.id} style={{ marginBottom: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b' }}>{r.replied_by_name}</span>
                            <span style={{ fontSize: '9px', color: subtext }}>{new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: dark ? '#cbd5e1' : '#475569' }}>{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

      </div>
    </div>
  </div>
)}


{/* ── REPLY MODAL — Dealer ── */}
{replyAnn && (
  <div onClick={() => { setReplyAnn(null); setReplyMsg(''); setReplyText('') }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div onClick={e => e.stopPropagation()} style={{ background: dark ? 'linear-gradient(145deg,#0a1628,#060e1c)' : '#f8fafc', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '28px', width: '95%', maxWidth: '460px', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '14px' }}>💬 SEND YOUR WISH</div>
          <div style={{ color: subtext, fontSize: '11px', marginTop: '4px' }}>Replying to: <span style={{ color: text, fontWeight: 600 }}>{replyAnn.title}</span></div>
        </div>
        <button onClick={() => setReplyAnn(null)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
      </div>
      {replyMsg && <div style={{ background: replyMsg.includes('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${replyMsg.includes('✅') ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`, color: replyMsg.includes('✅') ? '#4ade80' : '#f87171', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>{replyMsg}</div>}
      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} placeholder="Type your wish..." style={{ width: '100%', background: inpBg, border: `1px solid ${inpBorder}`, borderRadius: '10px', padding: '12px 14px', color: text, fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = inpBorder} />
      <button disabled={replyLoading || !replyText.trim()} onClick={submitReply} style={{ marginTop: '14px', width: '100%', padding: '13px', background: replyLoading || !replyText.trim() ? 'rgba(245,158,11,0.2)' : 'linear-gradient(90deg,#f59e0b,#22d3ee)', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '14px', color: replyLoading || !replyText.trim() ? '#f59e0b' : '#003b40', cursor: replyLoading || !replyText.trim() ? 'not-allowed' : 'pointer' }}>
        {replyLoading ? '⏳ Sending...' : '💬 Send Wish'}
      </button>
    </div>
  </div>
)}

{/* ── DEALER PROFILE MODAL ── */}
{showProfile && (
  <div
    onClick={() => setShowProfile(false)}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ background: dark ? 'linear-gradient(145deg,#0a1628,#060e1c)' : '#f8fafc', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '24px', width: '95%', maxWidth: '580px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
    >
      <div style={{ flexShrink: 0, padding: '24px 28px', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(34,211,238,0.15))', border: '2px solid rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏪</div>
          <div>
            <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '15px', letterSpacing: '0.05em' }}>MY PROFILE</div>
            <div style={{ color: subtext, fontSize: '11px', marginTop: '3px', fontFamily: 'monospace' }}>{myProfile?.dealer_id || '—'}</div>
          </div>
        </div>
        <button onClick={() => setShowProfile(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(245,158,11,0.4) transparent' }}>
        {!myProfile ? (
          <div style={{ textAlign: 'center', color: subtext, padding: '60px 0' }}>Loading...</div>
        ) : (
          <>
            {[
              { title: 'ACCOUNT INFO', color: '#f59e0b', fields: [
                { label: 'Dealer ID', value: myProfile.dealer_id, mono: true, color: '#f59e0b' },
                { label: 'Initial', value: myProfile.initial },
                { label: 'First Name', value: myProfile.first_name },
                { label: 'Last Name', value: myProfile.last_name },
                { label: 'Email', value: myProfile.email },
                { label: 'Mobile', value: myProfile.mobile_number },
              ]},
              { title: 'ADDRESS', color: '#22d3ee', fields: [
                { label: 'Door No', value: myProfile.door_no },
                { label: 'Street', value: myProfile.street_name },
                { label: 'Town', value: myProfile.town_name },
                { label: 'City', value: myProfile.city_name },
                { label: 'District', value: myProfile.district },
                { label: 'State', value: myProfile.state },
              ]},
              { title: 'IDENTITY', color: '#a78bfa', fields: [
                { label: 'Aadhaar No', value: myProfile.aadhaar_no, mask: true },
                { label: 'PAN No', value: myProfile.pan_no, pan: true, mono: true },
              ]},
              { title: 'OCCUPATION', color: '#f59e0b', fields: [
                { label: 'Type', value: myProfile.occupation ? myProfile.occupation.charAt(0).toUpperCase() + myProfile.occupation.slice(1) : '—' },
                { label: 'Detail', value: myProfile.occupation_detail },
                { label: 'Annual Salary', value: myProfile.annual_salary ? `₹ ${Number(myProfile.annual_salary).toLocaleString('en-IN')}` : '—' },
              ]},
              { title: 'ADMIN INFO', color: '#4ade80', fields: [
                { label: 'Admin ID', value: myProfile.admin_id, mono: true, color: '#4ade80' },
                { label: 'Admin Name', value: myProfile.admin_name },
                { label: 'Admin Contact', value: myProfile.admin_contact_no },
                { label: 'Member Since', value: myProfile.created_at ? new Date(myProfile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
              ]},
            ].map(section => (
              <div key={section.title} style={{ background: dark ? `rgba(${section.color === '#f59e0b' ? '245,158,11' : section.color === '#22d3ee' ? '34,211,238' : section.color === '#a78bfa' ? '167,139,250' : '74,222,128'},0.04)` : 'rgba(0,0,0,0.02)', border: `1px solid rgba(${section.color === '#f59e0b' ? '245,158,11' : section.color === '#22d3ee' ? '34,211,238' : section.color === '#a78bfa' ? '167,139,250' : '74,222,128'},0.18)`, borderRadius: '16px', padding: '18px 20px' }}>
                <div style={{ color: section.color, fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: section.color, display: 'inline-block' }} />
                  {section.title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: section.fields.length === 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px' }}>
                  {section.fields.map(f => (
                    <div key={f.label}>
                      <div style={{ color: subtext, fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>{f.label}</div>
                      <div style={{ color: f.color || text, fontSize: '13px', fontWeight: f.mono ? 700 : 500, fontFamily: f.mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
                        {f.mask && f.value ? `XXXX-XXXX-${f.value.slice(-4)}` : f.pan && f.value ? `XXXXXXX${f.value.slice(-4)}` : (f.value || '—')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  </div>
)}

        {/* Create Sub Dealer Form */}
        {showForm && (
          <div style={card}>
            <p style={secHead('#fcd34d')}>Create New Sub Dealer</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <p style={secLabel('#fcd34d')}>Account Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Initial</label><input name="initial" maxLength={5} value={form.initial} onChange={handleChange} className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>First Name *</label><input name="first_name" maxLength={100} value={form.first_name} onChange={handleChange} required className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>Last Name *</label><input name="last_name" maxLength={100} value={form.last_name} onChange={handleChange} required className="dl-inp" style={inp} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required placeholder="10-digit" className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="dl-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#fcd34d')}>Address</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required maxLength={100} className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required maxLength={100} className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#fcd34d')}>Identity</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Aadhaar No *</label><input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} placeholder="12-digit" className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>PAN No *</label><input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} placeholder="ABCDE1234F" className="dl-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#fcd34d')}>Occupation</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required className="dl-inp" style={{ ...inp, cursor: 'pointer' }}>
                    <option value="" style={{ background: '#1a1f26' }}>Select</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o} style={{ background: '#1a1f26' }}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} maxLength={25} className="dl-inp" style={inp} /></div>
                <div><label style={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required maxLength={10} placeholder="e.g. 500000" className="dl-inp" style={inp} /></div>
              </div>

              <p style={secLabel('#fcd34d')}>Dealer Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={lbl}>Dealer ID *</label>
                  <select onChange={handleDealerChange} className="dl-inp" style={{ ...inp, cursor: 'pointer' }}>
                    <option value="" style={{ background: '#1a1f26' }}>Select Dealer ID</option>
                    {dealers.map(d => <option key={d.id} value={d.id} style={{ background: '#1a1f26' }}>{d.dealer_id}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Dealer Name</label>
                  <input value={selectedDealer?.first_name || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div><label style={lbl}>Dealer Contact</label>
                  <input value={selectedDealer?.mobile_number || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" className="dl-grad-btn"
                  style={{ padding: '12px 28px', background: 'linear-gradient(90deg,#f59e0b,#22d3ee)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#003b40', fontSize: '14px', cursor: 'pointer' }}>
                  Create Sub Dealer
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: '12px 24px', background: inpBg, border: `1px solid ${border}`, borderRadius: '12px', color: subtext, fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sub Dealers Table */}
        <div style={card}>
          <p style={secHead('#fcd34d')}>My Sub Dealers ({subDealers.length})</p>
          {subDealers.length === 0 ? (
            <p style={{ color: subtext, textAlign: 'center', padding: '60px 0', fontSize: '15px' }}>No sub dealers yet!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${inpBorder}` }}>
                    {['Sub Dealer ID', 'First Name', 'Last Name', 'Email', 'Mobile', 'City', 'Created'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: subtext, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subDealers.map((s, i) => (
                    <tr key={i} className="dl-tr" style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: '14px 16px', color: '#f59e0b', fontFamily: 'monospace', fontSize: '13px' }}>{s.sub_dealer_id}</td>
                      <td style={{ padding: '14px 16px', color: text }}>{s.first_name || ''}</td>
                      <td style={{ padding: '14px 16px', color: text }}>{s.last_name || ''}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{s.email}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{s.mobile_number}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{s.city_name}</td>
                      <td style={{ padding: '14px 16px', color: subtext, whiteSpace: 'nowrap' }}>{new Date(s.created_at).toLocaleDateString()}</td>
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