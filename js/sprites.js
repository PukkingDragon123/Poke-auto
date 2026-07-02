/* =========================================================
   AUTOMON ARENA — pixel sprites
   Every sprite is an original 16x16 pixel grid.
   '.' = transparent, other chars map to palette colors.
   ========================================================= */
'use strict';

const OUT = '#181425'; // shared outline color

const SPRITES = {
  /* ---- Embit: cinder hare ---- */
  embit: {
    pal: { k: OUT, o: '#ff8a3d', d: '#d95d1e', c: '#ffe3c2', f: '#ffd93d', w: '#ffffff', p: '#181425' },
    px: [
      '....f......f....',
      '...kfk....kfk...',
      '...kok....kok...',
      '...kok....kok...',
      '...kook..kook...',
      '....koookook....',
      '...koooooooook..',
      '..kooowpoowpok..',
      '..koooooooooook.',
      '.kocooooooocook.',
      '.koccoookkoccok.',
      '.kooooookkooook.',
      '..koooooooooook.',
      '..kkooooooookk..',
      '...kddk..kddk...',
      '....kk....kk....',
    ],
  },
  /* ---- Puddlet: living puddle ---- */
  puddlet: {
    pal: { k: OUT, b: '#4db2ff', d: '#2b7fd4', l: '#bfe7ff', w: '#ffffff', p: '#181425' },
    px: [
      '................',
      '.......kk.......',
      '......kbbk......',
      '.....kbbbbk.....',
      '....kblbbbbk....',
      '...kbllbbbbbk...',
      '...kblbbbbbbk...',
      '..kbbwpbbwpbbk..',
      '..kbbbbbbbbbbk..',
      '..kbbbbkkbbbbk..',
      '..kdbbbbbbbbdk..',
      '...kddbbbbddk...',
      '....kddddddk....',
      '..kkddddddddkk..',
      '.kddddddddddddk.',
      '..kkkkkkkkkkkk..',
    ],
  },
  /* ---- Sproutle: seed turtle ---- */
  sproutle: {
    pal: { k: OUT, g: '#5ecb4a', d: '#2f9440', s: '#8ee07a', t: '#c9f2b4', y: '#e8f7d4', w: '#ffffff', p: '#181425' },
    px: [
      '......kk........',
      '.....ktgk..kk...',
      '....ktgtgkkgk...',
      '.....kgggggk....',
      '.......kgk......',
      '....kkkgggkk....',
      '...ksssssssgk...',
      '..ksgsgsgsgsgk..',
      '.ksgsgsgsgsgsgk.',
      '.kddddddddddddk.',
      'kyywpyykkyywpyk.',
      'kyyyyyykkyyyyyk.',
      'kyyyykkkkkkyyyk.',
      '.kkkk......kkk..',
      '..kyyk....kyyk..',
      '...kk......kk...',
    ],
  },
  /* ---- Sparkit: static kitten ---- */
  sparkit: {
    pal: { k: OUT, y: '#ffd93d', o: '#f2a33c', c: '#fff3c4', w: '#ffffff', p: '#181425', z: '#7ad9ff' },
    px: [
      '...k......k.....',
      '..kyk....kyk..z.',
      '..koyk..kyok.kz.',
      '..kyyykkyyyk.zk.',
      '..kyyyyyyyyk.kz.',
      '.kyyyyyyyyyyk...',
      '.kywpyyyywpyk...',
      '.kyyyyyyyyyykkk.',
      '.kcyyykkyyycyyyk',
      '..kcyyyyyycykkk.',
      '..kyyyyyyyyyk...',
      '.kyyyyyyyyyyk...',
      '.kyykyyyykyyk...',
      '.kyykyyyykyyk...',
      '..kok.kk.kok....',
      '...k......k.....',
    ],
  },
  /* ---- Rubblet: pebble golem ---- */
  rubblet: {
    pal: { k: OUT, r: '#b7a180', d: '#8a7458', l: '#d8c7a5', m: '#6b5a44', w: '#ffffff', p: '#181425' },
    px: [
      '................',
      '....kkkkkkkk....',
      '...krrlllrrrk...',
      '..krlrrrrrrrrk..',
      '..krrrrrrrrrdk..',
      '.krrwwprrwwprdk.',
      '.krrwpprrwpprdk.',
      '.krrrrrrrrrrrdk.',
      '.kdrrrkkkkrrrdk.',
      '.kdrrrrrrrrrddk.',
      '..kddrrrrrrddk..',
      '..kmkddddddkmk..',
      '.kmmk.kkkk.kmmk.',
      '.krmk.kddk.krmk.',
      '..kk.kdddmk.kk..',
      '.....kkkkkk.....',
    ],
  },
  /* ---- Wispette: candle wisp ---- */
  wispette: {
    pal: { k: OUT, v: '#b98ae8', d: '#8a5cc9', l: '#e3ccff', w: '#ffffff', p: '#181425' },
    px: [
      '.......k........',
      '......kvk.......',
      '.....kvlvk......',
      '......kvk.......',
      '.....kkvkk......',
      '....kvvvvvk.....',
      '...kvlvvvvvk....',
      '..kvvvvvvvvvk...',
      '..kvwpvvvwpvk...',
      '..kvvvvvvvvvk...',
      '..kvvvkkkvvvk...',
      '..kdvvvvvvvdk...',
      '...kdvvvvvdk....',
      '....kdvkvdvk....',
      '.....kk.kvdk....',
      '.........kk.....',
    ],
  },
  /* ---- Fluffle: fluff ball ---- */
  fluffle: {
    pal: { k: OUT, f: '#f4e6da', s: '#d9bfae', r: '#ff9db0', w: '#ffffff', p: '#181425' },
    px: [
      '...kk......kk...',
      '..kffk....kffk..',
      '..kfrfk..kfrfk..',
      '...kffkkkkffk...',
      '..kffffffffffk..',
      '.kffffffffffffk.',
      '.kffwpffffwpffk.',
      'kffffffffffffffk',
      'kfffffkkkkfffffk',
      'kffffffffffffffk',
      'ksffffffffffffsk',
      '.ksffffffffffsk.',
      '.kssffffffffssk.',
      '..kssssssssssk..',
      '...kksssssskk...',
      '.....kkkkkk.....',
    ],
  },
  /* ---- Scorchik: fire chick ---- */
  scorchik: {
    pal: { k: OUT, o: '#ff8a3d', r: '#e8442e', y: '#ffd93d', c: '#ffe3c2', w: '#ffffff', p: '#181425' },
    px: [
      '......krk.......',
      '.....kryrk......',
      '....kryyyrk.....',
      '.....kyyyk......',
      '....kkoookk.....',
      '...kooooooook...',
      '..koowpoowpook..',
      '..kooooooooook..',
      '.kooookyykooook.',
      '.koooookkoooook.',
      '.kcoooooooooock.',
      '.kccooooooooock.',
      '..kcooooooook...',
      '...kkoooookk....',
      '....kyk.kyk.....',
      '...kyyk.kyyk....',
    ],
  },
  /* ---- Tidefin: crescent fish ---- */
  tidefin: {
    pal: { k: OUT, b: '#3fa7ff', d: '#2464b3', l: '#a8dcff', f: '#7ad9ff', w: '#ffffff', p: '#181425' },
    px: [
      '........kk......',
      '.......kffk.....',
      '......kfffk.....',
      '....kkbfbfkk....',
      '...kbbbbbbbbk...',
      '..kblbbbbbbbbk..',
      '.kbllbwpbbbbbbk.',
      '.kblbbbbbbbbdbkk',
      'kfbbbbbbbbbdbkfk',
      'kfkbbbkkbbdbkffk',
      'kfkbbbbbbdbkkfk.',
      '.kkbdbbbdbbkff..',
      '...kddddbbkfk...',
      '....kkkddkkf....',
      '......kfffk.....',
      '.......kk.......',
    ],
  },
  /* ---- Bramblebear: bramble cub ---- */
  bramblebear: {
    pal: { k: OUT, g: '#4aa53c', d: '#2f7a2e', t: '#8ee07a', n: '#6b4a2e', w: '#ffffff', p: '#181425' },
    px: [
      '..kk........kk..',
      '.kggk..t...kggk.',
      '.kgngk.kt.kgngk.',
      '..kggkkkkkkggk..',
      '..kggggggggggk..',
      '.kgggggggggggtk.',
      '.kgwpggggwpgggk.',
      'kggggggnnggggggk',
      'kgggggnnnnggggtk',
      'kggggggnngggggk.',
      'kgggggkkkkgggggk',
      '.kgggggggggggk..',
      '.kggkggggggkggk.',
      '..kkgggggggggk..',
      '..kngk.kk.kngk..',
      '...kk......kk...',
    ],
  },
  /* ---- Voltibee: lightning bee ---- */
  voltibee: {
    pal: { k: OUT, y: '#ffd93d', b: '#3a3648', l: '#cfe9ff', w: '#ffffff', p: '#181425', z: '#7ad9ff' },
    px: [
      '..z..kk..kk..z..',
      '.zk.kllk.kllk.kz',
      '.kz.klllkllk.zk.',
      '..z.kllkllk..z..',
      '....kkkkkkk.....',
      '...kyyyyyyyk....',
      '..kyywpyywpyk...',
      '..kyyyyyyyyyk...',
      '..kbbbbbbbbbk...',
      '..kyyyykkyyyk...',
      '..kbbbbbbbbbk...',
      '..kyyyyyyyyyk...',
      '...kbbbbbbbk....',
      '....kyyyyyk.....',
      '.....kbbzk......',
      '......kzk.......',
    ],
  },
  /* ---- Gravelisk: stone serpent ---- */
  gravelisk: {
    pal: { k: OUT, r: '#b7a180', d: '#8a7458', m: '#6b5a44', l: '#d8c7a5', w: '#ffffff', p: '#e8442e' },
    px: [
      '....kkkkkk......',
      '...krrlrrrk.....',
      '..krrrrrrrrk....',
      '..krwprrwprk....',
      '..krrrrrrrrk....',
      '..kdrrkkrrdk....',
      '...kddrrddk.....',
      '....kkkkkkkk....',
      '...kddrrrrrdk...',
      '..kdrrrlrrrrdk..',
      '..kdrrrrrrrddk..',
      '...kkddddddkk...',
      '..kdrrrrrrrrdk..',
      '.kdrrlrrrrrrrdk.',
      '.kddddddddddddk.',
      '..kkkkkkkkkkkk..',
    ],
  },
  /* ---- Shadeling: loose shadow ---- */
  shadeling: {
    pal: { k: OUT, s: '#4a3a66', d: '#332a4d', v: '#8a5cc9', w: '#f2f0ff', p: '#181425' },
    px: [
      '..k..........k..',
      '.ksk........ksk.',
      '.kvsk......ksvk.',
      '..kssk....kssk..',
      '..kssskkkksssk..',
      '.kssssssssssssk.',
      '.kswwsssssswwsk.',
      '.kswpsssssswpsk.',
      'kssssssssssssssk',
      'kssssswwwwsssssk',
      'kdssssskksssssdk',
      '.kdsssssssssdk..',
      '..kdsdsssdsdk...',
      '...kdk.kdk.kdk..',
      '....k...k...k...',
      '................',
    ],
  },
  /* ---- Hornox: stubborn ox ---- */
  hornox: {
    pal: { k: OUT, n: '#b98a5e', d: '#8a5f3c', c: '#e8d3b0', g: '#c8c8d0', w: '#ffffff', p: '#181425' },
    px: [
      '.kggk.....kggk..',
      'kgggk....kgggk..',
      'kgkgnkkkkngkgk..',
      '.k.knnnnnnk.k...',
      '..knnnnnnnnk....',
      '.knnwpnnwpnnk...',
      '.knnnnnnnnnnk...',
      '.kcnnnnnnnnck...',
      '.kccnkkkkncck...',
      '..kccccccck.....',
      '...knnnnnnk.....',
      '..knnnnnnnnk....',
      '..knknnnnknk....',
      '..knknnnnknk....',
      '..kdk.kk.kdk....',
      '...k......k.....',
    ],
  },
  /* ---- Pyrogon: pocket dragon ---- */
  pyrogon: {
    pal: { k: OUT, r: '#e8442e', d: '#a32b20', o: '#ff8a3d', y: '#ffd93d', c: '#ffe3c2', w: '#ffffff', p: '#181425' },
    px: [
      '..ko........ok..',
      '.kyok......koyk.',
      '..krrkkkkkkrrk..',
      '..krrrrrrrrrrk..',
      '.krrwprrrrwprrk.',
      '.krrrrrrrrrrrrk.',
      '.kcrrrkyykrrrck.',
      '.kccrrrkkrrrcck.',
      '..kcrrrrrrrrck..',
      '.kdrrkrrrrkrrdk.',
      'kdrrkkkrrrkkrrdk',
      'kdrk..krrk..krdk',
      '.kk..krrrrk..kk.',
      '....kdrkkrdk.oy.',
      '....kdk..kdk.koy',
      '.....k....k..ko.',
    ],
  },
  /* ---- Krakelle: shelled krakenling ---- */
  krakelle: {
    pal: { k: OUT, b: '#5a7fe8', d: '#3c56b3', s: '#f0d9b0', l: '#a8c4ff', w: '#ffffff', p: '#181425' },
    px: [
      '.....kkkkkk.....',
      '....kssssssk....',
      '...kssksskssk...',
      '...kssksskssk...',
      '..kkkkkkkkkkkk..',
      '..kbbbbbbbbbbk..',
      '.kblbwpbbwpbbbk.',
      '.kbbbbbbbbbbbbk.',
      '.kbbbkbbbbkbbbk.',
      '.kbbbbkkkkbbbbk.',
      '..kbbbbbbbbbbk..',
      '.kbkbbkbbkbbkbk.',
      'kbbkbbkbbkbbkbbk',
      'kbdkbdkbdkbdkbdk',
      '.kk.kk..kk.kk.k.',
      '................',
    ],
  },
  /* ---- Floramane: blossom lion ---- */
  floramane: {
    pal: { k: OUT, g: '#5ecb4a', f: '#ff9db0', c: '#ffd9e0', t: '#e8d3a0', w: '#ffffff', p: '#181425' },
    px: [
      '....kf.kk.fk....',
      '..kfcfkffkfcfk..',
      '.kfcffkcckffcfk.',
      '..kffgggggggfk..',
      '.kfkgggggggkfk..',
      'kfckgtttttgkcfk.',
      'kffgtttttttgffk.',
      '.kgtwpttwpttgk..',
      'kfgtttttttttgfk.',
      'kfgttktttkttgfk.',
      '.kgttttkttttgk..',
      'kfkgttkkkttgkfk.',
      '.kfkgtttttgkfk..',
      '..kfkgggggkfk...',
      '...kkgk.kgkk....',
      '.....k...k......',
    ],
  },
  /* ---- Thundrake: storm wyrm ---- */
  thundrake: {
    pal: { k: OUT, b: '#3d6bd9', d: '#2a4699', y: '#ffd93d', l: '#a8c4ff', w: '#ffffff', p: '#181425' },
    px: [
      '..ky........yk..',
      '.kyyk..kk..kyyk.',
      '..kykkkbbkkkyk..',
      '...kbbbbbbbbk...',
      '..kbbwpbbwpbbk..',
      '..kbbbbbbbbbbk..',
      '..klbbkyykbblk..',
      '...kbbbkkbbbk...',
      '....kbbbbbbk....',
      '...kbbkbbkbbk...',
      '..kbbk.kbbk.....',
      '..kbk.kbbk..ky..',
      '..kbbkbbk..kyk..',
      '...kbbbk..kyk...',
      '....kbbkkyyk....',
      '.....kkkyk......',
    ],
  },
  /* ---- Terrapex: mountain tortoise ---- */
  terrapex: {
    pal: { k: OUT, r: '#8a7458', d: '#5e4c38', s: '#c2a06b', g: '#5ecb4a', h: '#e8f7ff', w: '#ffffff', p: '#181425' },
    px: [
      '.......kk.......',
      '......khhk......',
      '.....krhhrk.....',
      '....krrrrrgk....',
      '...krrgrrrrgk...',
      '..kgrrrrgrrrrk..',
      '..krrrrrrrrrgk..',
      '.krrsrrsrrsrrrk.',
      '.kssssssssssssk.',
      'kkddddddddddddkk',
      'ksswpsssssswpssk',
      'kssssssskksssssk',
      'kdsssskkkkksssdk',
      '.kkskk.....kskk.',
      '..ksdk.....ksdk.',
      '...kk.......kk..',
    ],
  },
  /* ---- Phantumbra: button phantom ---- */
  phantumbra: {
    pal: { k: OUT, s: '#332a4d', d: '#241d38', v: '#8a5cc9', m: '#f2f0ff', w: '#ffffff', p: '#181425' },
    px: [
      '......kkkk......',
      '....kksssskk....',
      '...kssssssssk...',
      '..kssmmmmmmssk..',
      '..ksmmmmmmmmsk..',
      '.kssmwpmmwpmssk.',
      '.kssmmmmmmmmssk.',
      '.kvssmmkkmmssvk.',
      '..kssmmmmmmssk..',
      '..ksssskkssssk..',
      '.kssssssssssssk.',
      '.ksvsssssssvssk.',
      '..ksssdssdsssk..',
      '..kdssdssdssdk..',
      '...kdk.kk.kdk...',
      '....k......k....',
    ],
  },
};

/* ---------- Small icon sprites (12x12) ---------- */
/* P = primary color, S = shade, L = light, k = outline, w = white */
const ICON_SHAPES = {
  orb: [
    '...kkkkkk...',
    '..kPPLLPPk..',
    '.kPPLLLPPPk.',
    'kPPPLLPPPPPk',
    'kPPPPPPPPPPk',
    'kkkkkkkkkkkk',
    'kSSSSkkSSSSk',
    'kSSSSkkSSSSk',
    'kSSSSSSSSSSk',
    '.kSSSSSSSSk.',
    '..kSSSSSSk..',
    '...kkkkkk...',
  ],
  shard: [
    '.....kk.....',
    '....kLPk....',
    '....kLPk....',
    '...kLLPPk...',
    '...kLPPPk...',
    '..kLLPPPPk..',
    '..kLPPPPSk..',
    '.kLPPPPPSSk.',
    '.kPPPPPSSSk.',
    '..kPPPSSSk..',
    '...kPSSSk...',
    '....kkkk....',
  ],
  egg: [
    '....kkkk....',
    '...kLLPPk...',
    '..kLLPPPPk..',
    '.kLLPPPPPPk.',
    '.kLPPSPPPPk.',
    'kLPPPPPPSPPk',
    'kPPSPPPPPPPk',
    'kPPPPPSPPPPk',
    'kPPPPPPPPSPk',
    '.kSPPSPPPSk.',
    '..kSSPPSSk..',
    '...kkkkkk...',
  ],
  chest: [
    '..kkkkkkkk..',
    '.kPPPPPPPPk.',
    'kPLLPPPPPPPk',
    'kPPPPPPPPPPk',
    'kkkkkkkkkkkk',
    'kSSSSkwkSSSk',
    'kSSSSkwkSSSk',
    'kSSSSkkkSSSk',
    'kSSSSSSSSSSk',
    'kSSSSSSSSSSk',
    '.kSSSSSSSSk.',
    '..kkkkkkkk..',
  ],
  ring: [
    '............',
    '....kkkk....',
    '...kLLLLk...',
    '..kLkkkkPk..',
    '.kLk....kPk.',
    '.kLk....kPk.',
    '.kLk....kPk.',
    '.kPk....kPk.',
    '..kPkkkkPk..',
    '...kPPPPk...',
    '....kkkk....',
    '............',
  ],
  amulet: [
    '....kkkk....',
    '...kSkkSk...',
    '...kSk.kSk..',
    '....kkkk....',
    '...kPPLPk...',
    '..kPPLLPPk..',
    '.kPPLLPPPPk.',
    '.kPPPPPPPPk.',
    '.kPPPPPPPSk.',
    '..kPPPPSSk..',
    '...kPPSSk...',
    '....kkkk....',
  ],
  band: [
    '............',
    '...kkkkkk...',
    '..kPPPPPPk..',
    '.kPLPPPPPPk.',
    '.kPkkkkkkPk.',
    '.kPk....kPk.',
    '.kPk....kPk.',
    '.kPkkkkkkPk.',
    '.kPPPPPPPSk.',
    '..kPPPPSSk..',
    '...kkkkkk...',
    '............',
  ],
  drop: [
    '.....kk.....',
    '....kLPk....',
    '....kLPk....',
    '...kLLPPk...',
    '...kLPPPk...',
    '..kLPPPPPk..',
    '.kLPPPPPPSk.',
    '.kLPPPPPPSk.',
    '.kPPPPPPSSk.',
    '..kPPPPSSk..',
    '...kPPSSk...',
    '....kkkk....',
  ],
  charm: [
    '.....kk.....',
    '....kPPk....',
    '....kPPk....',
    '...kPPPPk...',
    '..kPPLPPPk..',
    '..kPLLPPPk..',
    '.kPPLLLPPPk.',
    '.kPLLwLLPPk.',
    '.kPLwwwLPSk.',
    '..kLwwwLSk..',
    '...kLLLSk...',
    '....kkkk....',
  ],
  pearl: [
    '............',
    '....kkkk....',
    '...kLLPPk...',
    '..kLwLPPPk..',
    '..kLLPPPPk..',
    '..kLPPPPSk..',
    '..kPPPPSSk..',
    '...kPPSSk...',
    '....kkkk....',
    '...kSkkSk...',
    '....kkkk....',
    '............',
  ],
  coil: [
    '............',
    '..kkkkkkkk..',
    '.kPPPPPPPPk.',
    '..kkkkkkkPk.',
    '.kPPPPPPPPk.',
    '.kPkkkkkkk..',
    '.kPPPPPPPPk.',
    '..kkkkkkkPk.',
    '.kPPPPPPPPk.',
    '..kkkkkkkk..',
    '.....kLk....',
    '......k.....',
  ],
  lantern: [
    '.....kk.....',
    '....kSSk....',
    '...kkkkkk...',
    '..kSkPPkSk..',
    '..kSkLPkSk..',
    '..kSPLLPSk..',
    '..kSPLLPSk..',
    '..kSkPPkSk..',
    '..kSkPPkSk..',
    '...kkkkkk...',
    '....kSSk....',
    '.....kk.....',
    ],
  heart: [
    '............',
    '..kk....kk..',
    '.kLPk..kPPk.',
    'kLLPPkkPPPPk',
    'kLPPPPPPPPPk',
    'kPPPPPPPPPPk',
    '.kPPPPPPPSk.',
    '..kPPPPPSk..',
    '...kPPPSk...',
    '....kPSk....',
    '.....kk.....',
    '............',
  ],
  trophy: [
    '............',
    '.kkkkkkkkkk.',
    '.kPLPPPPPPk.',
    'kkPLPPPPPPkk',
    'kSkPPPPPPkSk',
    '.kkPPPPPPkk.',
    '..kPPPPPSk..',
    '...kPPPSk...',
    '....kPPk....',
    '....kPPk....',
    '..kkkkkkkk..',
    '..kSSSSSSk..',
  ],
  coin: [
    '...kkkkkk...',
    '..kPLLLPPk..',
    '.kPLPPPPPPk.',
    'kPLPPkkPPPPk',
    'kPLPkPPkPPPk',
    'kPPPkPPkPPPk',
    'kPPPkPPkPPSk',
    'kPPPkPPkPSSk',
    '.kPPPkkPPSk.',
    '..kPPPPPSk..',
    '...kkkkkk...',
    '............',
  ],
};

/* ---------- Renderer ---------- */
const spriteCache = new Map();

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function drawGrid(ctx, px, pal, scale) {
  for (let y = 0; y < px.length; y++) {
    const row = px[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

// Species sprite -> <canvas>, cached per (id, scale, flip)
function spriteCanvas(speciesId, scale = 4, flip = false) {
  const key = `${speciesId}|${scale}|${flip}`;
  if (spriteCache.has(key)) return cloneCanvas(spriteCache.get(key));
  const def = SPRITES[speciesId];
  const size = 16 * scale;
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  if (flip) { ctx.translate(size, 0); ctx.scale(-1, 1); }
  drawGrid(ctx, def.px, def.pal, scale);
  spriteCache.set(key, c);
  return cloneCanvas(c);
}

function cloneCanvas(src) {
  const c = makeCanvas(src.width, src.height);
  c.getContext('2d').drawImage(src, 0, 0);
  return c;
}

// Icon -> <canvas>, tinted. shade/light derived from primary if not given.
function iconCanvas(shape, primary, scale = 3, opts = {}) {
  const key = `i|${shape}|${primary}|${scale}|${opts.shade || ''}|${opts.light || ''}`;
  if (spriteCache.has(key)) return cloneCanvas(spriteCache.get(key));
  const grid = ICON_SHAPES[shape];
  const pal = {
    k: OUT,
    P: primary,
    S: opts.shade || shadeColor(primary, -0.35),
    L: opts.light || shadeColor(primary, 0.45),
    w: '#ffffff',
  };
  const c = makeCanvas(12 * scale, 12 * scale);
  drawGrid(c.getContext('2d'), grid, pal, scale);
  spriteCache.set(key, c);
  return cloneCanvas(c);
}

function shadeColor(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) {
    r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt;
  } else {
    r *= 1 + amt; g *= 1 + amt; b *= 1 + amt;
  }
  const c = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

// Silhouette version for undiscovered dex entries.
function silhouetteCanvas(speciesId, scale = 4) {
  const key = `sil|${speciesId}|${scale}`;
  if (spriteCache.has(key)) return cloneCanvas(spriteCache.get(key));
  const def = SPRITES[speciesId];
  const size = 16 * scale;
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const pal = {};
  for (const ch of Object.keys(def.pal)) pal[ch] = '#232033';
  drawGrid(ctx, def.px, pal, scale);
  spriteCache.set(key, c);
  return cloneCanvas(c);
}
