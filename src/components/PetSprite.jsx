import { getPetAccessoryById, getPetById } from '../data/defaultData.js';

const OUTLINE = '#17213d';

function Face({ eyeY = 38, mouthY = 50, blush = true }) {
  return <>
    <g className="pet-eyes">
      <ellipse className="pet-eye pet-eye-left" cx="39" cy={eyeY} rx="3" ry="4" fill="#12182a"/>
      <ellipse className="pet-eye pet-eye-right" cx="57" cy={eyeY} rx="3" ry="4" fill="#12182a"/>
      <circle cx="38" cy={eyeY - 1} r="1" fill="#fff"/><circle cx="56" cy={eyeY - 1} r="1" fill="#fff"/>
    </g>
    {blush && <g opacity=".72"><circle cx="28" cy={mouthY - 2} r="4" fill="#ff9fb3"/><circle cx="68" cy={mouthY - 2} r="4" fill="#ff9fb3"/></g>}
    <path className="pet-mouth" d={`M41 ${mouthY} Q48 ${mouthY + 6} 55 ${mouthY}`} fill="none" stroke={OUTLINE} strokeWidth="2.8" strokeLinecap="round"/>
  </>;
}

function Duck({ spear = false }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse className="pet-shadow-svg" cx="51" cy="91" rx="28" ry="5" fill="#09122a" opacity=".2"/>
    <g className="pet-body"><ellipse cx="51" cy="68" rx="27" ry="22" fill="#fffdf4" stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-leg pet-leg-left"><path d="M43 84v7m-1 0-8 3m8-3 7 3" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/></g>
    <g className="pet-leg pet-leg-right"><path d="M60 84v7m1 0-7 3m7-3 8 3" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/></g>
    <g className="pet-head"><circle cx="50" cy="39" r="24" fill="#fffef6" stroke={OUTLINE} strokeWidth="4"/><Face eyeY={37} mouthY={52}/><path d="M37 46c8-5 20-5 27 1-3 8-18 10-27 3Z" fill="#f7a51c" stroke={OUTLINE} strokeWidth="3"/></g>
    <g className="pet-arm pet-arm-left"><path d="M29 63c-11 3-14 13-8 20 9-1 14-8 14-15" fill="#fffdf4" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round"/></g>
    <g className="pet-arm pet-arm-right"><path d="M72 62c10 3 13 13 7 20-8-1-13-8-13-15" fill="#fffdf4" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round"/></g>
    {spear && <g className="pet-spear"><path d="M26 73 88 26" stroke="#64748b" strokeWidth="4" strokeLinecap="round"/><path d="m84 19 9 2-4 9Z" fill="#ef4444" stroke={OUTLINE} strokeWidth="2"/><path d="M23 75 16 82" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round"/></g>}
  </svg>;
}

function Cat() {
  return <svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse className="pet-shadow-svg" cx="50" cy="92" rx="28" ry="5" fill="#09122a" opacity=".2"/>
    <g className="pet-tail"><path d="M72 72c20-3 24 17 8 20-11 2-16-7-10-12" fill="none" stroke="#8997aa" strokeWidth="8" strokeLinecap="round"/></g>
    <g className="pet-body"><ellipse cx="50" cy="70" rx="25" ry="20" fill="#cbd5e1" stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-leg pet-leg-left"><ellipse cx="38" cy="87" rx="10" ry="6" fill="#e2e8f0" stroke={OUTLINE} strokeWidth="3"/></g>
    <g className="pet-leg pet-leg-right"><ellipse cx="62" cy="87" rx="10" ry="6" fill="#e2e8f0" stroke={OUTLINE} strokeWidth="3"/></g>
    <g className="pet-head"><path d="M28 33 24 13l18 11M72 33l4-20-18 11" fill="#aeb9c8" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round"/><circle cx="50" cy="43" r="27" fill="#cbd5e1" stroke={OUTLINE} strokeWidth="4"/><Face eyeY={41} mouthY={55}/><path d="m50 48-5 4 5 4 5-4Z" fill="#ff9aa8" stroke={OUTLINE} strokeWidth="1.5"/></g>
    <g className="pet-arm pet-arm-left"><path d="M31 66c-9 2-12 12-6 18" fill="none" stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round"/></g>
    <g className="pet-arm pet-arm-right"><path d="M69 66c9 2 12 12 6 18" fill="none" stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round"/></g>
  </svg>;
}

function Dog() {
  return <svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse className="pet-shadow-svg" cx="50" cy="92" rx="29" ry="5" fill="#09122a" opacity=".2"/>
    <g className="pet-tail"><path d="M72 72c14 5 18-8 8-14" fill="none" stroke="#b87848" strokeWidth="8" strokeLinecap="round"/></g>
    <g className="pet-body"><ellipse cx="50" cy="70" rx="26" ry="20" fill="#fff8ef" stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-leg pet-leg-left"><path d="M39 82v9" stroke="#b87848" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-leg pet-leg-right"><path d="M61 82v9" stroke="#b87848" strokeWidth="9" strokeLinecap="round"/></g>
    <g className="pet-head"><circle cx="50" cy="40" r="25" fill="#fff8ef" stroke={OUTLINE} strokeWidth="4"/><path className="pet-ear-left" d="M31 24c-14-5-17 14-7 27 10 3 16-6 15-16" fill="#b87848" stroke={OUTLINE} strokeWidth="4"/><path className="pet-ear-right" d="M69 24c14-5 17 14 7 27-10 3-16-6-15-16" fill="#b87848" stroke={OUTLINE} strokeWidth="4"/><Face eyeY={39} mouthY={55}/><ellipse cx="50" cy="49" rx="5" ry="4" fill="#20263a"/><path className="pet-tongue" d="M50 55c-1 8 9 10 11 2" fill="#ff758f" stroke={OUTLINE} strokeWidth="2.5" strokeLinecap="round"/></g>
    <g className="pet-arm pet-arm-left"><path d="M31 67c-8 4-10 12-4 18" fill="none" stroke="#fff8ef" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-arm pet-arm-right"><path d="M69 67c8 4 10 12 4 18" fill="none" stroke="#fff8ef" strokeWidth="9" strokeLinecap="round"/></g>
  </svg>;
}

function Bear({ panda = false }) {
  const body = panda ? '#fff' : '#c78b59';
  return <svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse className="pet-shadow-svg" cx="50" cy="92" rx="28" ry="5" fill="#09122a" opacity=".2"/>
    <g className="pet-body"><ellipse cx="50" cy="70" rx="26" ry="21" fill={body} stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-leg pet-leg-left"><ellipse cx="38" cy="88" rx="11" ry="6" fill={panda ? '#20263a' : '#b77a4b'} stroke={OUTLINE} strokeWidth="3"/></g><g className="pet-leg pet-leg-right"><ellipse cx="62" cy="88" rx="11" ry="6" fill={panda ? '#20263a' : '#b77a4b'} stroke={OUTLINE} strokeWidth="3"/></g>
    <g className="pet-head"><circle cx="29" cy="26" r="11" fill={panda ? '#20263a' : '#b77a4b'} stroke={OUTLINE} strokeWidth="4"/><circle cx="71" cy="26" r="11" fill={panda ? '#20263a' : '#b77a4b'} stroke={OUTLINE} strokeWidth="4"/><circle cx="50" cy="44" r="28" fill={body} stroke={OUTLINE} strokeWidth="4"/>{panda && <><ellipse cx="39" cy="42" rx="7" ry="10" fill="#20263a" transform="rotate(18 39 42)"/><ellipse cx="61" cy="42" rx="7" ry="10" fill="#20263a" transform="rotate(-18 61 42)"/></>}<Face eyeY={42} mouthY={57} blush={!panda}/><ellipse cx="50" cy="51" rx="10" ry="8" fill={panda ? '#e5e7eb' : '#f6d1ad'}/><ellipse cx="50" cy="49" rx="4" ry="3" fill="#22283a"/></g>
    <g className="pet-arm pet-arm-left"><path d="M30 66c-10 4-13 12-7 20" fill="none" stroke={panda ? '#20263a' : '#b77a4b'} strokeWidth="10" strokeLinecap="round"/></g><g className="pet-arm pet-arm-right"><path d="M70 66c10 4 13 12 7 20" fill="none" stroke={panda ? '#20263a' : '#b77a4b'} strokeWidth="10" strokeLinecap="round"/></g>
  </svg>;
}

function Pig() {
  return <svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse className="pet-shadow-svg" cx="50" cy="92" rx="28" ry="5" fill="#09122a" opacity=".2"/>
    <g className="pet-tail"><path d="M74 69c14-1 13-16 3-12 8 7 0 13-5 8" fill="none" stroke="#f793aa" strokeWidth="5" strokeLinecap="round"/></g>
    <g className="pet-body"><ellipse cx="50" cy="70" rx="26" ry="20" fill="#ffc1cf" stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-leg pet-leg-left"><path d="M40 83v9" stroke="#f793aa" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-leg pet-leg-right"><path d="M60 83v9" stroke="#f793aa" strokeWidth="9" strokeLinecap="round"/></g>
    <g className="pet-head"><path d="M31 28 22 17l2 21M69 28l9-11-2 21" fill="#ffb4c6" stroke={OUTLINE} strokeWidth="4"/><circle cx="50" cy="43" r="28" fill="#ffc1cf" stroke={OUTLINE} strokeWidth="4"/><Face eyeY={40} mouthY={58}/><ellipse cx="50" cy="51" rx="11" ry="8" fill="#f793aa" stroke={OUTLINE} strokeWidth="3"/><circle cx="46" cy="51" r="2"/><circle cx="54" cy="51" r="2"/></g>
    <g className="pet-arm pet-arm-left"><path d="M31 67c-9 3-11 12-5 18" fill="none" stroke="#ffc1cf" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-arm pet-arm-right"><path d="M69 67c9 3 11 12 5 18" fill="none" stroke="#ffc1cf" strokeWidth="9" strokeLinecap="round"/></g>
  </svg>;
}

function Rabbit() {
  return <svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse className="pet-shadow-svg" cx="50" cy="93" rx="28" ry="5" fill="#09122a" opacity=".2"/>
    <g className="pet-body"><ellipse cx="50" cy="72" rx="25" ry="19" fill="#fff" stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-leg pet-leg-left"><ellipse cx="37" cy="90" rx="11" ry="5" fill="#fff" stroke={OUTLINE} strokeWidth="3"/></g><g className="pet-leg pet-leg-right"><ellipse cx="63" cy="90" rx="11" ry="5" fill="#fff" stroke={OUTLINE} strokeWidth="3"/></g>
    <g className="pet-head"><g className="pet-ear-left"><ellipse cx="36" cy="20" rx="10" ry="24" fill="#fff" stroke={OUTLINE} strokeWidth="4" transform="rotate(-8 36 20)"/><ellipse cx="36" cy="20" rx="4" ry="17" fill="#ffc6d6" transform="rotate(-8 36 20)"/></g><g className="pet-ear-right"><ellipse cx="64" cy="20" rx="10" ry="24" fill="#fff" stroke={OUTLINE} strokeWidth="4" transform="rotate(8 64 20)"/><ellipse cx="64" cy="20" rx="4" ry="17" fill="#ffc6d6" transform="rotate(8 64 20)"/></g><circle cx="50" cy="47" r="25" fill="#fff" stroke={OUTLINE} strokeWidth="4"/><Face eyeY={45} mouthY={59}/><path d="m50 52-5 4 5 4 5-4Z" fill="#ff9eb4"/></g>
    <g className="pet-arm pet-arm-left"><path d="M31 69c-9 3-10 12-4 17" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-arm pet-arm-right"><path d="M69 69c9 3 10 12 4 17" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round"/></g>
  </svg>;
}

function Bird({ phoenix = false, adult = false }) {
  const main = phoenix ? '#ffae42' : '#f9d65c';
  const wing = phoenix ? '#ff5b3d' : '#67b7ff';
  const tail = phoenix ? '#ffd166' : '#9dd6ff';
  return <svg viewBox="0 0 128 118" aria-hidden="true">
    <defs>
      <linearGradient id="phoenixWing" x1="0" x2="1"><stop stopColor="#ffeb94"/><stop offset=".45" stopColor="#ff8847"/><stop offset="1" stopColor="#ff3d54"/></linearGradient>
      <radialGradient id="phoenixAura"><stop stopColor="#fff7cc"/><stop offset=".6" stopColor="#ff8f5a"/><stop offset="1" stopColor="rgba(255,143,90,0)"/></radialGradient>
    </defs>
    <ellipse className="pet-shadow-svg" cx="64" cy="108" rx="34" ry="5" fill="#09122a" opacity=".22"/>
    {phoenix && <g className="legendary-aura phoenix-glow"><ellipse cx="64" cy="58" rx={adult ? 48 : 39} ry={adult ? 36 : 30} fill="url(#phoenixAura)" opacity=".38"/></g>}
    <g className="pet-tail pet-tail-feathers"><path d={`M61 83c-10 ${adult ? 20 : 15}-16 ${adult ? 28 : 22}-10 30 7 2 13-7 18-14`} fill="none" stroke={tail} strokeWidth={adult ? 7 : 5.2} strokeLinecap="round"/><path d={`M71 82c9 ${adult ? 23 : 17} 15 ${adult ? 31 : 24} 8 33-7 1-12-8-16-15`} fill="none" stroke="#ff7a45" strokeWidth={adult ? 7 : 5.2} strokeLinecap="round"/><path d={`M66 86c1 ${adult ? 26 : 21}-4 ${adult ? 31 : 25}-1 32 5 1 7-8 6-15`} fill="none" stroke="#ffe08a" strokeWidth={adult ? 6 : 4.5} strokeLinecap="round"/></g>
    <g className="pet-body"><ellipse cx="64" cy="71" rx={adult ? 28 : 24} ry={adult ? 23 : 20} fill={main} stroke={OUTLINE} strokeWidth="4"/><path d="M52 71c8 7 27 7 35 0" fill="none" stroke="#ffdca3" strokeWidth="4" strokeLinecap="round"/></g>
    <g className="pet-wing pet-wing-left"><path d={adult ? 'M47 64C21 52 17 25 41 28c-6-15 11-22 20-4 3 8 1 25-14 38Z' : 'M48 65C27 57 21 36 38 36c-5-12 9-18 17-4 3 6 2 20-7 33Z'} fill={phoenix ? 'url(#phoenixWing)' : wing} stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-wing pet-wing-right"><path d={adult ? 'M81 64c26-12 30-39 6-36 6-15-11-22-20-4-3 8-1 25 14 38Z' : 'M80 65c21-8 27-29 10-29 5-12-9-18-17-4-3 6-2 20 7 33Z'} fill={phoenix ? 'url(#phoenixWing)' : wing} stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-head"><circle cx="64" cy="39" r={adult ? 22 : 19} fill={phoenix ? '#ffc357' : '#ffea8a'} stroke={OUTLINE} strokeWidth="4"/><circle cx="71" cy="37" r="3" fill="#12182a"/><circle cx="72" cy="36" r="1" fill="#fff"/><path d="M48 42 31 48l17 8Z" fill="#f39b25" stroke={OUTLINE} strokeWidth="3"/>{phoenix && <g className="pet-crest"><path d="M55 20c-7-10 1-17 5-9 4-11 12-6 10 4 8-2 11 7 4 12" fill="#ff5345" stroke={OUTLINE} strokeWidth="3"/><path d="M63 19c6-12 12-8 10 3" fill="none" stroke="#ffe08a" strokeWidth="2.5" strokeLinecap="round"/></g>}</g>
    <g className="pet-leg pet-leg-left"><path d="M57 88 54 101m3-3-7 4m7-4 5 5" stroke="#f39b25" strokeWidth="4" strokeLinecap="round"/></g><g className="pet-leg pet-leg-right"><path d="M71 88 74 101m-3-3-6 5m6-5 8 4" stroke="#f39b25" strokeWidth="4" strokeLinecap="round"/></g>
    {phoenix && adult && <g className="legendary-aura"><circle cx="64" cy="53" r="46" fill="none" stroke="#ffd166" strokeWidth="2" strokeDasharray="5 8" opacity=".72"/></g>}
  </svg>;
}

function Dragon({ adult = false }) {
  return <svg viewBox="0 0 150 110" aria-hidden="true">
    <ellipse className="pet-shadow-svg" cx="77" cy="102" rx="43" ry="6" fill="#09122a" opacity=".24"/>
    <g className="pet-tail"><path d="M96 78c37 13 52-7 29-20 11 16-8 21-26 13" fill="none" stroke="#8b5cf6" strokeWidth={adult ? 12 : 9} strokeLinecap="round"/><path d="m132 55 12-6-4 13Z" fill="#6ee7ff" stroke={OUTLINE} strokeWidth="2"/></g>
    <g className="pet-body"><ellipse cx="77" cy="76" rx={adult ? 36 : 29} ry={adult ? 23 : 19} fill="#8b5cf6" stroke={OUTLINE} strokeWidth="4"/><path d="M57 73c14 10 29 10 43 0" fill="none" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/></g>
    <g className="pet-wing pet-wing-left"><path d="M57 68C24 59 20 27 49 39c-13-19 17-22 23 9" fill="#5b4ddb" opacity=".85" stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-wing pet-wing-right"><path d="M96 67c31-9 34-35 10-29 8-17-17-18-25 10" fill="#6d5ce7" opacity=".85" stroke={OUTLINE} strokeWidth="4"/></g>
    <g className="pet-head"><path d="M46 38C38 7 59 3 67 26 76 5 99 10 91 38" fill="#a78bfa" stroke={OUTLINE} strokeWidth="4"/><ellipse cx="70" cy="45" rx={adult ? 31 : 26} ry={adult ? 24 : 21} fill="#a78bfa" stroke={OUTLINE} strokeWidth="4"/><path d="m52 27 7-17 8 16M77 26l10-16 5 19" fill="#67e8f9" stroke={OUTLINE} strokeWidth="3"/><g className="pet-eyes"><ellipse className="pet-eye" cx="60" cy="43" rx="3" ry="4" fill="#10172d"/><ellipse className="pet-eye" cx="80" cy="43" rx="3" ry="4" fill="#10172d"/><circle cx="59" cy="42" r="1" fill="#fff"/><circle cx="79" cy="42" r="1" fill="#fff"/></g><path className="pet-mouth" d="M61 55q10 7 20 0" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round"/><path className="dragon-breath" d="M48 54c-13 2-16 10-3 12-8-7 7-5 10-10" fill="#67e8f9" opacity=".75"/></g>
    <g className="pet-leg pet-leg-left"><path d="M62 87c-7 8-8 13-2 15m-1-3-7 3m7-3 7 3" stroke="#6d5ce7" strokeWidth="7" strokeLinecap="round"/></g><g className="pet-leg pet-leg-right"><path d="M88 87c7 8 8 13 2 15m1-3-7 3m7-3 7 3" stroke="#6d5ce7" strokeWidth="7" strokeLinecap="round"/></g>
    {adult && <g className="legendary-aura"><ellipse cx="75" cy="56" rx="66" ry="47" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="7 9" opacity=".8"/><circle cx="17" cy="37" r="3" fill="#67e8f9"/><circle cx="124" cy="22" r="2.5" fill="#f0abfc"/></g>}
  </svg>;
}

function NebulaElder() {
  return <svg viewBox="0 0 420 170" aria-hidden="true">
    <defs>
      <linearGradient id="elderBody" x1="0" x2="1">
        <stop stopColor="#0f172a"/>
        <stop offset=".22" stopColor="#1d4ed8"/>
        <stop offset=".48" stopColor="#7c3aed"/>
        <stop offset=".76" stopColor="#0ea5e9"/>
        <stop offset="1" stopColor="#93c5fd"/>
      </linearGradient>
      <linearGradient id="elderScale" x1="0" x2="1"><stop stopColor="#67e8f9"/><stop offset="1" stopColor="#ddd6fe"/></linearGradient>
      <radialGradient id="elderEye"><stop stopColor="#fff"/><stop offset=".4" stopColor="#7dd3fc"/><stop offset="1" stopColor="#2563eb"/></radialGradient>
    </defs>
    <g className="elder-aura"><ellipse cx="210" cy="122" rx="182" ry="30" fill="#1d4ed8" opacity=".12"/><path d="M14 120C72 95 101 78 144 87c40 9 52 26 82 25 39-2 58-34 104-26 33 5 54 17 76 14" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="10 12" opacity=".45"/></g>
    <g className="elder-tail"><path d="M327 93c39 7 73 28 70 45-4 13-24 18-36 11 19 1 21-14-7-21" fill="none" stroke="url(#elderBody)" strokeWidth="16" strokeLinecap="round"/></g>
    <g className="pet-body elder-body"><path d="M22 115c32-20 68-39 114-31 18 3 30 11 47 12 21 2 35-9 52-20 26-17 63-26 92-7 16 10 24 26 12 36-15 12-58 17-108 13-40-3-74 15-117 10-39-4-67-7-92-13Z" fill="url(#elderBody)" stroke="#1e1b4b" strokeWidth="5"/></g>
    <g className="elder-scales">{[[89,100],[110,94],[132,92],[158,95],[185,101],[212,96],[240,84],[267,79],[293,82]].map(([x,y],i) => <path key={i} d={`M${x} ${y}q8-9 16 0`} fill="none" stroke="url(#elderScale)" strokeWidth="3" strokeLinecap="round" opacity=".9"/>)}</g>
    <g className="pet-leg elder-leg elder-leg-front"><path d="M152 110c-8 9-12 20-9 32m0 0 10-5m-10 5-8 10" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"/><path d="M176 108c-7 10-10 19-8 30m0 0 10-5m-10 5-8 10" fill="none" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/></g>
    <g className="pet-leg elder-leg elder-leg-back"><path d="M254 100c-7 9-11 18-9 29m0 0 10-4m-10 4-8 9" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"/><path d="M280 96c-7 8-11 16-9 27m0 0 10-4m-10 4-8 9" fill="none" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/></g>
    <g className="pet-head elder-head"><path d="M128 84c-16-3-22-20-13-33 7-9 19-12 34-8 9-17 29-26 44-15 14 10 15 27 6 40-14 15-41 23-71 16Z" fill="url(#elderBody)" stroke="#111827" strokeWidth="5"/><path d="M148 37 159 12l13 22M178 34l20-23 6 30" fill="none" stroke="#9ae6ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M121 75c-19-12-36-9-44 6m118-21c21-11 39-4 43 14" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round"/>
      <g className="elder-eyes"><path className="elder-eye elder-eye-left" d="M146 71q13-10 27 0-14 13-27 0Z" fill="url(#elderEye)"/><path className="elder-eye elder-eye-right" d="M184 65q13-10 27 0-14 13-27 0Z" fill="url(#elderEye)"/><circle cx="159" cy="71" r="3" fill="#020617"/><circle cx="197" cy="65" r="3" fill="#020617"/></g>
      <path d="M167 90q12 9 24 1" fill="none" stroke="#dbeafe" strokeWidth="3" strokeLinecap="round"/>
      <path className="elder-whisker-left" d="M133 87C92 88 69 97 40 107" fill="none" stroke="#bfdbfe" strokeWidth="3" strokeLinecap="round"/>
      <path className="elder-whisker-right" d="M201 84c40-2 66 2 102 17" fill="none" stroke="#bfdbfe" strokeWidth="3" strokeLinecap="round"/>
    </g>
    <g className="elder-stars">{[[34,49],[62,29],[98,46],[225,20],[258,42],[330,36],[370,24],[305,63],[205,44]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%2?2:3} fill={i%2?'#f0abfc':'#67e8f9'}/>)}</g>
  </svg>;
}

function Owl() {
  return <svg viewBox="0 0 100 100" aria-hidden="true"><ellipse className="pet-shadow-svg" cx="50" cy="93" rx="28" ry="5" fill="#09122a" opacity=".2"/><g className="pet-body"><ellipse cx="50" cy="61" rx="28" ry="31" fill="#c4b5fd" stroke={OUTLINE} strokeWidth="4"/></g><g className="pet-wing pet-wing-left"><path d="M27 62c-10 4-10 17 1 23" fill="none" stroke="#8b75d7" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-wing pet-wing-right"><path d="M73 62c10 4 10 17-1 23" fill="none" stroke="#8b75d7" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-head"><path d="M27 35 33 17l14 14M73 35 67 17 53 31" fill="#a78bfa" stroke={OUTLINE} strokeWidth="4"/><circle cx="40" cy="48" r="11" fill="#fff"/><circle cx="60" cy="48" r="11" fill="#fff"/><circle className="pet-eye" cx="40" cy="48" r="4"/><circle className="pet-eye" cx="60" cy="48" r="4"/><path d="m50 54-7 8h14Z" fill="#f7b731" stroke={OUTLINE} strokeWidth="2"/></g><g className="pet-leg pet-leg-left"><path d="M41 87v7m0-2-7 3m7-3 6 3" stroke="#f7b731" strokeWidth="4" strokeLinecap="round"/></g><g className="pet-leg pet-leg-right"><path d="M59 87v7m0-2-6 3m6-3 7 3" stroke="#f7b731" strokeWidth="4" strokeLinecap="round"/></g></svg>;
}

function Fox() {
  return <svg viewBox="0 0 100 100" aria-hidden="true"><ellipse className="pet-shadow-svg" cx="50" cy="92" rx="28" ry="5" fill="#09122a" opacity=".2"/><g className="pet-tail"><path d="M72 69c23-7 28 13 13 22-14 3-24-3-27-12" fill="#fb7185" stroke={OUTLINE} strokeWidth="4"/><path d="M79 78c10-2 13 5 8 10-7 2-12 0-16-4" fill="#fff5f5"/></g><g className="pet-body"><ellipse cx="50" cy="70" rx="24" ry="19" fill="#fda4af" stroke={OUTLINE} strokeWidth="4"/></g><g className="pet-leg pet-leg-left"><path d="M40 83v9" stroke="#fb7185" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-leg pet-leg-right"><path d="M60 83v9" stroke="#fb7185" strokeWidth="9" strokeLinecap="round"/></g><g className="pet-head"><path d="M28 35 22 13l23 15M72 35l6-22-23 15" fill="#fb7185" stroke={OUTLINE} strokeWidth="4"/><circle cx="50" cy="44" r="26" fill="#fda4af" stroke={OUTLINE} strokeWidth="4"/><path d="M32 45c8 12 28 17 36 0-2 19-33 24-36 0Z" fill="#fff5f5"/><Face eyeY={41} mouthY={57}/><ellipse cx="50" cy="51" rx="4" ry="3" fill="#20263a"/></g><g className="pet-arm pet-arm-left"><path d="M32 68c-8 3-10 11-5 17" fill="none" stroke="#fb7185" strokeWidth="8" strokeLinecap="round"/></g><g className="pet-arm pet-arm-right"><path d="M68 68c8 3 10 11 5 17" fill="none" stroke="#fb7185" strokeWidth="8" strokeLinecap="round"/></g></svg>;
}

function Koi() {
  return <svg viewBox="0 0 110 90" aria-hidden="true"><ellipse className="pet-shadow-svg" cx="55" cy="80" rx="30" ry="4" fill="#09122a" opacity=".18"/><g className="pet-body"><path d="M18 45c17-24 51-26 72-2-17 25-55 27-72 2Z" fill="#fff7ed" stroke={OUTLINE} strokeWidth="4"/><path d="M37 29c9 7 10 29 0 35M58 25c10 9 12 33 0 41" fill="none" stroke="#fb7185" strokeWidth="9" opacity=".8"/></g><g className="pet-tail"><path d="M88 43 105 27l-2 18 2 18-17-17Z" fill="#fb7185" stroke={OUTLINE} strokeWidth="4"/></g><g className="pet-fin"><path d="M53 63c8 12 18 8 16-2M53 28c8-12 18-8 16 2" fill="#fda4af" stroke={OUTLINE} strokeWidth="3"/></g><circle className="pet-eye" cx="28" cy="40" r="3"/><path d="M20 49q5 4 9 0" fill="none" stroke={OUTLINE} strokeWidth="2"/></svg>;
}

function Hamster() {
  return <svg viewBox="0 0 100 100" aria-hidden="true"><ellipse className="pet-shadow-svg" cx="50" cy="93" rx="26" ry="5" fill="#09122a" opacity=".2"/><g className="pet-body"><ellipse cx="50" cy="67" rx="28" ry="25" fill="#f7c98b" stroke={OUTLINE} strokeWidth="4"/><ellipse cx="50" cy="71" rx="17" ry="17" fill="#fff5df"/></g><g className="pet-leg pet-leg-left"><ellipse cx="38" cy="89" rx="9" ry="5" fill="#f7c98b" stroke={OUTLINE} strokeWidth="3"/></g><g className="pet-leg pet-leg-right"><ellipse cx="62" cy="89" rx="9" ry="5" fill="#f7c98b" stroke={OUTLINE} strokeWidth="3"/></g><g className="pet-head"><circle cx="30" cy="31" r="10" fill="#f7c98b" stroke={OUTLINE} strokeWidth="4"/><circle cx="70" cy="31" r="10" fill="#f7c98b" stroke={OUTLINE} strokeWidth="4"/><circle cx="50" cy="45" r="26" fill="#f7c98b" stroke={OUTLINE} strokeWidth="4"/><Face eyeY={43} mouthY={58}/><path d="m50 50-4 3 4 3 4-3Z" fill="#f472b6"/></g><g className="pet-arm pet-arm-left"><path d="M35 68c-5 7-2 13 6 12" fill="none" stroke="#f7c98b" strokeWidth="8" strokeLinecap="round"/></g><g className="pet-arm pet-arm-right"><path d="M65 68c5 7 2 13-6 12" fill="none" stroke="#f7c98b" strokeWidth="8" strokeLinecap="round"/></g></svg>;
}

const petMap = {
  duck: () => <Duck/>, duckSpear: () => <Duck spear/>, cat: Cat, dog: Dog, bear: Bear,
  pig: Pig, rabbit: Rabbit, panda: () => <Bear panda/>, bird: () => <Bird/>, phoenix: () => <Bird phoenix/>,
  phoenixAdult: () => <Bird phoenix adult/>, dragon: () => <Dragon/>, dragonAdult: () => <Dragon adult/>,
  nebulaElder: NebulaElder, owl: Owl, fox: Fox, koi: Koi, hamster: Hamster,
};

const accessoryGlyph = {
  'acc-bow':'🎀', 'acc-crown':'👑', 'acc-glasses':'👓', 'acc-scarf':'🧣', 'acc-space':'🪐',
  'acc-star':'⭐', 'acc-wings':'🪽', 'acc-lightning':'⚡', 'acc-fire':'🔥', 'acc-water':'🫧', 'acc-wind':'🍃',
};

export default function PetSprite({ petId, accessoryId, size = 'md', className = '', mood = 'happy', action = 'idle' }) {
  const pet = getPetById(petId);
  const accessory = getPetAccessoryById(accessoryId);
  const PetArt = petMap[pet.species] || petMap.duck;
  return <span
    className={`pet-sprite pet-size-${size} pet-${pet.species} pet-id-${pet.id} mood-${mood} action-${action || 'idle'} ${accessoryId ? `pet-with-${accessoryId}` : ''} ${className}`}
    title={`${pet.name}${accessory ? ` · ${accessory.name}` : ''}`}
  >
    <span className="pet-shadow"/>
    <span className="pet-art"><PetArt/></span>
    {accessoryId && <span className={`pet-accessory ${accessoryId}`}>{accessoryGlyph[accessoryId] || accessory?.icon}</span>}
    <span className="pet-spark pet-spark-a">✦</span><span className="pet-spark pet-spark-b">·</span><span className="pet-spark pet-spark-c">✧</span>
  </span>;
}
