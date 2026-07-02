/* =========================================================
   AUTOMON ARENA — UI: screens, modals, shop phase
   ========================================================= */
'use strict';

const UI = {
  tab: 'home',
  moveFrom: null,       // team index awaiting a move target
  pendingBuy: null,     // shop index awaiting a slot tap
};

/* ---------------- tiny DOM helpers ---------------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
function $(sel) { return document.querySelector(sel); }

function toast(msg, kind = '') {
  const holder = $('#toasts');
  const t = el('div', 'toast ' + kind, msg);
  holder.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

function showModal(content, { closable = true, cls = '' } = {}) {
  closeModal();
  const wrap = el('div', 'modal-wrap');
  wrap.id = 'modal';
  const panel = el('div', 'modal-panel panel ' + cls);
  panel.appendChild(content);
  if (closable) {
    const x = el('button', 'modal-close', '✕');
    x.onclick = closeModal;
    panel.appendChild(x);
    wrap.onclick = (e) => { if (e.target === wrap) closeModal(); };
  }
  wrap.appendChild(panel);
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('show'));
  return wrap;
}
function closeModal() {
  const m = $('#modal');
  if (m) m.remove();
}

function typeChip(type) {
  const t = TYPES[type];
  return `<span class="type-chip" style="--tc:${t.color}">${t.name.toUpperCase()}</span>`;
}
function starsHtml(n) {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<span class="star ${i < n ? 'on' : ''}">★</span>`;
  return `<span class="stars">${s}</span>`;
}
function matIcon(id, scale = 2) {
  const shape = id === 'essence' ? 'orb' : 'shard';
  const c = iconCanvas(shape === 'orb' ? 'pearl' : 'shard', MATERIALS[id].color, scale);
  c.className = 'pix';
  return c;
}
function costHtml(cost) {
  return Object.entries(cost).map(([m, q]) => {
    const have = State.profile.materials[m] || 0;
    return `<span class="cost-chip ${have >= q ? '' : 'missing'}" style="--tc:${MATERIALS[m].color}">${q} ${MATERIALS[m].name}</span>`;
  }).join('');
}

/* ---------------- top bar & tabs ---------------- */

function renderTopbar() {
  const bar = clear($('#topbar'));
  const logo = el('div', 'top-logo', 'AUTOMON<span class="accent">ARENA</span>');
  bar.appendChild(logo);
  const res = el('div', 'top-res');
  res.appendChild(resBadge(iconCanvas('pearl', '#e8e6ff', 2), State.profile.materials.essence, 'Essence'));
  res.appendChild(resBadge(iconCanvas('orb', '#ff5a5a', 2), State.profile.orbs, 'Capture Orbs'));
  res.appendChild(resBadge(iconCanvas('orb', '#7ad9ff', 2), State.profile.greatOrbs, 'Great Orbs'));
  bar.appendChild(res);
}
function resBadge(icon, count, title) {
  const b = el('div', 'res-badge');
  b.title = title;
  icon.className = 'pix';
  b.appendChild(icon);
  b.appendChild(el('span', '', String(count)));
  return b;
}

const TAB_DEFS = [
  { id: 'home', label: 'HOME', icon: '⌂' },
  { id: 'battle', label: 'BATTLE', icon: '⚔' },
  { id: 'dex', label: 'DEX', icon: '◉' },
  { id: 'craft', label: 'CRAFT', icon: '⚒' },
  { id: 'rewards', label: 'LOOT', icon: '❒' },
];

function renderTabs() {
  const nav = clear($('#tabbar'));
  for (const t of TAB_DEFS) {
    const b = el('button', 'tab-btn' + (UI.tab === t.id ? ' active' : ''));
    b.innerHTML = `<span class="tab-icon">${t.icon}</span><span class="tab-label">${t.label}</span>`;
    if (t.id === 'rewards') {
      const ready = State.profile.chests.filter(chestReady).length + State.profile.eggs.filter(eggReady).length;
      if (ready > 0) b.appendChild(el('span', 'tab-dot', String(ready)));
    }
    b.onclick = () => { sfx('tap'); switchTab(t.id); };
    nav.appendChild(b);
  }
}

function switchTab(id) {
  UI.tab = id;
  UI.moveFrom = null;
  UI.pendingBuy = null;
  renderAll();
}

function renderAll() {
  renderTopbar();
  renderTabs();
  const screen = clear($('#screen'));
  screen.scrollTop = 0;
  switch (UI.tab) {
    case 'home': renderHome(screen); break;
    case 'battle': renderBattleTab(screen); break;
    case 'dex': renderDex(screen); break;
    case 'craft': renderCraft(screen); break;
    case 'rewards': renderRewards(screen); break;
  }
}

/* ---------------- HOME ---------------- */

function renderHome(root) {
  const hero = el('div', 'panel hero');
  hero.innerHTML = `
    <div class="hero-title">AUTOMON</div>
    <div class="hero-sub">A R E N A</div>
    <div class="hero-tag">Auto-battle • Catch • Collect • Craft</div>`;
  const heroRow = el('div', 'hero-sprites');
  for (const id of ['embit', 'puddlet', 'sparkit', 'sproutle']) {
    const c = spriteCanvas(id, 3);
    c.className = 'pix bob';
    c.style.animationDelay = (Math.random() * -2) + 's';
    heroRow.appendChild(c);
  }
  hero.appendChild(heroRow);
  root.appendChild(hero);

  // Expedition card
  const run = State.run;
  const exp = el('div', 'panel card');
  if (run) {
    exp.innerHTML = `
      <div class="card-title">EXPEDITION IN PROGRESS</div>
      <div class="card-body">Turn ${run.turn} • ${run.trophies}/${RUN.trophiesToWin} trophies • ${run.lives} ♥ left</div>`;
    const b = el('button', 'btn btn-primary', 'CONTINUE ▶');
    b.onclick = () => { sfx('tap'); switchTab('battle'); };
    exp.appendChild(b);
  } else {
    exp.innerHTML = `
      <div class="card-title">EXPEDITION</div>
      <div class="card-body">Build a team, auto-battle wild squads, and win ${RUN.trophiesToWin} trophies. Catch defeated monsters to grow your Dex!</div>`;
    const b = el('button', 'btn btn-primary', 'NEW EXPEDITION ▶');
    b.onclick = () => { sfx('tap'); startRun(); switchTab('battle'); };
    exp.appendChild(b);
  }
  root.appendChild(exp);

  // Idle training card
  const idle = el('div', 'panel card');
  const pending = idlePending();
  idle.innerHTML = `
    <div class="card-title">TRAINING CAMP <span class="hint">(idle)</span></div>
    <div class="card-body">Your automon train while you're away:
      <b class="accent">+${idleRatePerHour()} essence/h</b> (grows with your Dex).
      <div class="idle-bar"><div class="idle-fill" style="width:${Math.min(100, (Date.now() - State.profile.idleClaimedAt) / (IDLE.capHours * 36000)).toFixed(1)}%"></div></div>
      <span class="hint">${idleCapped() ? 'Camp storage FULL — claim now!' : 'Storage caps after ' + IDLE.capHours + 'h.'}</span>
    </div>`;
  const claim = el('button', 'btn ' + (pending > 0 ? 'btn-gold' : 'btn-disabled'), `CLAIM ${pending} ESSENCE`);
  claim.disabled = pending <= 0;
  claim.onclick = () => {
    const got = claimIdle();
    if (got > 0) { sfx('reward'); toast(`+${got} essence from training camp!`, 'good'); renderAll(); }
  };
  idle.appendChild(claim);
  root.appendChild(idle);

  // Stats
  const stats = el('div', 'panel card');
  stats.innerHTML = `
    <div class="card-title">TRAINER RECORD</div>
    <div class="stat-grid">
      <div class="stat"><div class="stat-num">${State.profile.bestTrophies}</div><div class="stat-lbl">BEST TROPHIES</div></div>
      <div class="stat"><div class="stat-num">${State.profile.runsWon}</div><div class="stat-lbl">RUNS WON</div></div>
      <div class="stat"><div class="stat-num">${uniqueCaught()}/${SPECIES.length}</div><div class="stat-lbl">DEX</div></div>
      <div class="stat"><div class="stat-num">${State.profile.totalCatches}</div><div class="stat-lbl">CATCHES</div></div>
    </div>`;
  root.appendChild(stats);

  // Footer: sound + reset
  const foot = el('div', 'home-foot');
  const snd = el('button', 'btn btn-small', State.profile.muted ? '🔇 SOUND OFF' : '🔊 SOUND ON');
  snd.onclick = () => { State.profile.muted = !State.profile.muted; save(); renderAll(); };
  const reset = el('button', 'btn btn-small btn-danger', 'RESET SAVE');
  reset.onclick = () => {
    const body = el('div');
    body.innerHTML = `<div class="card-title">RESET EVERYTHING?</div>
      <div class="card-body">Your Dex, items and progress will be lost forever.</div>`;
    const yes = el('button', 'btn btn-danger', 'YES, WIPE IT');
    yes.onclick = () => { wipeSave(); closeModal(); renderAll(); toast('Save wiped.'); };
    body.appendChild(yes);
    showModal(body);
  };
  foot.appendChild(snd);
  foot.appendChild(reset);
  root.appendChild(foot);
}

/* ---------------- BATTLE TAB (shop phase) ---------------- */

function renderBattleTab(root) {
  const run = State.run;
  if (!run) {
    const p = el('div', 'panel card center');
    p.innerHTML = `<div class="card-title">NO ACTIVE EXPEDITION</div>
      <div class="card-body">Win ${RUN.trophiesToWin} battles before losing ${RUN.lives} lives.<br>
      Defeated wild monsters can be <b class="accent">caught</b> with Capture Orbs!</div>`;
    const b = el('button', 'btn btn-primary', 'NEW EXPEDITION ▶');
    b.onclick = () => { sfx('tap'); startRun(); renderAll(); };
    p.appendChild(b);
    root.appendChild(p);
    return;
  }

  // run header
  const head = el('div', 'panel run-head');
  let hearts = '';
  for (let i = 0; i < RUN.lives; i++) hearts += `<span class="heart ${i < run.lives ? '' : 'off'}">♥</span>`;
  let pips = '';
  for (let i = 0; i < RUN.trophiesToWin; i++) pips += `<span class="pip ${i < run.trophies ? 'on' : ''}"></span>`;
  head.innerHTML = `
    <div class="run-row"><span class="run-lbl">TURN ${run.turn}</span><span class="hearts">${hearts}</span></div>
    <div class="run-row"><span class="run-lbl">TROPHIES</span><span class="pips">${pips}</span></div>
    <div class="run-row gold-row"><span class="run-lbl">GOLD <button class="btn btn-small give-up" title="Abandon expedition">🏳 QUIT</button></span><span class="gold-amt">◈ ${run.gold}</span></div>`;
  const giveUp = head.querySelector('.give-up');
  giveUp.onclick = () => {
    const body = el('div', 'center');
    body.innerHTML = `<div class="card-title">ABANDON EXPEDITION?</div>
      <div class="card-body">You keep everything earned so far, plus a small consolation of essence. The run ends as a defeat.</div>`;
    const yes = el('button', 'btn btn-danger', 'ABANDON');
    yes.onclick = () => {
      closeModal();
      const rewards = endRun(false);
      runEndModal(false, rewards);
    };
    body.appendChild(yes);
    showModal(body);
  };
  root.appendChild(head);

  // team
  const teamPanel = el('div', 'panel');
  teamPanel.appendChild(el('div', 'sec-title', 'YOUR TEAM <span class="hint">— front attacks first</span>'));
  const teamRow = el('div', 'team-row');
  for (let i = 0; i < RUN.teamSize; i++) {
    teamRow.appendChild(teamSlotEl(i));
  }
  teamPanel.appendChild(teamRow);
  root.appendChild(teamPanel);

  // shop
  const shopPanel = el('div', 'panel');
  const shopHead = el('div', 'sec-title', `RECRUIT <span class="hint">— ${RUN.buyCost}◈ each</span>`);
  shopPanel.appendChild(shopHead);
  const shopRow = el('div', 'shop-row');
  run.shop.forEach((slot, i) => shopRow.appendChild(shopSlotEl(slot, i)));
  shopPanel.appendChild(shopRow);

  const btnRow = el('div', 'btn-row');
  const reroll = el('button', 'btn' + (run.gold < RUN.rerollCost ? ' btn-disabled' : ''), `↻ REROLL ${RUN.rerollCost}◈`);
  reroll.onclick = () => {
    UI.pendingBuy = null;
    UI.moveFrom = null;
    if (rollShop()) { sfx('tap'); renderAll(); }
    else if (teamUnits().length === 0 && run.gold >= RUN.rerollCost) toast('Recruit a monster first!', 'bad');
    else toast('Not enough gold!', 'bad');
  };
  const items = el('button', 'btn', `🎒 ITEMS (${Object.values(State.profile.items).reduce((a, b) => a + b, 0)})`);
  items.onclick = () => { sfx('tap'); openItemDrawer(); };
  btnRow.appendChild(reroll);
  btnRow.appendChild(items);
  shopPanel.appendChild(btnRow);
  root.appendChild(shopPanel);

  const canFight = teamUnits().length > 0;
  const fight = el('button', 'btn btn-fight' + (canFight ? '' : ' btn-disabled'), '⚔ FIGHT!');
  fight.disabled = !canFight;
  fight.onclick = () => { sfx('fight'); startBattlePhase(); };
  root.appendChild(fight);

  if (UI.moveFrom !== null) {
    toastOnce('Tap a slot to move ' + SPECIES_BY_ID[run.team[UI.moveFrom].speciesId].name);
  }
}

let lastToastMsg = '';
function toastOnce(msg) {
  if (lastToastMsg === msg) return;
  lastToastMsg = msg;
  toast(msg);
  setTimeout(() => { lastToastMsg = ''; }, 2500);
}

function teamSlotEl(i) {
  const run = State.run;
  const unit = run.team[i];
  const slot = el('div', 'team-slot' + (unit ? '' : ' empty') + (UI.moveFrom === i ? ' selected' : '') + (UI.moveFrom !== null || UI.pendingBuy !== null ? ' pulse' : ''));
  if (i === 0) slot.appendChild(el('div', 'front-tag', 'FRONT'));
  if (unit) {
    const sp = SPECIES_BY_ID[unit.speciesId];
    const st = unitStats(unit);
    const c = spriteCanvas(unit.speciesId, 3);
    c.className = 'pix';
    slot.appendChild(c);
    slot.appendChild(el('div', 'slot-name', sp.name));
    slot.appendChild(el('div', 'slot-stats', `<span class="atk">${st.atk}⚔</span><span class="hp">${st.hp}♥</span>`));
    slot.appendChild(el('div', 'slot-lvl', 'Lv' + st.level));
    if (unit.item) {
      const ic = iconCanvas(ITEMS[unit.item].icon, '#ffd93d', 2);
      ic.className = 'pix slot-item';
      ic.title = ITEMS[unit.item].name;
      slot.appendChild(ic);
    }
  } else {
    slot.appendChild(el('div', 'slot-plus', '+'));
  }
  slot.onclick = () => {
    sfx('tap');
    if (UI.pendingBuy !== null) {
      const res = buyToSlot(UI.pendingBuy, i);
      UI.pendingBuy = null;
      if (res.ok) sfx(res.merged ? 'merge' : 'buy');
      else toast(res.reason, 'bad');
      renderAll();
      return;
    }
    if (UI.moveFrom !== null) {
      const from = UI.moveFrom;
      UI.moveFrom = null;
      if (from !== i) { moveUnit(from, i); sfx('merge'); }
      renderAll();
      return;
    }
    if (unit) openUnitSheet(i);
  };
  return slot;
}

function shopSlotEl(slot, i) {
  const card = el('div', 'shop-card' + (slot ? '' : ' sold') + (slot && slot.frozen ? ' frozen' : ''));
  if (!slot) {
    card.appendChild(el('div', 'slot-plus', '·'));
    return card;
  }
  const sp = SPECIES_BY_ID[slot.speciesId];
  const c = spriteCanvas(sp.id, 3);
  c.className = 'pix';
  card.appendChild(c);
  card.appendChild(el('div', 'slot-name', sp.name));
  card.appendChild(el('div', 'slot-stats', `<span class="atk">${sp.atk}⚔</span><span class="hp">${sp.hp}♥</span>`));
  card.appendChild(el('div', 'shop-type', typeChip(sp.type)));
  if (slot.frozen) card.appendChild(el('div', 'frozen-tag', '❄'));
  card.onclick = () => { sfx('tap'); openShopSheet(slot, i); };
  return card;
}

function openShopSheet(slot, i) {
  const sp = SPECIES_BY_ID[slot.speciesId];
  const body = speciesInfoEl(sp, { stars: stars(sp.id) });
  const btns = el('div', 'btn-row');
  const buy = el('button', 'btn btn-primary' + (State.run.gold < RUN.buyCost ? ' btn-disabled' : ''), `BUY ${RUN.buyCost}◈`);
  buy.onclick = () => {
    closeModal();
    const best = bestSlotFor(sp.id);
    if (best === -1) { toast('Team is full!', 'bad'); return; }
    const res = buyToSlot(i, best);
    if (res.ok) { sfx(res.merged ? 'merge' : 'buy'); toast(res.merged ? `${sp.name} merged! +1 XP` : `${sp.name} joined!`, 'good'); }
    else toast(res.reason, 'bad');
    renderAll();
  };
  const pick = el('button', 'btn', 'PICK SLOT…');
  pick.onclick = () => { closeModal(); UI.pendingBuy = i; renderAll(); toastOnce('Tap a team slot to place ' + sp.name); };
  const freeze = el('button', 'btn', slot.frozen ? 'UNFREEZE ❄' : 'FREEZE ❄');
  freeze.onclick = () => { toggleFreeze(i); closeModal(); renderAll(); };
  btns.appendChild(buy);
  btns.appendChild(pick);
  btns.appendChild(freeze);
  body.appendChild(btns);
  showModal(body);
}

function openUnitSheet(i) {
  const unit = State.run.team[i];
  const sp = SPECIES_BY_ID[unit.speciesId];
  const st = unitStats(unit);
  const body = speciesInfoEl(sp, { stars: stars(sp.id), unit });
  const prog = unitXpProgress(unit);
  if (prog) body.appendChild(el('div', 'hint center', `XP ${prog.have}/${prog.need} — merge duplicates to level up`));
  else body.appendChild(el('div', 'hint center', 'MAX LEVEL'));

  const btns = el('div', 'btn-row wrap');
  const equip = el('button', 'btn', unit.item ? `SWAP ITEM` : 'EQUIP ITEM');
  equip.onclick = () => { closeModal(); openItemDrawer(i); };
  btns.appendChild(equip);
  if (unit.item) {
    const uneq = el('button', 'btn', 'UNEQUIP');
    uneq.onclick = () => { unequipItem(i); closeModal(); renderAll(); };
    btns.appendChild(uneq);
  }
  const move = el('button', 'btn', 'MOVE ⇄');
  move.onclick = () => { closeModal(); UI.moveFrom = i; renderAll(); };
  const sell = el('button', 'btn btn-danger', `SELL +${RUN.sellValue * st.level}◈`);
  sell.onclick = () => {
    closeModal();
    if (sellUnit(i)) sfx('buy');
    else toast("Can't sell your last monster!", 'bad');
    renderAll();
  };
  btns.appendChild(move);
  btns.appendChild(sell);
  body.appendChild(btns);
  showModal(body);
}

function openItemDrawer(teamIdx = null) {
  const body = el('div');
  body.appendChild(el('div', 'card-title center', teamIdx === null ? 'HELD ITEMS' : 'EQUIP AN ITEM'));
  const entries = Object.entries(State.profile.items).filter(([, n]) => n > 0);
  if (!entries.length) {
    body.appendChild(el('div', 'card-body center', 'No items yet.<br>Craft them in the CRAFT tab or find them in chests!'));
  } else {
    const list = el('div', 'item-list');
    for (const [id, n] of entries) {
      const it = ITEMS[id];
      const row = el('div', 'item-row');
      const ic = iconCanvas(it.icon, '#ffd93d', 3);
      ic.className = 'pix';
      row.appendChild(ic);
      row.appendChild(el('div', 'item-info', `<b>${it.name}</b> ×${n}<br><span class="hint">${it.desc}</span>`));
      if (teamIdx !== null) {
        const eq = el('button', 'btn btn-small btn-primary', 'EQUIP');
        eq.onclick = () => { equipItem(teamIdx, id); sfx('merge'); closeModal(); renderAll(); };
        row.appendChild(eq);
      }
      list.appendChild(row);
    }
    body.appendChild(list);
  }
  if (teamIdx === null) body.appendChild(el('div', 'hint center', 'Tap one of your team members to equip items.'));
  showModal(body);
}

function speciesInfoEl(sp, { stars: starCount = 0, unit = null } = {}) {
  const body = el('div', 'species-info');
  const head = el('div', 'sp-head');
  const c = spriteCanvas(sp.id, 5);
  c.className = 'pix';
  head.appendChild(c);
  const st = unit ? unitStats(unit) : { atk: sp.atk, hp: sp.hp, level: 1 };
  head.appendChild(el('div', 'sp-headinfo', `
    <div class="sp-name">${sp.name} ${unit ? '<span class="lvl-tag">Lv' + st.level + '</span>' : ''}</div>
    <div>${typeChip(sp.type)} <span class="tier-tag">TIER ${sp.tier}</span></div>
    <div class="slot-stats big"><span class="atk">${st.atk}⚔</span><span class="hp">${st.hp}♥</span></div>
    ${starsHtml(starCount)}`));
  body.appendChild(head);
  body.appendChild(el('div', 'sp-dex', '“' + sp.dex + '”'));
  body.appendChild(el('div', 'sp-move', `<span class="mv-tag">MOVE</span> <b>${sp.move.name}</b><br><span class="hint">${sp.move.desc}</span>`));
  body.appendChild(el('div', 'sp-move', `<span class="mv-tag ps">PASSIVE</span> <b>${sp.passive.name}</b><br><span class="hint">${sp.passive.desc}</span>`));
  if (unit && unit.item) {
    body.appendChild(el('div', 'sp-move', `<span class="mv-tag it">ITEM</span> <b>${ITEMS[unit.item].name}</b><br><span class="hint">${ITEMS[unit.item].desc}</span>`));
  }
  return body;
}

/* ---------------- DEX ---------------- */

function renderDex(root) {
  const head = el('div', 'panel card');
  head.innerHTML = `<div class="card-title">MONSTER DEX</div>
    <div class="card-body">Caught <b class="accent">${uniqueCaught()}</b> of <b>${SPECIES.length}</b> species.
    Each extra catch adds a ★ — every star gives that species <b>+5%</b> stats!</div>`;
  root.appendChild(head);

  for (let tier = 1; tier <= 3; tier++) {
    const sec = el('div', 'panel');
    sec.appendChild(el('div', 'sec-title', `TIER ${tier}`));
    const grid = el('div', 'dex-grid');
    for (const sp of SPECIES.filter(s => s.tier === tier)) {
      const c = State.profile.collection[sp.id];
      const card = el('div', 'dex-card' + (c.caught > 0 ? '' : ' locked'));
      const canvas = c.caught > 0 ? spriteCanvas(sp.id, 3) : silhouetteCanvas(sp.id, 3);
      canvas.className = 'pix';
      card.appendChild(canvas);
      card.appendChild(el('div', 'slot-name', c.caught > 0 ? sp.name : (c.seen ? sp.name + '?' : '???')));
      if (c.caught > 0) card.appendChild(el('div', '', starsHtml(stars(sp.id))));
      else card.appendChild(el('div', 'hint', c.seen ? 'seen' : 'unknown'));
      card.onclick = () => {
        sfx('tap');
        if (c.caught > 0) showModal(speciesInfoEl(sp, { stars: stars(sp.id) }));
        else {
          const b = el('div', 'center');
          const sil = silhouetteCanvas(sp.id, 5);
          sil.className = 'pix';
          b.appendChild(sil);
          b.appendChild(el('div', 'card-title', c.seen ? sp.name + '?' : 'UNKNOWN'));
          b.appendChild(el('div', 'card-body', c.seen
            ? 'You fought this monster. Defeat it again and catch it with an orb, or hatch it from an egg!'
            : 'Not yet encountered. Battle deeper into expeditions to find it!'));
          showModal(b);
        }
      };
      grid.appendChild(card);
    }
    sec.appendChild(grid);
    root.appendChild(sec);
  }
}

/* ---------------- CRAFT ---------------- */

function renderCraft(root) {
  const mats = el('div', 'panel');
  mats.appendChild(el('div', 'sec-title', 'MATERIALS'));
  const strip = el('div', 'mat-strip');
  for (const [id, m] of Object.entries(MATERIALS)) {
    const b = el('div', 'mat-badge');
    b.title = m.desc;
    const ic = iconCanvas(id === 'essence' ? 'pearl' : 'shard', m.color, 2);
    ic.className = 'pix';
    b.appendChild(ic);
    b.appendChild(el('span', '', String(State.profile.materials[id] || 0)));
    strip.appendChild(b);
  }
  mats.appendChild(strip);
  mats.appendChild(el('div', 'hint', 'Win battles to gather shards of the defeated types. Duplicate catches give bonus shards.'));
  root.appendChild(mats);

  const inv = el('div', 'panel');
  inv.appendChild(el('div', 'sec-title', 'ITEM BAG'));
  const entries = Object.entries(State.profile.items).filter(([, n]) => n > 0);
  if (!entries.length) inv.appendChild(el('div', 'hint', 'No held items yet — craft some below!'));
  else {
    const row = el('div', 'bag-row');
    for (const [id, n] of entries) {
      const it = ITEMS[id];
      const cell = el('div', 'bag-cell');
      const ic = iconCanvas(it.icon, '#ffd93d', 3);
      ic.className = 'pix';
      cell.appendChild(ic);
      cell.appendChild(el('span', 'bag-n', '×' + n));
      cell.title = it.name;
      cell.onclick = () => {
        const b = el('div', 'center');
        const big = iconCanvas(it.icon, '#ffd93d', 6);
        big.className = 'pix';
        b.appendChild(big);
        b.appendChild(el('div', 'card-title', it.name.toUpperCase()));
        b.appendChild(el('div', 'card-body', it.desc + '<br><span class="hint">Equip it on a team member during an expedition.</span>'));
        showModal(b);
      };
      row.appendChild(cell);
    }
    inv.appendChild(row);
  }
  root.appendChild(inv);

  const rec = el('div', 'panel');
  rec.appendChild(el('div', 'sec-title', 'CRAFTING'));
  for (const r of RECIPES) {
    const row = el('div', 'recipe-row');
    let icon;
    if (r.out.orb) icon = iconCanvas('orb', '#ff5a5a', 3);
    else if (r.out.greatOrb) icon = iconCanvas('orb', '#7ad9ff', 3);
    else icon = iconCanvas(ITEMS[r.out.item].icon, '#ffd93d', 3);
    icon.className = 'pix';
    row.appendChild(icon);
    row.appendChild(el('div', 'recipe-info', `<b>${r.name}</b><br><span class="hint">${r.desc}</span><div class="cost-row">${costHtml(r.cost)}</div>`));
    const ok = canAfford(r.cost);
    const btn = el('button', 'btn btn-small ' + (ok ? 'btn-primary' : 'btn-disabled'), 'CRAFT');
    btn.disabled = !ok;
    btn.onclick = () => {
      if (craft(r)) { sfx('craft'); toast(`Crafted ${r.name}!`, 'good'); renderAll(); }
      else toast('Missing materials!', 'bad');
    };
    row.appendChild(btn);
    rec.appendChild(row);
  }
  root.appendChild(rec);
}

/* ---------------- REWARDS (eggs & chests) ---------------- */

function renderRewards(root) {
  // eggs
  const eggs = el('div', 'panel');
  eggs.appendChild(el('div', 'sec-title', `EGGS <span class="hint">${State.profile.eggs.length}/${MAX_EGGS}</span>`));
  const eggRow = el('div', 'loot-row');
  State.profile.eggs.forEach((egg, i) => {
    const def = EGGS[egg.kind];
    const cell = el('div', 'loot-cell');
    const ic = iconCanvas('egg', def.color, 4);
    ic.className = 'pix' + (eggReady(egg) ? ' wobble' : '');
    cell.appendChild(ic);
    cell.appendChild(el('div', 'slot-name', def.name));
    if (eggReady(egg)) {
      const b = el('button', 'btn btn-small btn-gold', 'HATCH!');
      b.onclick = () => hatchFlow(i);
      cell.appendChild(b);
    } else {
      const t = el('div', 'timer');
      t.dataset.countdown = String(eggReadyAt(egg));
      t.textContent = fmtDuration(eggReadyAt(egg) - Date.now());
      cell.appendChild(t);
    }
    eggRow.appendChild(cell);
  });
  for (let i = State.profile.eggs.length; i < MAX_EGGS; i++) {
    const cell = el('div', 'loot-cell empty');
    cell.appendChild(el('div', 'slot-plus', '+'));
    cell.appendChild(el('div', 'hint', 'empty'));
    eggRow.appendChild(cell);
  }
  eggs.appendChild(eggRow);
  eggs.appendChild(el('div', 'hint', 'Win expeditions and open chests to find eggs. Eggs hatch into new Dex species!'));
  root.appendChild(eggs);

  // chests
  const chests = el('div', 'panel');
  chests.appendChild(el('div', 'sec-title', `CHESTS <span class="hint">${State.profile.chests.length}/${MAX_CHESTS}</span>`));
  const chestRow = el('div', 'loot-row');
  State.profile.chests.forEach((chest, i) => {
    const def = CHESTS[chest.kind];
    const cell = el('div', 'loot-cell');
    const ic = iconCanvas('chest', def.color, 4);
    ic.className = 'pix' + (chestReady(chest) ? ' wobble' : '');
    cell.appendChild(ic);
    cell.appendChild(el('div', 'slot-name', def.name));
    if (chestReady(chest)) {
      const b = el('button', 'btn btn-small btn-gold', 'OPEN!');
      b.onclick = () => openChestFlow(i);
      cell.appendChild(b);
    } else if (chestUnlocking(chest)) {
      const t = el('div', 'timer');
      t.dataset.countdown = String(chestReadyAt(chest));
      t.textContent = fmtDuration(chestReadyAt(chest) - Date.now());
      cell.appendChild(t);
    } else {
      const b = el('button', 'btn btn-small', `UNLOCK (${def.mins}m)`);
      b.onclick = () => {
        if (startChest(i)) { sfx('tap'); renderAll(); }
        else toast('Another chest is already unlocking!', 'bad');
      };
      cell.appendChild(b);
    }
    chestRow.appendChild(cell);
  });
  for (let i = State.profile.chests.length; i < MAX_CHESTS; i++) {
    const cell = el('div', 'loot-cell empty');
    cell.appendChild(el('div', 'slot-plus', '+'));
    cell.appendChild(el('div', 'hint', 'empty'));
    chestRow.appendChild(cell);
  }
  chests.appendChild(chestRow);
  chests.appendChild(el('div', 'hint', 'Win battles to earn chests. Only one chest unlocks at a time — tap UNLOCK to start its timer.'));
  root.appendChild(chests);
}

function hatchFlow(index) {
  const result = hatchEgg(index);
  if (!result) return;
  sfx('reward');
  const b = el('div', 'center');
  const c = spriteCanvas(result.species.id, 6);
  c.className = 'pix pop-in';
  b.appendChild(c);
  b.appendChild(el('div', 'card-title', `${result.species.name} HATCHED!`));
  b.appendChild(el('div', '', typeChip(result.species.type)));
  b.appendChild(el('div', 'card-body', (result.first
    ? '<b class="accent">NEW SPECIES!</b> Added to your Dex and shop pool.'
    : '+1 ★ for this species (duplicate).') + `<br>+${result.essence} essence`));
  const ok = el('button', 'btn btn-primary', 'NICE!');
  ok.onclick = () => { closeModal(); renderAll(); };
  b.appendChild(ok);
  showModal(b, { closable: false });
}

function openChestFlow(index) {
  const loot = openChest(index);
  if (!loot) return;
  sfx('reward');
  const b = el('div', 'center');
  b.appendChild(el('div', 'card-title', 'CHEST OPENED!'));
  const list = el('div', 'loot-list');
  for (const [m, q] of Object.entries(loot.materials)) {
    const row = el('div', 'loot-line');
    const ic = matIcon(m, 2);
    row.appendChild(ic);
    row.appendChild(el('span', '', `+${q} ${MATERIALS[m].name}`));
    list.appendChild(row);
  }
  if (loot.orbs) {
    const row = el('div', 'loot-line');
    const ic = iconCanvas('orb', '#ff5a5a', 2); ic.className = 'pix';
    row.appendChild(ic);
    row.appendChild(el('span', '', `+${loot.orbs} Capture Orb${loot.orbs > 1 ? 's' : ''}`));
    list.appendChild(row);
  }
  if (loot.greatOrbs) {
    const row = el('div', 'loot-line');
    const ic = iconCanvas('orb', '#7ad9ff', 2); ic.className = 'pix';
    row.appendChild(ic);
    row.appendChild(el('span', '', `+${loot.greatOrbs} Great Orb`));
    list.appendChild(row);
  }
  for (const it of loot.items) {
    const row = el('div', 'loot-line');
    const ic = iconCanvas(ITEMS[it].icon, '#ffd93d', 2); ic.className = 'pix';
    row.appendChild(ic);
    row.appendChild(el('span', '', ITEMS[it].name + '!'));
    list.appendChild(row);
  }
  if (loot.egg) {
    const row = el('div', 'loot-line');
    const ic = iconCanvas('egg', EGGS[loot.egg].color, 2); ic.className = 'pix';
    row.appendChild(ic);
    row.appendChild(el('span', '', EGGS[loot.egg].name + '!'));
    list.appendChild(row);
  }
  b.appendChild(list);
  const ok = el('button', 'btn btn-primary', 'COLLECT');
  ok.onclick = () => { closeModal(); renderAll(); };
  b.appendChild(ok);
  showModal(b, { closable: false });
}

/* ---------------- countdown refresher ---------------- */

function refreshTimers() {
  let needsRender = false;
  document.querySelectorAll('[data-countdown]').forEach(n => {
    const left = Number(n.dataset.countdown) - Date.now();
    n.textContent = fmtDuration(left);
    if (left <= 0) needsRender = true;
  });
  if (needsRender && !$('#modal') && !$('#battle-overlay')) renderAll();
}
