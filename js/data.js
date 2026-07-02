/* =========================================================
   AUTOMON ARENA — game data
   Original monsters, items and names. No third-party assets.
   ========================================================= */
'use strict';

const TYPES = {
  fire:    { name: 'Fire',    color: '#ff6b35', icon: 'F', strong: ['grass'] },
  water:   { name: 'Water',   color: '#3fa7ff', icon: 'W', strong: ['fire', 'rock'] },
  grass:   { name: 'Grass',   color: '#5ecb4a', icon: 'G', strong: ['water', 'rock'] },
  electric:{ name: 'Electric',color: '#ffd93d', icon: 'E', strong: ['water', 'ghost'] },
  rock:    { name: 'Rock',    color: '#c2a06b', icon: 'R', strong: ['fire', 'electric'] },
  ghost:   { name: 'Ghost',   color: '#a86bd9', icon: 'S', strong: ['normal', 'grass'] },
  normal:  { name: 'Normal',  color: '#c8c8d0', icon: 'N', strong: [] },
};

// Damage multiplier for attackerType hitting defenderType.
function typeMultiplier(atkType, defType) {
  if (TYPES[atkType].strong.includes(defType)) return 1.5;
  if (TYPES[defType].strong.includes(atkType)) return 0.75;
  return 1;
}

/* ---------- Move / passive effect vocabulary ----------
   Moves fire when the unit's charge meter fills (every `charge` attacks).
   Passives fire on a trigger:
     battleStart | onFaint | onHurt | onKill | onAllyFaint | everyClash
   Effects (amount scales with unit level unless flat):
     dmgFront, dmgAll, dmgRandom, dmgBack,
     healSelf, healAll, healBehind,
     buffAtkSelf, buffAtkAll, buffAtkBehind, buffHpAll, buffHpBehind,
     shieldSelf, shieldAll, burnFront, burnAll
------------------------------------------------------- */

const SPECIES = [
  /* ---------------- TIER 1 ---------------- */
  {
    id: 'embit', name: 'Embit', type: 'fire', tier: 1, atk: 2, hp: 3,
    dex: 'A cinder-hare that sleeps inside campfire ashes.',
    move:   { name: 'Ember Dash', charge: 3, effect: 'dmgFront', pow: 3,
              desc: 'Every 3rd attack: deal bonus damage to the front enemy.' },
    passive:{ name: 'Kindle', trigger: 'battleStart', effect: 'buffAtkSelf', pow: 1,
              desc: 'Battle start: gain ATK.' },
  },
  {
    id: 'puddlet', name: 'Puddlet', type: 'water', tier: 1, atk: 1, hp: 4,
    dex: 'A living puddle. It reforms after every rainy season.',
    move:   { name: 'Bubble Pop', charge: 3, effect: 'dmgFront', pow: 2,
              desc: 'Every 3rd attack: pop bubbles at the front enemy.' },
    passive:{ name: 'Soggy Coat', trigger: 'battleStart', effect: 'shieldSelf', pow: 2,
              desc: 'Battle start: gain a water shield.' },
  },
  {
    id: 'sproutle', name: 'Sproutle', type: 'grass', tier: 1, atk: 1, hp: 5,
    dex: 'A seed turtle. Its sprout grows a ring every year.',
    move:   { name: 'Leaf Flick', charge: 3, effect: 'dmgFront', pow: 2,
              desc: 'Every 3rd attack: flick razor leaves.' },
    passive:{ name: 'Photosynth', trigger: 'everyClash', effect: 'healSelf', pow: 1,
              desc: 'Each clash: recover a little HP.' },
  },
  {
    id: 'sparkit', name: 'Sparkit', type: 'electric', tier: 1, atk: 3, hp: 2,
    dex: 'A static kitten. Petting it is a calculated risk.',
    move:   { name: 'Zap', charge: 2, effect: 'dmgRandom', pow: 2,
              desc: 'Every 2nd attack: zap a random enemy.' },
    passive:{ name: 'Static Fuzz', trigger: 'onHurt', effect: 'dmgFront', pow: 1,
              desc: 'When hurt: shock the front enemy.' },
  },
  {
    id: 'rubblet', name: 'Rubblet', type: 'rock', tier: 1, atk: 2, hp: 4,
    dex: 'A pebble golem. It collects smaller pebbles as pets.',
    move:   { name: 'Pebble Toss', charge: 3, effect: 'dmgFront', pow: 2,
              desc: 'Every 3rd attack: hurl a pebble.' },
    passive:{ name: 'Stonewall', trigger: 'battleStart', effect: 'shieldSelf', pow: 3,
              desc: 'Battle start: gain a rocky shield.' },
  },
  {
    id: 'wispette', name: 'Wispette', type: 'ghost', tier: 1, atk: 2, hp: 2,
    dex: 'A shy flamelet said to be the dream of a candle.',
    move:   { name: 'Spook', charge: 2, effect: 'dmgBack', pow: 2,
              desc: 'Every 2nd attack: frighten the rearmost enemy.' },
    passive:{ name: 'Last Whisper', trigger: 'onFaint', effect: 'dmgFront', pow: 2,
              desc: 'On faint: haunt the front enemy.' },
  },
  {
    id: 'fluffle', name: 'Fluffle', type: 'normal', tier: 1, atk: 2, hp: 4,
    dex: 'A ball of fluff. Nobody has found its feet.',
    move:   { name: 'Roll Out', charge: 3, effect: 'dmgFront', pow: 3,
              desc: 'Every 3rd attack: roll into the front enemy.' },
    passive:{ name: 'Cheer', trigger: 'onFaint', effect: 'buffAtkAll', pow: 1,
              desc: 'On faint: cheer allies, raising their ATK.' },
  },

  /* ---------------- TIER 2 ---------------- */
  {
    id: 'scorchik', name: 'Scorchik', type: 'fire', tier: 2, atk: 4, hp: 4,
    dex: 'A hot-headed chick. Its comb burns brighter when angry.',
    move:   { name: 'Flame Peck', charge: 3, effect: 'burnFront', pow: 2,
              desc: 'Every 3rd attack: peck and set the enemy ablaze.' },
    passive:{ name: 'Hot Temper', trigger: 'onHurt', effect: 'buffAtkSelf', pow: 1,
              desc: 'When hurt: gain ATK.' },
  },
  {
    id: 'tidefin', name: 'Tidefin', type: 'water', tier: 2, atk: 3, hp: 6,
    dex: 'A crescent fish that rides invisible tides in the air.',
    move:   { name: 'Wave Crash', charge: 3, effect: 'dmgFront', pow: 4,
              desc: 'Every 3rd attack: crash a wave into the front enemy.' },
    passive:{ name: 'Tide Aura', trigger: 'battleStart', effect: 'shieldAll', pow: 1,
              desc: 'Battle start: shield the whole team.' },
  },
  {
    id: 'bramblebear', name: 'Bramblebear', type: 'grass', tier: 2, atk: 4, hp: 6,
    dex: 'A cub grown from a bramble patch. Its hugs are thorny.',
    move:   { name: 'Thorn Swipe', charge: 3, effect: 'dmgFront', pow: 3,
              desc: 'Every 3rd attack: swipe with thorned paws.' },
    passive:{ name: 'Bramble Coat', trigger: 'onHurt', effect: 'dmgFront', pow: 1,
              desc: 'When hurt: thorns prick the attacker.' },
  },
  {
    id: 'voltibee', name: 'Voltibee', type: 'electric', tier: 2, atk: 5, hp: 3,
    dex: 'It stores lightning in its stinger. Honey sold separately.',
    move:   { name: 'Volt Sting', charge: 2, effect: 'dmgRandom', pow: 3,
              desc: 'Every 2nd attack: sting a random enemy.' },
    passive:{ name: 'Swarm Hum', trigger: 'battleStart', effect: 'buffAtkBehind', pow: 2,
              desc: 'Battle start: energize the ally behind.' },
  },
  {
    id: 'gravelisk', name: 'Gravelisk', type: 'rock', tier: 2, atk: 3, hp: 8,
    dex: 'A basilisk of stacked stones. It naps for decades.',
    move:   { name: 'Rockslide', charge: 4, effect: 'dmgAll', pow: 2,
              desc: 'Every 4th attack: bury all enemies in rubble.' },
    passive:{ name: 'Bedrock', trigger: 'battleStart', effect: 'buffHpBehind', pow: 2,
              desc: 'Battle start: fortify the ally behind.' },
  },
  {
    id: 'shadeling', name: 'Shadeling', type: 'ghost', tier: 2, atk: 4, hp: 4,
    dex: 'A mischievous shadow that detached from its owner.',
    move:   { name: 'Night Nip', charge: 2, effect: 'dmgBack', pow: 3,
              desc: 'Every 2nd attack: bite the rearmost enemy.' },
    passive:{ name: 'Grudge', trigger: 'onFaint', effect: 'dmgAll', pow: 2,
              desc: 'On faint: curse all enemies.' },
  },
  {
    id: 'hornox', name: 'Hornox', type: 'normal', tier: 2, atk: 5, hp: 5,
    dex: 'A stubborn little ox. It headbutts anything that beeps.',
    move:   { name: 'Big Charge', charge: 4, effect: 'dmgFront', pow: 6,
              desc: 'Every 4th attack: a devastating charge.' },
    passive:{ name: 'Rally', trigger: 'onAllyFaint', effect: 'buffAtkSelf', pow: 2,
              desc: 'When an ally faints: gain ATK.' },
  },

  /* ---------------- TIER 3 ---------------- */
  {
    id: 'pyrogon', name: 'Pyrogon', type: 'fire', tier: 3, atk: 6, hp: 6,
    dex: 'A pocket dragon whose sneezes are a fire hazard.',
    move:   { name: 'Inferno Breath', charge: 3, effect: 'burnAll', pow: 2,
              desc: 'Every 3rd attack: breathe fire on all enemies.' },
    passive:{ name: 'Blaze Heart', trigger: 'onKill', effect: 'buffAtkSelf', pow: 2,
              desc: 'On knockout: its flame grows, raising ATK.' },
  },
  {
    id: 'krakelle', name: 'Krakelle', type: 'water', tier: 3, atk: 5, hp: 8,
    dex: 'A tiny kraken in a shell. Its tantrums flood tide pools.',
    move:   { name: 'Tentacle Slam', charge: 3, effect: 'dmgAll', pow: 3,
              desc: 'Every 3rd attack: slam every enemy.' },
    passive:{ name: 'Ink Veil', trigger: 'onHurt', effect: 'shieldSelf', pow: 1,
              desc: 'When hurt: ink hardens into a shield.' },
  },
  {
    id: 'floramane', name: 'Floramane', type: 'grass', tier: 3, atk: 5, hp: 7,
    dex: 'A lion whose mane blooms once a century. It is very proud.',
    move:   { name: 'Petal Storm', charge: 3, effect: 'dmgAll', pow: 2,
              desc: 'Every 3rd attack: shred enemies with petals.' },
    passive:{ name: 'Bloom Aura', trigger: 'everyClash', effect: 'healAll', pow: 1,
              desc: 'Each clash: mend the whole team.' },
  },
  {
    id: 'thundrake', name: 'Thundrake', type: 'electric', tier: 3, atk: 7, hp: 5,
    dex: 'A storm wyrm. Thunderclouds follow it like ducklings.',
    move:   { name: 'Thunderlance', charge: 3, effect: 'dmgFront', pow: 7,
              desc: 'Every 3rd attack: skewer the front enemy with lightning.' },
    passive:{ name: 'Storm Charge', trigger: 'battleStart', effect: 'buffAtkSelf', pow: 2,
              desc: 'Battle start: charge up ATK.' },
  },
  {
    id: 'terrapex', name: 'Terrapex', type: 'rock', tier: 3, atk: 4, hp: 11,
    dex: 'A mountain-backed tortoise. Hikers mistake it for scenery.',
    move:   { name: 'Quake Stomp', charge: 4, effect: 'dmgAll', pow: 3,
              desc: 'Every 4th attack: shake the whole arena.' },
    passive:{ name: 'Aegis Shell', trigger: 'battleStart', effect: 'shieldAll', pow: 2,
              desc: 'Battle start: shield the whole team.' },
  },
  {
    id: 'phantumbra', name: 'Phantumbra', type: 'ghost', tier: 3, atk: 6, hp: 6,
    dex: 'An elegant phantom that collects lost buttons.',
    move:   { name: 'Umbral Claw', charge: 2, effect: 'dmgFront', pow: 4,
              desc: 'Every 2nd attack: rake with shadow claws.' },
    passive:{ name: 'Phantom Waltz', trigger: 'onAllyFaint', effect: 'dmgRandom', pow: 3,
              desc: 'When an ally faints: strike a random enemy.' },
  },
];

const SPECIES_BY_ID = Object.fromEntries(SPECIES.map(s => [s.id, s]));

/* ---------------- Materials ---------------- */
const MATERIALS = {
  essence:    { name: 'Essence',     color: '#e8e6ff', desc: 'Raw monster energy. The basis of all crafting.' },
  emberShard: { name: 'Ember Shard', color: '#ff6b35', desc: 'A warm shard dropped by Fire types.' },
  dewShard:   { name: 'Dew Shard',   color: '#3fa7ff', desc: 'A cool shard dropped by Water types.' },
  leafShard:  { name: 'Leaf Shard',  color: '#5ecb4a', desc: 'A fresh shard dropped by Grass types.' },
  voltShard:  { name: 'Volt Shard',  color: '#ffd93d', desc: 'A tingly shard dropped by Electric types.' },
  stoneShard: { name: 'Stone Shard', color: '#c2a06b', desc: 'A heavy shard dropped by Rock types.' },
  wispShard:  { name: 'Wisp Shard',  color: '#a86bd9', desc: 'An eerie shard dropped by Ghost types.' },
};
const SHARD_BY_TYPE = {
  fire: 'emberShard', water: 'dewShard', grass: 'leafShard',
  electric: 'voltShard', rock: 'stoneShard', ghost: 'wispShard', normal: 'essence',
};

/* ---------------- Held items ---------------- */
const ITEMS = {
  powerRing:  { name: 'Power Ring',  icon: 'ring',    desc: '+2 ATK.', },
  heartAmulet:{ name: 'Heart Amulet',icon: 'amulet',  desc: '+4 HP.', },
  gritBand:   { name: 'Grit Band',   icon: 'band',    desc: 'Survives a knockout blow once with 1 HP.', },
  honeyDrop:  { name: 'Honey Drop',  icon: 'drop',    desc: 'Heals 5 HP the first time it drops below half.', },
  emberCharm: { name: 'Ember Charm', icon: 'charm',   desc: 'Basic attacks set the target ablaze.', },
  tidePearl:  { name: 'Tide Pearl',  icon: 'pearl',   desc: 'Battle start: gain a 5 point shield.', },
  voltCoil:   { name: 'Volt Coil',   icon: 'coil',    desc: 'Moves charge one attack faster.', },
  wispLantern:{ name: 'Wisp Lantern',icon: 'lantern', desc: 'On faint: deal 5 damage to the front enemy.', },
};

/* ---------------- Crafting recipes ---------------- */
const RECIPES = [
  { id: 'orb',       out: { orb: 1 },              name: 'Capture Orb',
    cost: { essence: 6 },
    desc: 'Throw after a victory to catch an enemy monster.' },
  { id: 'greatOrb',  out: { greatOrb: 1 },         name: 'Great Orb',
    cost: { essence: 14, wispShard: 2 },
    desc: 'A refined orb with a much better catch rate.' },
  { id: 'powerRing', out: { item: 'powerRing' },   name: 'Power Ring',
    cost: { essence: 6, emberShard: 4, stoneShard: 4 }, desc: ITEMS.powerRing.desc },
  { id: 'heartAmulet', out: { item: 'heartAmulet' }, name: 'Heart Amulet',
    cost: { essence: 6, leafShard: 4, dewShard: 4 }, desc: ITEMS.heartAmulet.desc },
  { id: 'gritBand',  out: { item: 'gritBand' },    name: 'Grit Band',
    cost: { essence: 8, stoneShard: 8 },            desc: ITEMS.gritBand.desc },
  { id: 'honeyDrop', out: { item: 'honeyDrop' },   name: 'Honey Drop',
    cost: { essence: 8, leafShard: 8 },             desc: ITEMS.honeyDrop.desc },
  { id: 'emberCharm', out: { item: 'emberCharm' }, name: 'Ember Charm',
    cost: { essence: 8, emberShard: 8 },            desc: ITEMS.emberCharm.desc },
  { id: 'tidePearl', out: { item: 'tidePearl' },   name: 'Tide Pearl',
    cost: { essence: 8, dewShard: 8 },              desc: ITEMS.tidePearl.desc },
  { id: 'voltCoil',  out: { item: 'voltCoil' },    name: 'Volt Coil',
    cost: { essence: 8, voltShard: 8 },             desc: ITEMS.voltCoil.desc },
  { id: 'wispLantern', out: { item: 'wispLantern' }, name: 'Wisp Lantern',
    cost: { essence: 8, wispShard: 8 },             desc: ITEMS.wispLantern.desc },
];

/* ---------------- Eggs & chests ---------------- */
const EGGS = {
  common: { name: 'Dappled Egg', mins: 5,   color: '#bfe3c0', tierW: [70, 28, 2] },
  rare:   { name: 'Storm Egg',   mins: 30,  color: '#9fc9ff', tierW: [30, 55, 15] },
  epic:   { name: 'Comet Egg',   mins: 120, color: '#d9a6ff', tierW: [5, 45, 50] },
};

const CHESTS = {
  wood:  { name: 'Wooden Chest', mins: 5,  color: '#b98a4e' },
  silver:{ name: 'Silver Chest', mins: 30, color: '#cfd6e4' },
  gold:  { name: 'Golden Chest', mins: 120,color: '#ffd93d' },
};

/* ---------------- Run tuning ---------------- */
const RUN = {
  teamSize: 5,
  shopSize: 4,
  goldPerTurn: 10,
  buyCost: 3,
  rerollCost: 1,
  sellValue: 1,          // per level
  lives: 5,
  trophiesToWin: 10,
  // Shop tier availability by turn number.
  tierForTurn(turn) { return turn >= 8 ? 3 : turn >= 4 ? 2 : 1; },
};

// Catch chance by species tier, per orb kind.
const CATCH = {
  orb:      { 1: 0.75, 2: 0.45, 3: 0.25 },
  greatOrb: { 1: 0.95, 2: 0.75, 3: 0.55 },
};

// Idle training: essence/hour = base + per unique species caught. 8h cap.
const IDLE = { basePerHour: 4, perSpecies: 1, capHours: 8 };
