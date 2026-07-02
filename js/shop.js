/* =========================================================
   AUTOMON ARENA — expedition (run) logic: shop, merging,
   enemy generation, rewards
   ========================================================= */
'use strict';

/* ---------------- run lifecycle ---------------- */

function startRun() {
  State.run = {
    turn: 1,
    gold: RUN.goldPerTurn,
    lives: RUN.lives,
    trophies: 0,
    streak: 0,
    team: [null, null, null, null, null],
    shop: [],
    caughtThisRun: 0,
  };
  rollShop(true);
  State.profile.runsPlayed++;
  save();
}

function endRun(won) {
  const rewards = { chest: null, egg: null, essence: 0 };
  if (won) {
    State.profile.runsWon++;
    rewards.essence = 15;
    if (State.profile.chests.length < MAX_CHESTS) { addChest('gold'); rewards.chest = 'gold'; }
    if (State.profile.eggs.length < MAX_EGGS) { addEgg('rare'); rewards.egg = 'rare'; }
  } else {
    rewards.essence = 4 + State.run.trophies;
  }
  addMaterial('essence', rewards.essence);
  if (State.run.trophies > State.profile.bestTrophies) State.profile.bestTrophies = State.run.trophies;
  State.run = null;
  save();
  return rewards;
}

/* ---------------- shop ---------------- */

// Player's shop only offers species they have caught (tier 1 starts unlocked).
function shopPool() {
  const maxTier = RUN.tierForTurn(State.run.turn);
  return SPECIES.filter(s => s.tier <= maxTier && isUnlocked(s.id));
}

function rollSpecies(pool) {
  // Weight toward the highest available tier without starving low tiers.
  const maxTier = Math.max(...pool.map(s => s.tier));
  const weight = s => (s.tier === maxTier ? 3 : s.tier === maxTier - 1 ? 2 : 1);
  const total = pool.reduce((t, s) => t + weight(s), 0);
  let roll = Math.random() * total;
  for (const s of pool) {
    roll -= weight(s);
    if (roll <= 0) return s;
  }
  return pool[pool.length - 1];
}

function rollShop(free = false) {
  const run = State.run;
  if (!free) {
    if (run.gold < RUN.rerollCost) return false;
    run.gold -= RUN.rerollCost;
  }
  const pool = shopPool();
  const kept = run.shop.filter(s => s && s.frozen);
  run.shop = [];
  for (let i = 0; i < RUN.shopSize; i++) {
    if (kept[i]) run.shop.push(kept[i]);
    else run.shop.push({ speciesId: rollSpecies(pool).id, frozen: false });
  }
  save();
  return true;
}

function toggleFreeze(shopIdx) {
  const slot = State.run.shop[shopIdx];
  if (slot) { slot.frozen = !slot.frozen; save(); }
}

// Buy shop slot -> team slot. Merges if same species occupies target.
function buyToSlot(shopIdx, teamIdx) {
  const run = State.run;
  const slot = run.shop[shopIdx];
  if (!slot || run.gold < RUN.buyCost) return { ok: false, reason: run.gold < RUN.buyCost ? 'Not enough gold!' : 'Empty slot' };
  const target = run.team[teamIdx];
  if (target && target.speciesId !== slot.speciesId) return { ok: false, reason: 'Slot taken' };
  if (target) {
    if (target.xp >= 6) return { ok: false, reason: 'Max level!' };
    target.xp = Math.min(6, target.xp + 1);
  } else {
    run.team[teamIdx] = newUnit(slot.speciesId);
  }
  run.gold -= RUN.buyCost;
  run.shop[shopIdx] = null;
  save();
  return { ok: true, merged: !!target };
}

// First free team slot, or a merge target for the species, else -1.
function bestSlotFor(speciesId) {
  const run = State.run;
  for (let i = 0; i < run.team.length; i++) {
    const u = run.team[i];
    if (u && u.speciesId === speciesId && u.xp < 6) return i;
  }
  for (let i = 0; i < run.team.length; i++) if (!run.team[i]) return i;
  return -1;
}

function sellUnit(teamIdx) {
  const run = State.run;
  const unit = run.team[teamIdx];
  if (!unit) return false;
  if (unit.item) grantItem(unit.item); // held item returns to inventory
  run.gold += RUN.sellValue * unitLevel(unit);
  run.team[teamIdx] = null;
  save();
  return true;
}

// Move / merge units inside the team.
function moveUnit(fromIdx, toIdx) {
  const run = State.run;
  if (fromIdx === toIdx) return;
  const a = run.team[fromIdx];
  if (!a) return;
  const b = run.team[toIdx];
  if (b && b.speciesId === a.speciesId && (a.xp < 6 || b.xp < 6)) {
    // merge: combined xp, keep target's item; extra item back to inventory
    b.xp = Math.min(6, a.xp + b.xp);
    if (a.item) { if (!b.item) b.item = a.item; else grantItem(a.item); }
    run.team[fromIdx] = null;
  } else {
    run.team[fromIdx] = b;
    run.team[toIdx] = a;
  }
  save();
}

function equipItem(teamIdx, itemId) {
  const run = State.run;
  const unit = run.team[teamIdx];
  if (!unit || (State.profile.items[itemId] || 0) <= 0) return false;
  if (unit.item) grantItem(unit.item);
  State.profile.items[itemId]--;
  if (State.profile.items[itemId] <= 0) delete State.profile.items[itemId];
  unit.item = itemId;
  save();
  return true;
}

function unequipItem(teamIdx) {
  const unit = State.run.team[teamIdx];
  if (!unit || !unit.item) return false;
  grantItem(unit.item);
  unit.item = null;
  save();
  return true;
}

function teamUnits() {
  return State.run.team.filter(Boolean);
}

/* ---------------- enemy generation ---------------- */

// Enemies draw from ALL species (including ones you haven't caught yet —
// beat them, then catch them to unlock them in your shop).
function generateEnemyTeam(turn) {
  const maxTier = RUN.tierForTurn(turn);
  const pool = SPECIES.filter(s => s.tier <= maxTier);
  const count = Math.min(5, 1 + Math.ceil(turn / 2.5)); // 2,2,3,3,3,4,4,4,5...
  const team = [];
  // Higher turns roll higher tiers & levels — but stay slightly below
  // expected player power so a well-built team is favored.
  for (let i = 0; i < count; i++) {
    const tierBias = Math.random() < Math.min(0.5, 0.05 + turn * 0.04) ? maxTier : Math.max(1, maxTier - 1 - (Math.random() < 0.4 ? 1 : 0));
    const options = pool.filter(s => s.tier === Math.min(tierBias, maxTier));
    const sp = options[Math.floor(Math.random() * options.length)] || pool[0];
    let xp = 1;
    if (turn >= 6 && Math.random() < 0.25) xp = 3;      // level 2
    if (turn >= 10 && Math.random() < 0.2) xp = 6;      // level 3
    const unit = newUnit(sp.id);
    unit.xp = xp;
    // High-turn enemies sometimes hold items.
    if (turn >= 7 && Math.random() < 0.2) {
      const ids = Object.keys(ITEMS);
      unit.item = ids[Math.floor(Math.random() * ids.length)];
    }
    // Enemy stats ignore player-only collection bonuses.
    const lvl = xp >= 6 ? 3 : xp >= 3 ? 2 : 1;
    let atk = Math.round(sp.atk * (1 + 0.5 * (lvl - 1)));
    let hp = Math.round(sp.hp * (1 + 0.5 * (lvl - 1)));
    if (unit.item === 'powerRing') atk += 2;
    if (unit.item === 'heartAmulet') hp += 4;
    unit.presetStats = { atk: Math.max(1, atk), hp: Math.max(1, hp) };
    unit.level = lvl;
    team.push(unit);
  }
  return team;
}

/* ---------------- post-battle rewards ---------------- */

function battleRewards(result, enemyTeam) {
  const run = State.run;
  const out = { materials: {}, chest: null, catchable: [], orb: false };
  for (const e of enemyTeam) markSeen(e.speciesId);

  if (result === 'win') {
    run.trophies++;
    run.streak++;
    // Material drops from the defeated team's types.
    const drops = 2 + Math.floor(Math.random() * 2) + (run.streak >= 3 ? 1 : 0);
    for (let i = 0; i < drops; i++) {
      const e = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
      const sp = SPECIES_BY_ID[e.speciesId];
      const mat = SHARD_BY_TYPE[sp.type];
      out.materials[mat] = (out.materials[mat] || 0) + 1;
    }
    out.materials.essence = (out.materials.essence || 0) + 1 + Math.floor(run.turn / 3);
    for (const [m, q] of Object.entries(out.materials)) addMaterial(m, q);

    // Occasional orb drop keeps catching flowing.
    if (Math.random() < 0.3) {
      State.profile.orbs++;
      out.orb = true;
    }

    // Chest drops.
    if (State.profile.chests.length < MAX_CHESTS) {
      if (run.trophies > 0 && run.trophies % 3 === 0) { addChest('silver'); out.chest = 'silver'; }
      else if (Math.random() < 0.45) { addChest('wood'); out.chest = 'wood'; }
    }

    // Catch phase: pick one defeated enemy to throw an orb at.
    out.catchable = enemyTeam.map(e => e.speciesId);
  } else if (result === 'loss') {
    run.lives--;
    run.streak = 0;
  } else {
    run.streak = 0;
  }
  save();
  return out;
}

function advanceTurn() {
  const run = State.run;
  run.turn++;
  run.gold = RUN.goldPerTurn + Math.min(3, Math.floor(run.streak / 2));
  rollShop(true);
  save();
}

function runOver() {
  const run = State.run;
  if (!run) return null;
  if (run.trophies >= RUN.trophiesToWin) return 'won';
  if (run.lives <= 0) return 'lost';
  return null;
}
