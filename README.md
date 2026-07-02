# ⚔ Automon Arena

A polished, mobile-first **monster-collecting auto-battler** in the spirit of
Super Auto Pets crossed with classic monster-taming RPGs — built with plain
HTML/CSS/JS, zero dependencies, zero build step. All creatures, names, pixel
art and sounds are original.

**Play it:** open `index.html` in any browser (or serve the folder with any
static server). Works great on phones — add it to your home screen.

```bash
# quickest way to run it
python3 -m http.server 8000
# then open http://localhost:8000
```

## The loop

1. **Expedition** — each turn you get gold to recruit monsters into a team of
   5, then auto-battle a wild squad. Win **10 trophies** before losing
   **5 lives**.
2. **Catch** — after every victory you can throw a Capture Orb at one of the
   defeated wild monsters. Caught species are **unlocked in your shop pool**
   (you start with only Tier 1!) and duplicate catches add ★s for permanent
   stat bonuses.
3. **Collect** — fill the 20-species Dex across 3 tiers and 7 elemental types.
4. **Craft** — battles drop typed shards; craft **held items** (8 kinds) and
   more orbs from them.
5. **Wait** — chests unlock on real-time timers, eggs hatch into new species,
   and your Training Camp earns essence while you're away (idle, 8h cap).

## Systems

| System | Details |
| --- | --- |
| Types | Fire / Water / Grass / Electric / Rock / Ghost / Normal with 1.5×/0.75× effectiveness |
| Moves | Every monster has a charge move (fills as it attacks) + a passive trigger |
| Levels | Merge duplicates: 3 copies → Lv2, 6 → Lv3 (+50% stats per level, stronger moves) |
| Held items | Power Ring, Grit Band, Honey Drop, Ember Charm, Tide Pearl, Volt Coil, Wisp Lantern, Heart Amulet |
| Crafting | 10 recipes from essence + 6 typed shards |
| Eggs | 3 slots; Dappled (5 m) / Storm (30 m) / Comet (2 h) with tier-weighted hatches |
| Chests | 4 slots; Wooden (5 m) / Silver (30 m) / Golden (2 h), one unlocks at a time |
| Idle | Essence per hour scales with unique species caught |
| Saves | Everything persists in `localStorage` — close the tab and come back |

## Battle rules

- Front monsters clash simultaneously; damage applies type effectiveness.
- Charge bars fill each attack; a full bar unleashes the monster's move.
- Passives trigger on battle start, hurt, faint, ally faint, kill, or every clash.
- Burns tick 2 damage for 3 rounds; shields absorb damage first.
- After round 12, escalating fatigue damage hits the front liners so battles
  always resolve.

## Code layout

```
index.html        shell
css/style.css     retro handheld UI theme
js/data.js        species / items / recipes / tuning
js/sprites.js     original 16×16 pixel art + renderer
js/state.js       save, collection, eggs, chests, idle, catching
js/battle.js      async battle engine (presenter-driven, headless-testable)
js/shop.js        run logic, shop, enemy generation, rewards
js/ui.js          screens: home, shop phase, dex, craft, loot
js/battleui.js    battle overlay, animations, catch phase
js/main.js        bootstrap + WebAudio synth sfx
```
