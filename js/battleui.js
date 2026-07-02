/* =========================================================
   AUTOMON ARENA — battle overlay, presenter, catch phase
   ========================================================= */
'use strict';

const BattleUI = {
  speed: 1,     // 1, 2, 4
  skipping: false,
};

function battleDelay(ms) {
  if (BattleUI.skipping) return Promise.resolve();
  return new Promise(res => setTimeout(res, ms / BattleUI.speed));
}

/* ---------------- overlay scaffolding ---------------- */

function openBattleOverlay() {
  closeBattleOverlay();
  const ov = el('div', 'battle-overlay');
  ov.id = 'battle-overlay';
  ov.innerHTML = `
    <div class="battle-sky"><div class="battle-stars"></div></div>
    <div class="battle-top">
      <div class="battle-round" id="b-round">BATTLE!</div>
      <div class="battle-ctl">
        <button class="btn btn-small" id="b-speed">×1</button>
        <button class="btn btn-small" id="b-skip">SKIP ≫</button>
      </div>
    </div>
    <div class="battle-banner" id="b-banner"></div>
    <div class="arena">
      <div class="arena-side ally" id="arena-ally"></div>
      <div class="arena-vs">VS</div>
      <div class="arena-side foe" id="arena-foe"></div>
    </div>
    <div class="battle-log" id="b-log"></div>`;
  document.body.appendChild(ov);
  $('#b-speed').onclick = () => {
    BattleUI.speed = BattleUI.speed >= 4 ? 1 : BattleUI.speed * 2;
    $('#b-speed').textContent = '×' + BattleUI.speed;
  };
  $('#b-skip').onclick = () => { BattleUI.skipping = true; };
  return ov;
}
function closeBattleOverlay() {
  const ov = $('#battle-overlay');
  if (ov) ov.remove();
}

function fighterEl(f) {
  const box = el('div', 'fighter' + (f.side === 'foe' ? ' foe' : ''));
  box.id = 'f-' + f.uid;
  const c = spriteCanvas(f.speciesId, 4, f.side === 'foe');
  c.className = 'pix f-sprite';
  box.appendChild(c);
  const info = el('div', 'f-info');
  info.innerHTML = `
    <div class="f-name">${f.name}<span class="f-lvl">Lv${f.level}</span></div>
    <div class="hpbar"><div class="hpfill"></div><div class="shieldfill"></div></div>
    <div class="f-nums"><span class="atk">${f.atk}⚔</span><span class="hp-num">${f.hp}/${f.maxHp}</span></div>
    <div class="chargebar"><div class="chargefill"></div></div>`;
  box.appendChild(info);
  if (f.item) {
    const ic = iconCanvas(ITEMS[f.item].icon, '#ffd93d', 2);
    ic.className = 'pix f-item';
    ic.title = ITEMS[f.item].name;
    box.appendChild(ic);
  }
  return box;
}

function updateFighterEl(f) {
  const box = $('#f-' + f.uid);
  if (!box) return;
  const pct = Math.max(0, Math.min(100, (f.hp / f.maxHp) * 100));
  const fill = box.querySelector('.hpfill');
  fill.style.width = pct + '%';
  fill.style.background = pct > 50 ? 'var(--hp-hi)' : pct > 25 ? 'var(--hp-mid)' : 'var(--hp-lo)';
  const sh = box.querySelector('.shieldfill');
  sh.style.width = Math.min(100, (f.shield / f.maxHp) * 100) + '%';
  box.querySelector('.hp-num').textContent = `${Math.max(0, f.hp)}/${f.maxHp}`;
  box.querySelector('.atk').textContent = f.atk + '⚔';
  box.querySelector('.chargefill').style.width = Math.min(100, (f.charge / f.chargeMax) * 100) + '%';
  box.classList.toggle('burning', f.burn > 0);
}

function floatText(f, text, cls) {
  const box = $('#f-' + f.uid);
  if (!box) return;
  const ft = el('div', 'float-text ' + cls, text);
  ft.style.left = (30 + Math.random() * 40) + '%';
  box.appendChild(ft);
  setTimeout(() => ft.remove(), 900);
}

function logLine(text) {
  const log = $('#b-log');
  if (!log) return;
  const line = el('div', 'log-line', text);
  log.appendChild(line);
  while (log.children.length > 3) log.removeChild(log.firstChild);
}

async function banner(text, cls = '') {
  const b = $('#b-banner');
  if (!b) return;
  b.innerHTML = `<span class="banner-inner ${cls}">${text}</span>`;
  b.classList.add('show');
  await battleDelay(550);
  b.classList.remove('show');
}

/* ---------------- DOM presenter ---------------- */

function domPresenter() {
  return {
    async setup(allies, foes) {
      const aSide = clear($('#arena-ally'));
      const fSide = clear($('#arena-foe'));
      // front units are rendered nearest the center
      for (const f of [...allies].reverse()) aSide.appendChild(fighterEl(f));
      for (const f of foes) fSide.appendChild(fighterEl(f));
      allies.forEach(updateFighterEl);
      foes.forEach(updateFighterEl);
      await battleDelay(700);
    },
    async roundStart(round) {
      const r = $('#b-round');
      if (r) r.textContent = 'ROUND ' + round;
      await battleDelay(150);
    },
    async clash(a, b) {
      const ea = $('#f-' + a.uid), eb = $('#f-' + b.uid);
      if (ea) ea.classList.add('lunge-r');
      if (eb) eb.classList.add('lunge-l');
      sfx('hit');
      await battleDelay(260);
      if (ea) ea.classList.remove('lunge-r');
      if (eb) eb.classList.remove('lunge-l');
    },
    async clashEnd() { await battleDelay(240); },
    async damage(f, amount, kind, isMove) {
      const box = $('#f-' + f.uid);
      if (box) { box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 300); }
      floatText(f, '-' + amount, kind === 'super' ? 'dmg super' : kind === 'weak' ? 'dmg weak' : 'dmg');
      if (kind === 'super') { floatText(f, 'SUPER!', 'eff'); sfx('super'); }
      if (kind === 'weak') floatText(f, 'resist', 'eff weak');
      updateFighterEl(f);
      await battleDelay(isMove ? 300 : 220);
    },
    async heal(f, amount) {
      floatText(f, '+' + amount, 'healf');
      updateFighterEl(f);
      await battleDelay(160);
    },
    async buff(f, stat, amount) {
      floatText(f, `+${amount} ${stat}`, 'bufff');
      updateFighterEl(f);
      await battleDelay(160);
    },
    async shielded(f, amount) {
      floatText(f, '+' + amount + '🛡', 'shieldf');
      updateFighterEl(f);
      await battleDelay(160);
    },
    async shieldHit(f, absorbed) {
      floatText(f, '🛡-' + absorbed, 'shieldf');
      updateFighterEl(f);
      await battleDelay(120);
    },
    async burned(f) {
      floatText(f, 'BURN!', 'burnf');
      updateFighterEl(f);
      await battleDelay(160);
    },
    async burnTick(f) {
      floatText(f, '🔥', 'burnf');
      await battleDelay(100);
    },
    async faint(f) {
      logLine(`${f.name} fainted!`);
      sfx('faint');
      const box = $('#f-' + f.uid);
      if (box) box.classList.add('fainted');
      await battleDelay(380);
      if (box) box.classList.add('gone');
      await battleDelay(160);
    },
    async refresh(f) { updateFighterEl(f); },
    async moveBanner(f, name) {
      logLine(`${f.name} used ${name}!`);
      sfx('move');
      const box = $('#f-' + f.uid);
      if (box) { box.classList.add('glow'); setTimeout(() => box.classList.remove('glow'), 500); }
      await banner(`${f.name} used <b>${name}</b>!`, TYPES[f.type] ? 'type-' + f.type : '');
    },
    async passiveBanner(f, name) {
      logLine(`${f.name}'s ${name}!`);
      await banner(`${f.name}'s <b>${name}</b>`, 'passive');
    },
    async itemProc(f, itemId, text) {
      logLine(text);
      floatText(f, ITEMS[itemId].name + '!', 'itemf');
      await battleDelay(280);
    },
    async finish(result) {
      await battleDelay(300);
    },
  };
}

/* ---------------- battle phase flow ---------------- */

async function startBattlePhase() {
  const run = State.run;
  BattleUI.skipping = false;
  const enemies = generateEnemyTeam(run.turn);
  openBattleOverlay();
  const result = await runBattle(teamUnits(), enemies, domPresenter());
  const rewards = battleRewards(result, enemies);
  await showBattleResult(result, rewards, enemies);
}

async function showBattleResult(result, rewards, enemies) {
  const ov = $('#battle-overlay');
  if (!ov) return;
  const panel = el('div', 'panel result-panel');
  const title = result === 'win' ? '🏆 VICTORY!' : result === 'loss' ? '💔 DEFEAT…' : '🤝 DRAW';
  panel.appendChild(el('div', 'result-title ' + result, title));
  if (result === 'win') {
    sfx('reward');
    const list = el('div', 'loot-list');
    for (const [m, q] of Object.entries(rewards.materials)) {
      const row = el('div', 'loot-line');
      row.appendChild(matIcon(m, 2));
      row.appendChild(el('span', '', `+${q} ${MATERIALS[m].name}`));
      list.appendChild(row);
    }
    if (rewards.orb) {
      const row = el('div', 'loot-line');
      const ic = iconCanvas('orb', '#ff5a5a', 2); ic.className = 'pix';
      row.appendChild(ic);
      row.appendChild(el('span', '', '+1 Capture Orb!'));
      list.appendChild(row);
    }
    if (rewards.chest) {
      const row = el('div', 'loot-line');
      const ic = iconCanvas('chest', CHESTS[rewards.chest].color, 2); ic.className = 'pix';
      row.appendChild(ic);
      row.appendChild(el('span', '', CHESTS[rewards.chest].name + ' acquired!'));
      list.appendChild(row);
    }
    panel.appendChild(list);
  } else if (result === 'loss') {
    panel.appendChild(el('div', 'card-body center', 'Lost a life… ' + State.run.lives + ' ♥ remaining'));
  } else {
    panel.appendChild(el('div', 'card-body center', 'Both teams fainted. No trophy, no loss.'));
  }

  const btn = el('button', 'btn btn-primary', result === 'win' ? 'CATCH PHASE ▶' : 'CONTINUE ▶');
  btn.onclick = async () => {
    sfx('tap');
    panel.remove();
    if (result === 'win' && rewards.catchable.length) {
      await catchPhase(rewards.catchable);
    }
    finishBattlePhase();
  };
  panel.appendChild(btn);
  ov.appendChild(panel);
}

/* ---------------- catch phase ---------------- */

function catchPhase(speciesIds) {
  return new Promise(resolve => {
    const ov = $('#battle-overlay');
    if (!ov) return resolve();
    const targets = [...new Set(speciesIds)];
    let fled = new Set();
    let caught = false;

    const panel = el('div', 'panel result-panel catch-panel');
    render();
    ov.appendChild(panel);

    function render() {
      clear(panel);
      panel.appendChild(el('div', 'result-title', '🎯 CATCH PHASE'));
      const orbInfo = el('div', 'card-body center',
        `Orbs: <b class="accent">${State.profile.orbs}</b> • Great: <b class="accent">${State.profile.greatOrbs}</b>`);
      panel.appendChild(orbInfo);

      if (caught) {
        panel.appendChild(el('div', 'card-body center good-text', 'Catch successful! The rest of the wild squad scattered.'));
      } else if (State.profile.orbs + State.profile.greatOrbs === 0) {
        panel.appendChild(el('div', 'card-body center', 'No orbs left! Craft more with essence in the CRAFT tab.'));
      } else {
        panel.appendChild(el('div', 'card-body center', 'Choose a defeated monster to catch:'));
        const row = el('div', 'catch-row');
        for (const id of targets) {
          const sp = SPECIES_BY_ID[id];
          const isFled = fled.has(id);
          const cell = el('div', 'catch-cell' + (isFled ? ' fled' : ''));
          const c = spriteCanvas(id, 3);
          c.className = 'pix';
          cell.appendChild(c);
          cell.appendChild(el('div', 'slot-name', sp.name));
          cell.appendChild(el('div', 'hint', isFled ? 'FLED!' : (isUnlocked(id) ? '★ dupe' : 'NEW!')));
          if (!isFled) cell.onclick = () => pickOrb(sp);
          row.appendChild(cell);
        }
        panel.appendChild(row);
      }

      const done = el('button', 'btn', caught || State.profile.orbs + State.profile.greatOrbs === 0 || fled.size >= targets.length ? 'CONTINUE ▶' : 'SKIP CATCHING');
      done.onclick = () => { panel.remove(); resolve(); };
      panel.appendChild(done);
    }

    function pickOrb(sp) {
      sfx('tap');
      const b = el('div', 'center');
      const c = spriteCanvas(sp.id, 4);
      c.className = 'pix';
      b.appendChild(c);
      b.appendChild(el('div', 'card-title', 'CATCH ' + sp.name.toUpperCase() + '?'));
      const btns = el('div', 'btn-row wrap');
      if (State.profile.orbs > 0) {
        const o = el('button', 'btn btn-primary', `ORB (${Math.round(catchChance(sp.id, 'orb') * 100)}%)`);
        o.onclick = () => { closeModal(); throwOrb(sp, 'orb'); };
        btns.appendChild(o);
      }
      if (State.profile.greatOrbs > 0) {
        const g = el('button', 'btn btn-gold', `GREAT ORB (${Math.round(catchChance(sp.id, 'greatOrb') * 100)}%)`);
        g.onclick = () => { closeModal(); throwOrb(sp, 'greatOrb'); };
        btns.appendChild(g);
      }
      b.appendChild(btns);
      showModal(b);
    }

    async function throwOrb(sp, orbKind) {
      const res = attemptCatch(sp.id, orbKind);
      if (!res) return;
      // little suspense animation
      const b = el('div', 'center');
      const orb = iconCanvas('orb', orbKind === 'orb' ? '#ff5a5a' : '#7ad9ff', 5);
      orb.className = 'pix orb-shake';
      b.appendChild(orb);
      b.appendChild(el('div', 'card-title', '...'));
      const modal = showModal(b, { closable: false });
      sfx('throw');
      await new Promise(r => setTimeout(r, 1300));
      modal.remove();

      if (res.success) {
        caught = true;
        sfx('catch');
        const w = el('div', 'center');
        const c = spriteCanvas(sp.id, 6);
        c.className = 'pix pop-in';
        w.appendChild(c);
        w.appendChild(el('div', 'card-title good-text', `GOTCHA! ${sp.name} was caught!`));
        w.appendChild(el('div', 'card-body', res.first
          ? '<b class="accent">NEW SPECIES!</b> Now available in your expedition shop.'
          : '+1 ★ — permanent stat bonus for ' + sp.name + '. Bonus shards added!'));
        const ok = el('button', 'btn btn-primary', 'NICE!');
        ok.onclick = () => { closeModal(); render(); };
        w.appendChild(ok);
        showModal(w, { closable: false });
      } else {
        sfx('fail');
        if (Math.random() < 0.5) fled.add(sp.id);
        const w = el('div', 'center');
        w.appendChild(el('div', 'card-title', 'Oh no! It broke free!'));
        w.appendChild(el('div', 'card-body', fled.has(sp.id) ? sp.name + ' fled into the wild…' : sp.name + ' is still catchable!'));
        const ok = el('button', 'btn', 'DARN');
        ok.onclick = () => { closeModal(); render(); };
        w.appendChild(ok);
        showModal(w, { closable: false });
      }
    }
  });
}

/* ---------------- end of battle / run ---------------- */

function finishBattlePhase() {
  closeBattleOverlay();
  const over = runOver();
  if (over === 'won') {
    const rewards = endRun(true);
    runEndModal(true, rewards);
  } else if (over === 'lost') {
    const rewards = endRun(false);
    runEndModal(false, rewards);
  } else {
    advanceTurn();
    renderAll();
  }
}

function runEndModal(won, rewards) {
  renderAll();
  const b = el('div', 'center');
  b.appendChild(el('div', 'result-title ' + (won ? 'win' : 'loss'), won ? '👑 EXPEDITION COMPLETE!' : 'EXPEDITION OVER'));
  const list = el('div', 'loot-list');
  const line = (iconEl, text) => {
    const row = el('div', 'loot-line');
    iconEl.className = 'pix';
    row.appendChild(iconEl);
    row.appendChild(el('span', '', text));
    list.appendChild(row);
  };
  line(iconCanvas('pearl', '#e8e6ff', 2), `+${rewards.essence} essence`);
  if (rewards.chest) line(iconCanvas('chest', CHESTS[rewards.chest].color, 2), CHESTS[rewards.chest].name + '!');
  if (rewards.egg) line(iconCanvas('egg', EGGS[rewards.egg].color, 2), EGGS[rewards.egg].name + '!');
  b.appendChild(list);
  if (won) b.appendChild(el('div', 'card-body', 'The arena crowd roars! Check the LOOT tab for your prizes.'));
  else b.appendChild(el('div', 'card-body', 'Catch more species and craft items to push further next time!'));
  const ok = el('button', 'btn btn-primary', 'HOME');
  ok.onclick = () => { closeModal(); switchTab('home'); };
  b.appendChild(ok);
  showModal(b, { closable: false });
  if (won) sfx('victory');
}
