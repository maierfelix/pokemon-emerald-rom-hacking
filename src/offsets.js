export const OFFSETS = {
  LZ77_10: 0x10,
  GAME_CODE: 0xAC,
  GAME_NAME: 0xA0,
  GAME_MAKER: 0xB0,
  ATTACK_COUNT: 354,
  ATTACK_NAMES: 0x31977C,
  ITEM_IMG: 0x614410,
  ITEM_DATA: 0x5839A0,
  ITEM_COUNT: 377,
  BERRY_DATA: 0x57FC94,
  BERRY_COUNT: 43,
  PKMN_COUNT: 412,
  PKMN_NAMES: 0x3185C8,
  PKMN_BACK_IMG: 0x3028B8,
  PKMN_FRONT_IMG: 0x301418,
  PKMN_NORMAL_PAL: 0x303678,
  PKMN_BACK_ANIM: 0x60A8C8,
  PKMN_FRONT_ANIM: 0x30A18C,
  ICON_POINTER_TBL: 0x57BCA8,
  ICON_PAL_TABLE: 0x57C388,
  ICON_PALS: 0xDDE1F8,
  FIELD_EFFECT_NAME: {
    GRASS_STEP: 0,
    WATER_STEP: 1,
    ASHE_STEP: 2,
    SURF_BLOB: 3,
    MAP_ARROW: 4,
    SAND_STEP: 5,
    DEEP_SAND_STEP: 6
  },
  DOOR_ANIM_HEADER: 0x497174,
  FIELD_EFFECT_HEADER: 0x5059F8,
  FIELD_EFFECT_PAL: [
    0x4F77B8,
    0x4F77D8,
    0x4FACB8,
    0x4FBAD8,
    0x0,
    0x0,
    0x4F6E98,
    0x4AD918
  ],
  FIELD_EFFECT_IMGS: [
    // id, palIdx w, h
    [4,  1,  16,  80], // grass step
    [5,  1,  16,  80], // water ripple step
    [6,  1,  16,  80], // ashe step
    [7,  7,  32,  96], // surf blob
    [8,  1,  16,  64], // map arrows
    [11, 0,  16,  32], // sand step
    [23, 0,  16,  32], // deep sand step
  ],
  OVERWORLD_COUNT: 244,
  OVERWORLD_BANK: 0x509954,
  OVERWORLD_PAL_COUNT: 35,
  OVERWORLD_PAL_HEADERS: 0x50BBC8,
  OVERWORLD_FRAME_LIMITS: [
    17,8,26,11,4,6,8,8,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,9,0,2,2,8,8,8,8,8,8,
    8,8,8,8,8,8,8,0,0,0,0,0,0,3,
    8,8,8,3,0,8,17,8,26,11,4,0,
    8,8,0,8,8,8,17,8,26,11,4,17,
    8,26,11,4,8,8,8,0,0,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,11,11,8,8,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,8,0,0,8,8,8,8,8,8,0,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,17,17,8,8,8,0,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,8
  ],
  PKMN_STRING: 0x1dc8b9,
  CRY_TABLE: 0x69DCF4,
  CRY_TABLE2: 0x69EF24,
  CRY_CONVERSION_TABLE: 0x31F61C,
  MAIN_TS_PAL_COUNT: 7,
  MAIN_TS_BLOCKS: 0x200,
  MAIN_TS_SIZE: 0x280,
  MAIN_TS_HEIGHT: 0x140,
  LOCAL_TS_BLOCKS: 0xFE,
  LOCAL_TS_SIZE: 0x140,
  LOCAL_TS_HEIGHT: 0xC0,
  MAP_LABEL_DATA: 0x5A1480,
  TILESET_PRIMARY_ANIMATIONS: [
    // flower
    {
      size: 0x80 / 0x20,
      offset: 0x3F80 / 0x20,
      animations: [
        0x510644,
        0x5105C4,
        0x510644,
        0x5106C4
      ]
    },
    // water
    {
      size: 0x3C0 / 0x20,
      offset: 0x3600 / 0x20,
      animations: [
        0x510774,
        0x510B34,
        0x510EF4,
        0x5112B4,
        0x511674,
        0x511A34,
        0x511DF4,
        0x5121B4
      ]
    },
    // water edge
    {
      size: 0x140 / 0x20,
      offset: 0x3a00 / 0x20,
      animations: [
        0x512594,
        0x5126D4,
        0x512814,
        0x512954,
        0x512A94,
        0x512BD4,
        0x512D14,
        0x512594
      ]
    },
    // waterfall
    {
      size: 0xc0 / 0x20,
      offset: 0x3e00 / 0x20,
      animations: [
        0x512E74,
        0x512F34,
        0x512FF4,
        0x5130B4
      ]
    },
    // water stuff
    {
      size: 0x140 / 0x20,
      offset: 0x3c00 / 0x20,
      animations: [
        0x513184,
        0x5132C4,
        0x513404,
        0x513544
      ]
    }
  ],
  TILESET_SECONDARY_ANIMATIONS: [
    // rustboro city fountain
    {
      tileset: "0:2",
      size: 0x80 / 0x20,
      offset: 0x7800 / 0x20,
      animations: [
        0x515844,
        0x5158C4
      ]
    },
    // slateport city
    {
      tileset: "0:4",
      size: 0x80 / 0x20,
      offset: 0x5c00 / 0x20,
      animations: [
        0x516B2C,
        0x516BAC,
        0x516C2C,
        0x516CAC
      ]
    },
    // rustboro reflecting water
    {
      tileset: "0:2",
      size: 0x80 / 0x20,
      offset: 0x5000 / 0x20,
      interval: 0x80 / 0x20,
      animations: [
        0x515404,
        0x515484,
        0x515504,
        0x515584,
        0x515604,
        0x515684,
        0x515704,
        0x515784
      ]
    },
    // evergrande city
    {
      tileset: "0:11",
      size: 0x80 / 0x20,
      offset: 0x5c00 / 0x20,
      interval: 0x80 / 0x20,
      animations: [
        0x515D9C,
        0x515E1C,
        0x515E9C,
        0x515F1C,
        0x515F9C,
        0x51601C,
        0x51609C,
        0x51611C
      ]
    },
    // lavaridge city pool
    {
      tileset: "0:6",
      size: 0x80 / 0x20,
      offset: 0x6400 / 0x20,
      interval: 0x80 / 0x20,
      animations: [
        0x513694,
        0x513714,
        0x513794,
        0x513814
      ]
    },
    // mauville city 0a
    {
      tileset: "0:5",
      size: 0x80 / 0x20,
      offset: 0x4c00 / 0x20,
      interval: 0x80 / 0x20,
      mod: 0x8,
      animations: [
        0x514E24,
        0x514E24,
        0x514EA4,
        0x514F24,
        0x514FA4,
        0x514FA4,
        0x514FA4,
        0x514FA4,
        0x514FA4,
        0x514FA4,
        0x514F24,
        0x514EA4
      ]
    },
    // mauville city 0b
    {
      tileset: "0:5",
      size: 0x80 / 0x20,
      offset: 0x5000 / 0x20,
      interval: 0x80 / 0x20,
      animations: [
        0x5150A4,
        0x5150A4,
        0x515124,
        0x5151A4,
        0x515224,
        0x515224,
        0x515224,
        0x515224,
        0x515224,
        0x515224,
        0x5151A4,
        0x515124
      ]
    },
    // mauville city 1a
    {
      tileset: "0:5",
      size: 0x80 / 0x20,
      offset: 0x4c00 / 0x20,
      interval: 0x80 / 0x20,
      animations: [
        0x514E24,
        0x514E24,
        0x515024,
        0x515024
      ]
    },
    // mauville city 1b
    {
      tileset: "0:5",
      size: 0x80 / 0x20,
      offset: 0x5000 / 0x20,
      interval: 0x80 / 0x20,
      animations: [
        0x5150A4,
        0x5150A4,
        0x5152A4,
        0x5152A4
      ]
    },
    // sootopolis gym 0
    {
      tileset: "0:13",
      size: 0x180 / 0x20,
      offset: 0x7e00 / 0x20,
      animations: [
        0x516E44,
        0x516FC4,
        0x517144
      ]
    },
    // sootopolis gym 1
    {
      tileset: "0:13",
      size: 0x280 / 0x20,
      offset: 0x7a00 / 0x20,
      animations: [
        0x5172C4,
        0x517544,
        0x5177C4
      ]
    },
    // dewford city
    {
      tileset: "0:3",
      size: 0xC0 / 0x20,
      offset: 0x5540 / 0x20,
      animations: [
        0x5161FC,
        0x5162BC,
        0x51637C,
        0x51643C
      ]
    },
    // pacifidlog city 0
    {
      tileset: "0:12",
      size: 0x3C0 / 0x20,
      offset: 0x7a00 / 0x20,
      animations: [
        0x5138A4,
        0x513C64,
        0x514024,
        0x513C64
      ]
    },
    // pacifidlog city 1
    {
      tileset: "0:12",
      size: 0x100 / 0x20,
      offset: 0x7e00 / 0x20,
      animations: [
        0x514604,
        0x514704,
        0x514804,
        0x514904,
        0x514A04,
        0x514B04,
        0x514C04,
        0x514D04
      ]
    },
    // underwater
    {
      tileset: "0:44",
      size: 0x80 / 0x20,
      offset: 0x7e00 / 0x20,
      animations: [
        0x5143F4,
        0x514474,
        0x5144F4,
        0x514574
      ]
    },
    // battle frontier west
    {
      tileset: "0:14",
      size: 0xC0 / 0x20,
      offset: 0x5b40 / 0x20,
      animations: [
        0x51650C,
        0x5165CC,
        0x51668C,
        0x51674C
      ]
    },
    // battle frontier east
    {
      tileset: "0:15",
      size: 0xC0 / 0x20,
      offset: 0x5b40 / 0x20,
      animations: [
        0x51681C,
        0x5168DC,
        0x51699C,
        0x516A5C
      ]
    },
    // inside building
    {
      tileset: "16:42",
      size: 0x80 / 0x20,
      offset: 0x3e00 / 0x20,
      animations: [
        0x516D3C,
        0x516DBC
      ]
    },
    // elite four 0
    {
      tileset: "16:58",
      size: 0x80 / 0x20,
      offset: 0x7c00 / 0x20,
      animations: [
        0x517A5C,
        0x517ADC
      ]
    },
    // elite four 1
    {
      tileset: "16:58",
      size: 0x20 / 0x20,
      offset: 0x7f00 / 0x20,
      animations: [
        0x517B5C,
        0x517B7C,
        0x517B9C,
        0x517BBC
      ]
    },
    // mauville gym
    {
      tileset: "16:51",
      size: 0x200 / 0x20,
      offset: 0x5200 / 0x20,
      animations: [
        0x517C14,
        0x517E14
      ]
    },
    // bikeshop
    {
      tileset: "0:30",
      size: 0x120 / 0x20,
      offset: 0x7e00 / 0x20,
      animations: [
        0x51803C,
        0x51815C
      ]
    },
    // sootopolis
    {
      tileset: "0:13",
      size: 0xc00 / 0x20,
      offset: 0x5e00 / 0x20,
      animations: [
        0x5182A4,
        0x518EA4,
        0x519AA4,
        0x51A6A4,
        0x51B2A4,
        0x51BEA4,
        0x51CAA4,
        0x51D6A4
      ]
    },
    // battle pyramid 0
    {
      tileset: "16:65",
      size: 0x100 / 0x20,
      offset: 0x52e0 / 0x20,
      animations: [
        0x5202E4,
        0x5203E4,
        0x5204E4
      ]
    },
    // battle pyramid 1
    {
      tileset: "16:65",
      size: 0x100 / 0x20,
      offset: 0x50e0 / 0x20,
      animations: [
        0x520604,
        0x520704,
        0x520804
      ]
    }
  ],
  MAP_CONNECTION: {
    NULL: 0,
    DOWN: 1,
    UP: 2,
    LEFT: 3,
    RIGHT: 4,
    DIVE: 5,
    EMERGE: 6
  },
  MAP_BANK_ORIGIN: 0x84AA4,
  MAP_BANK_POINTERS: [
    0x485D60,
    0x485E44,
    0x485E58,
    0x485E6C,
    0x485E84,
    0x485EA0,
    0x485EC0,
    0x485EE4,
    0x485F00,
    0x485F1C,
    0x485F54,
    0x485F74,
    0x485FB8,
    0x485FE0,
    0x48603C,
    0x486070,
    0x4860AC,
    0x4860E8,
    0x4860F0,
    0x4860F8,
    0x486100,
    0x48610C,
    0x486110,
    0x486114,
    0x486118,
    0x4862C8,
    0x4863BC,
    0x486520,
    0x486528,
    0x48652C,
    0x486560,
    0x486564,
    0x486568,
    0x486574
  ],
  MAPS_IN_BANK: [
    56,
    4,
    4,
    5,
    6,
    7,
    8,
    6,
    6,
    13,
    7,
    16,
    9,
    22,
    12,
    14,
    14,
    1,
    1,
    1,
    2,
    0,
    0,
    0,
    107,
    60,
    88,
    1,
    0,
    12,
    0,
    0,
    2,
    0
  ],
  OTHER_ASSETS: [
    {
      name: "cloud-0",
      pixels: 0xD82608,
      palette: 0xD854C8,
      width: 128, height: 128,
      compressed: true
    }
  ]
};

export const DIR = {
  NULL: 0,
  DOWN: 1,
  UP: 2,
  LEFT: 3,
  RIGHT: 4
};
