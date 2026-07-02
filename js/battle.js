/* =========================================================
   AUTOMON ARENA — battle engine
   Live async simulation; all visuals go through a presenter
   object so the sim can also run headless.
   ========================================================= */
'use strict';

const MAX_ROUNDS = 40;
const FATIGUE_START = 12; // after this round, escalating chip damage ends stalls
const ONHURT_CAP = 4;     // per unit per battle, prevents proc ping-pong

// Small seeded PRNG so a battle replays identically after a reload.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a battle-ready fighter from a roster unit.
// `meta` = true applies collection stars & held items (player side);
// enemy units pass their own pre-built stats.
function makeFighter(unit, side, pos) {
  const sp = SPECIES_BY_ID[unit.speciesId];
  const stats = unit.presetStats || unitStats(unit);
  const level = unit.presetStats ? (unit.level || 1) : stats.level;
  let chargeMax = sp.move.charge;
  if (unit.item === 'voltCoil') chargeMax = Math.max(1, chargeMax - 1);
  return {
    uid: unit.uid, speciesId: sp.id, name: sp.name, type: sp.type, sp,
    side, pos, level,
    atk: stats.atk, hp: stats.hp, maxHp: stats.hp,
    shield: 0, burn: 0, charge: 0, chargeMax,
    item: unit.item || null,
    gritUsed: false, honeyUsed: false, onHurtProcs: 0,
    alive: true,
  };
}

function movePower(fighter) {
  return Math.max(1, Math.round(fighter.sp.move.pow * (1 + 0.5 * (fighter.level - 1))));
}
function passivePower(fighter) {
  return Math.max(1, Math.round(fighter.sp.passive.pow * (1 + 0.5 * (fighter.level - 1))));
}

/* ---------------- battle ---------------- */

// playerTeam / enemyTeam: arrays of roster units (front first).
// presenter: async visual hooks (see ui.js). Returns 'win' | 'loss' | 'draw'.
async function runBattle(playerTeam, enemyTeam, presenter, rng = Math.random) {
  const P = presenter;
  const allies = playerTeam.map((u, i) => makeFighter(u, 'ally', i));
  const foes = enemyTeam.map((u, i) => makeFighter(u, 'foe', i));

  const sideOf = f => (f.side === 'ally' ? allies : foes);
  const oppOf = f => (f.side === 'ally' ? foes : allies);
  const living = arr => arr.filter(f => f.alive);

  await P.setup(allies, foes);

  /* ---- effect helpers ---- */

  async function dealDamage(target, amount, source, { isMove = false, typed = true } = {}) {
    if (!target.alive || amount <= 0) return;
    let mult = 1;
    if (typed && source) mult = typeMultiplier(source.type, target.type);
    let dmg = Math.max(1, Math.round(amount * mult));
    const kind = mult > 1 ? 'super' : mult < 1 ? 'weak' : 'normal';

    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, dmg);
      target.shield -= absorbed;
      dmg -= absorbed;
      await P.shieldHit(target, absorbed);
    }
    if (dmg > 0) {
      target.hp -= dmg;
      if (target.hp <= 0 && target.item === 'gritBand' && !target.gritUsed) {
        target.gritUsed = true;
        target.hp = 1;
        await P.itemProc(target, 'gritBand', 'Grit Band! Hangs on!');
      }
      await P.damage(target, dmg, kind, isMove);
      if (target.hp > 0) {
        if (target.item === 'honeyDrop' && !target.honeyUsed && target.hp <= target.maxHp / 2) {
          target.honeyUsed = true;
          target.hp = Math.min(target.maxHp, target.hp + 5);
          await P.itemProc(target, 'honeyDrop', 'Honey Drop! +5 HP');
          await P.refresh(target);
        }
        // onHurt passive
        if (target.sp.passive.trigger === 'onHurt' && target.onHurtProcs < ONHURT_CAP) {
          target.onHurtProcs++;
          await firePassive(target);
        }
      }
    }
    if (target.hp <= 0 && target.alive) {
      await faint(target, source);
    }
  }

  async function faint(f, killer) {
    f.alive = false;
    f.hp = 0;
    await P.faint(f);
    if (killer && killer.alive && killer.sp.passive.trigger === 'onKill') {
      await firePassive(killer);
    }
    // held item: wisp lantern
    if (f.item === 'wispLantern') {
      const front = living(oppOf(f))[0];
      if (front) {
        await P.itemProc(f, 'wispLantern', 'Wisp Lantern flares!');
        await dealDamage(front, 5, null, { typed: false });
      }
    }
    if (f.sp.passive.trigger === 'onFaint') {
      await firePassive(f);
    }
    for (const ally of living(sideOf(f))) {
      if (ally.sp.passive.trigger === 'onAllyFaint') {
        await firePassive(ally);
      }
    }
  }

  async function applyEffect(actor, effect, amount, { isMove = false } = {}) {
    const foesArr = living(oppOf(actor));
    const mates = living(sideOf(actor));
    const behind = mates[mates.indexOf(actor) + 1];
    switch (effect) {
      case 'dmgFront':
        if (foesArr[0]) await dealDamage(foesArr[0], amount, actor, { isMove });
        break;
      case 'dmgBack':
        if (foesArr.length) await dealDamage(foesArr[foesArr.length - 1], amount, actor, { isMove });
        break;
      case 'dmgRandom': {
        const t = foesArr[Math.floor(rng() * foesArr.length)];
        if (t) await dealDamage(t, amount, actor, { isMove });
        break;
      }
      case 'dmgAll':
        for (const t of [...foesArr]) await dealDamage(t, amount, actor, { isMove });
        break;
      case 'burnFront':
        if (foesArr[0]) {
          await dealDamage(foesArr[0], amount, actor, { isMove });
          if (foesArr[0].alive) { foesArr[0].burn = 3; await P.burned(foesArr[0]); }
        }
        break;
      case 'burnAll':
        for (const t of [...foesArr]) {
          await dealDamage(t, amount, actor, { isMove });
          if (t.alive) { t.burn = 3; await P.burned(t); }
        }
        break;
      case 'healSelf':
        actor.hp = Math.min(actor.maxHp, actor.hp + amount);
        await P.heal(actor, amount);
        break;
      case 'healAll':
        for (const m of mates) { m.hp = Math.min(m.maxHp, m.hp + amount); await P.heal(m, amount); }
        break;
      case 'healBehind':
        if (behind) { behind.hp = Math.min(behind.maxHp, behind.hp + amount); await P.heal(behind, amount); }
        break;
      case 'buffAtkSelf':
        actor.atk += amount; await P.buff(actor, 'ATK', amount);
        break;
      case 'buffAtkAll':
        for (const m of mates) { m.atk += amount; await P.buff(m, 'ATK', amount); }
        break;
      case 'buffAtkBehind':
        if (behind) { behind.atk += amount; await P.buff(behind, 'ATK', amount); }
        break;
      case 'buffHpAll':
        for (const m of mates) { m.hp += amount; m.maxHp += amount; await P.buff(m, 'HP', amount); }
        break;
      case 'buffHpBehind':
        if (behind) { behind.hp += amount; behind.maxHp += amount; await P.buff(behind, 'HP', amount); }
        break;
      case 'shieldSelf':
        actor.shield += amount; await P.shielded(actor, amount);
        break;
      case 'shieldAll':
        for (const m of mates) { m.shield += amount; await P.shielded(m, amount); }
        break;
      default:
        break;
    }
  }

  async function firePassive(f) {
    await P.passiveBanner(f, f.sp.passive.name);
    await applyEffect(f, f.sp.passive.effect, passivePower(f));
  }

  async function useMove(f) {
    await P.moveBanner(f, f.sp.move.name);
    await applyEffect(f, f.sp.move.effect, movePower(f), { isMove: true });
  }

  /* ---- battle start passives (alternating front to back) ---- */
  const startOrder = [];
  const maxLen = Math.max(allies.length, foes.length);
  for (let i = 0; i < maxLen; i++) {
    if (allies[i]) startOrder.push(allies[i]);
    if (foes[i]) startOrder.push(foes[i]);
  }
  for (const f of startOrder) {
    if (!f.alive) continue;
    if (f.item === 'tidePearl') {
      f.shield += 5;
      await P.itemProc(f, 'tidePearl', 'Tide Pearl shield!');
      await P.shielded(f, 5);
    }
    if (f.sp.passive.trigger === 'battleStart') await firePassive(f);
  }

  /* ---- clash loop ---- */
  let round = 0;
  while (living(allies).length && living(foes).length && round < MAX_ROUNDS) {
    round++;
    await P.roundStart(round);

    // Fatigue: long battles wear the front liners down until someone drops.
    if (round > FATIGUE_START) {
      const fatigue = round - FATIGUE_START;
      const fa = living(allies)[0], ff = living(foes)[0];
      if (fa) await dealDamage(fa, fatigue, null, { typed: false });
      if (ff) await dealDamage(ff, fatigue, null, { typed: false });
      if (!living(allies).length || !living(foes).length) break;
    }

    // Burn ticks
    for (const f of [...living(allies), ...living(foes)]) {
      if (f.burn > 0) {
        f.burn--;
        await P.burnTick(f);
        await dealDamage(f, 2, null, { typed: false });
      }
    }
    if (!living(allies).length || !living(foes).length) break;

    // everyClash passives
    for (const f of [...living(allies), ...living(foes)]) {
      if (f.sp.passive.trigger === 'everyClash') await firePassive(f);
    }

    const a = living(allies)[0];
    const b = living(foes)[0];
    if (!a || !b) break;

    a.charge++;
    b.charge++;
    const aMove = a.charge >= a.chargeMax;
    const bMove = b.charge >= b.chargeMax;
    if (aMove) a.charge = 0;
    if (bMove) b.charge = 0;

    await P.clash(a, b);

    // Simultaneous strikes: compute both before applying.
    const aAlive = a.alive, bAlive = b.alive;
    if (aAlive) {
      if (aMove) await useMove(a);
      else {
        await dealDamage(b, a.atk, a);
        if (a.item === 'emberCharm' && b.alive) { b.burn = 3; await P.burned(b); }
      }
    }
    if (bAlive) {
      if (bMove) await useMove(b);
      else if (b.alive || true) { // fainted attackers still land their simultaneous hit
        await dealDamage(a, b.atk, b);
        if (b.item === 'emberCharm' && a.alive) { a.burn = 3; await P.burned(a); }
      }
    }
    await P.clashEnd();
  }

  const pAlive = living(allies).length;
  const eAlive = living(foes).length;
  const result = pAlive && !eAlive ? 'win' : eAlive && !pAlive ? 'loss' : pAlive && eAlive ? 'draw' : 'draw';
  await P.finish(result);
  return result;
}

/* ---------------- headless presenter (for tests) ---------------- */
function headlessPresenter() {
  const noop = async () => {};
  return {
    setup: noop, clash: noop, clashEnd: noop, roundStart: noop,
    damage: noop, heal: noop, buff: noop, shielded: noop, shieldHit: noop,
    burned: noop, burnTick: noop, faint: noop, refresh: noop,
    moveBanner: noop, passiveBanner: noop, itemProc: noop, finish: noop,
  };
}
