/* =========================================================
   AUTOMON ARENA — persistent state, save/load, meta systems
   ========================================================= */
'use strict';

const SAVE_KEY = 'automon_save_v1';

const State = {
  profile: null,
  run: null, // active expedition or null
};

/* ---------------- profile ---------------- */

function newProfile() {
  const now = Date.now();
  const collection = {};
  for (const s of SPECIES) {
    collection[s.id] = { caught: s.tier === 1 ? 1 : 0, seen: s.tier === 1 };
  }
  return {
    version: 1,
    created: now,
    bestTrophies: 0,
    runsWon: 0,
    runsPlayed: 0,
    totalCatches: 0,
    collection,
    materials: { essence: 12, emberShard: 0, dewShard: 0, leafShard: 0, voltShard: 0, stoneShard: 0, wispShard: 0 },
    orbs: 3,
    greatOrbs: 0,
    items: {},            // itemId -> count (unequipped inventory)
    eggs: [],             // { kind, startedAt }
    chests: [{ kind: 'wood', startedAt: null }], // starter chest
    idleClaimedAt: now,
    muted: false,
  };
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ profile: State.profile, run: State.run }));
  } catch (e) { /* storage full / private mode: play on without saving */ }
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.profile) {
        State.profile = data.profile;
        State.run = data.run || null;
        // Forward-compat: fill any fields added after the save was written.
        const fresh = newProfile();
        for (const k of Object.keys(fresh)) {
          if (State.profile[k] === undefined) State.profile[k] = fresh[k];
        }
        for (const s of SPECIES) {
          if (!State.profile.collection[s.id]) {
            State.profile.collection[s.id] = { caught: s.tier === 1 ? 1 : 0, seen: s.tier === 1 };
          }
        }
        for (const m of Object.keys(fresh.materials)) {
          if (State.profile.materials[m] === undefined) State.profile.materials[m] = 0;
        }
        return;
      }
    }
  } catch (e) { /* corrupted save: start fresh */ }
  State.profile = newProfile();
  State.run = null;
  save();
}

function wipeSave() {
  localStorage.removeItem(SAVE_KEY);
  State.profile = newProfile();
  State.run = null;
  save();
}

/* ---------------- collection ---------------- */

function isUnlocked(speciesId) {
  return (State.profile.collection[speciesId]?.caught || 0) > 0;
}
function stars(speciesId) {
  return Math.min(5, State.profile.collection[speciesId]?.caught || 0);
}
function uniqueCaught() {
  return Object.values(State.profile.collection).filter(c => c.caught > 0).length;
}
function markSeen(speciesId) {
  const c = State.profile.collection[speciesId];
  if (c && !c.seen) { c.seen = true; save(); }
}
function registerCatch(speciesId) {
  const c = State.profile.collection[speciesId];
  const first = c.caught === 0;
  c.caught++;
  c.seen = true;
  State.profile.totalCatches++;
  if (!first) {
    // Duplicate catches grant that species' shard + essence.
    const sp = SPECIES_BY_ID[speciesId];
    addMaterial(SHARD_BY_TYPE[sp.type], 2 + sp.tier);
    addMaterial('essence', sp.tier * 2);
  }
  save();
  return first;
}

/* ---------------- units & stats ---------------- */

let uidCounter = 1;
function newUnit(speciesId) {
  return { uid: 'u' + (uidCounter++) + '_' + Math.floor(Math.random() * 1e6), speciesId, xp: 1, item: null };
}

function unitLevel(unit) {
  return unit.xp >= 6 ? 3 : unit.xp >= 3 ? 2 : 1;
}
// xp needed for next level, or null at max
function unitXpProgress(unit) {
  const lvl = unitLevel(unit);
  if (lvl === 3) return null;
  return lvl === 1 ? { have: unit.xp, need: 3 } : { have: unit.xp, need: 6 };
}

// Effective battle stats: base * level scaling * collection stars + items.
function unitStats(unit) {
  const sp = SPECIES_BY_ID[unit.speciesId];
  const lvl = unitLevel(unit);
  const starBonus = 1 + 0.05 * stars(unit.speciesId);
  let atk = Math.round(sp.atk * (1 + 0.5 * (lvl - 1)) * starBonus);
  let hp  = Math.round(sp.hp  * (1 + 0.5 * (lvl - 1)) * starBonus);
  if (unit.item === 'powerRing') atk += 2;
  if (unit.item === 'heartAmulet') hp += 4;
  return { atk: Math.max(1, atk), hp: Math.max(1, hp), level: lvl };
}

/* ---------------- materials / items / orbs ---------------- */

function addMaterial(id, qty) {
  State.profile.materials[id] = (State.profile.materials[id] || 0) + qty;
}
function canAfford(cost) {
  return Object.entries(cost).every(([m, q]) => (State.profile.materials[m] || 0) >= q);
}
function craft(recipe) {
  if (!canAfford(recipe.cost)) return false;
  for (const [m, q] of Object.entries(recipe.cost)) State.profile.materials[m] -= q;
  if (recipe.out.orb) State.profile.orbs += recipe.out.orb;
  else if (recipe.out.greatOrb) State.profile.greatOrbs += recipe.out.greatOrb;
  else if (recipe.out.item) State.profile.items[recipe.out.item] = (State.profile.items[recipe.out.item] || 0) + 1;
  save();
  return true;
}
function grantItem(itemId, qty = 1) {
  State.profile.items[itemId] = (State.profile.items[itemId] || 0) + qty;
}

/* ---------------- eggs ---------------- */

const MAX_EGGS = 3;

function eggReadyAt(egg) { return egg.startedAt + EGGS[egg.kind].mins * 60000; }
function eggReady(egg) { return Date.now() >= eggReadyAt(egg); }

function addEgg(kind) {
  if (State.profile.eggs.length >= MAX_EGGS) return false;
  State.profile.eggs.push({ kind, startedAt: Date.now() });
  save();
  return true;
}

function hatchEgg(index, rng = Math.random) {
  const egg = State.profile.eggs[index];
  if (!egg || !eggReady(egg)) return null;
  State.profile.eggs.splice(index, 1);
  const w = EGGS[egg.kind].tierW;
  const roll = rng() * (w[0] + w[1] + w[2]);
  const tier = roll < w[0] ? 1 : roll < w[0] + w[1] ? 2 : 3;
  const pool = SPECIES.filter(s => s.tier === tier);
  const sp = pool[Math.floor(rng() * pool.length)];
  const first = registerCatch(sp.id);
  const essence = 2 + tier * 2;
  addMaterial('essence', essence);
  save();
  return { species: sp, first, essence };
}

/* ---------------- chests ---------------- */

const MAX_CHESTS = 4;

function chestReadyAt(chest) { return chest.startedAt + CHESTS[chest.kind].mins * 60000; }
function chestReady(chest) { return chest.startedAt !== null && Date.now() >= chestReadyAt(chest); }
function chestUnlocking(chest) { return chest.startedAt !== null && !chestReady(chest); }

function addChest(kind) {
  if (State.profile.chests.length >= MAX_CHESTS) return false;
  State.profile.chests.push({ kind, startedAt: null });
  save();
  return true;
}
function startChest(index) {
  const c = State.profile.chests[index];
  if (!c || c.startedAt !== null) return false;
  // Only one chest unlocks at a time (tap another after this one opens).
  if (State.profile.chests.some(chestUnlocking)) return false;
  c.startedAt = Date.now();
  save();
  return true;
}

function openChest(index, rng = Math.random) {
  const chest = State.profile.chests[index];
  if (!chest || !chestReady(chest)) return null;
  State.profile.chests.splice(index, 1);
  const kind = chest.kind;
  const loot = { materials: {}, orbs: 0, greatOrbs: 0, items: [], egg: null };
  const shardIds = Object.keys(MATERIALS).filter(m => m !== 'essence');
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const addM = (id, q) => { loot.materials[id] = (loot.materials[id] || 0) + q; };

  if (kind === 'wood') {
    addM('essence', 4 + Math.floor(rng() * 5));
    addM(pick(shardIds), 2 + Math.floor(rng() * 3));
    if (rng() < 0.35) loot.orbs = 1;
  } else if (kind === 'silver') {
    addM('essence', 10 + Math.floor(rng() * 8));
    addM(pick(shardIds), 4 + Math.floor(rng() * 4));
    addM(pick(shardIds), 3 + Math.floor(rng() * 3));
    loot.orbs = 1 + (rng() < 0.5 ? 1 : 0);
    if (rng() < 0.3) loot.items.push(pick(Object.keys(ITEMS)));
    if (rng() < 0.25 && State.profile.eggs.length < MAX_EGGS) loot.egg = 'common';
  } else { // gold
    addM('essence', 22 + Math.floor(rng() * 12));
    addM(pick(shardIds), 6 + Math.floor(rng() * 5));
    addM(pick(shardIds), 6 + Math.floor(rng() * 5));
    loot.orbs = 2;
    loot.greatOrbs = rng() < 0.5 ? 1 : 0;
    loot.items.push(pick(Object.keys(ITEMS)));
    if (rng() < 0.5 && State.profile.eggs.length < MAX_EGGS) loot.egg = rng() < 0.3 ? 'epic' : 'rare';
  }

  for (const [m, q] of Object.entries(loot.materials)) addMaterial(m, q);
  State.profile.orbs += loot.orbs;
  State.profile.greatOrbs += loot.greatOrbs;
  for (const it of loot.items) grantItem(it);
  if (loot.egg) State.profile.eggs.push({ kind: loot.egg, startedAt: Date.now() });
  save();
  return loot;
}

/* ---------------- idle training ---------------- */

function idleRatePerHour() {
  return IDLE.basePerHour + IDLE.perSpecies * uniqueCaught();
}
function idlePending() {
  const hours = Math.min(IDLE.capHours, (Date.now() - State.profile.idleClaimedAt) / 3600000);
  return Math.floor(hours * idleRatePerHour());
}
function idleCapped() {
  return (Date.now() - State.profile.idleClaimedAt) / 3600000 >= IDLE.capHours;
}
function claimIdle() {
  const amount = idlePending();
  if (amount <= 0) return 0;
  addMaterial('essence', amount);
  State.profile.idleClaimedAt = Date.now();
  save();
  return amount;
}

/* ---------------- catching ---------------- */

function catchChance(speciesId, orbKind) {
  const tier = SPECIES_BY_ID[speciesId].tier;
  return CATCH[orbKind][tier];
}

// Attempt a catch. Consumes the orb. Returns {success, first} or null if no orb.
function attemptCatch(speciesId, orbKind, rng = Math.random) {
  if (orbKind === 'orb') {
    if (State.profile.orbs <= 0) return null;
    State.profile.orbs--;
  } else {
    if (State.profile.greatOrbs <= 0) return null;
    State.profile.greatOrbs--;
  }
  const success = rng() < catchChance(speciesId, orbKind);
  let first = false;
  if (success) first = registerCatch(speciesId);
  save();
  return { success, first };
}

/* ---------------- time helpers ---------------- */

function fmtDuration(ms) {
  if (ms <= 0) return 'Ready!';
  const s = Math.ceil(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60), sec = s % 60;
  if (m < 60) return sec ? `${m}m ${sec}s` : `${m}m`;
  const h = Math.floor(m / 60), min = m % 60;
  return min ? `${h}h ${min}m` : `${h}h`;
}
