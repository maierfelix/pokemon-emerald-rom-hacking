var iroh = (function () {
'use strict';

function assert(truth) {
  if (!truth) { throw new Error("Assert exception!"); }
}



function createCanvasBuffer(width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  setImageSmoothing(ctx, false);
  return { ctx: ctx, canvas: canvas };
}

function setImageSmoothing(ctx, state) {
  ctx.imageSmoothingEnabled = state;
  ctx.webkitImageSmoothingEnabled = state;
  ctx.mozImageSmoothingEnabled = state;
  ctx.msImageSmoothingEnabled = state;
  ctx.oImageSmoothingEnabled = state;
}

var OFFSETS = {
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
    [23, 0,  16,  32] ],
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

var DIR = {
  NULL: 0,
  DOWN: 1,
  UP: 2,
  LEFT: 3,
  RIGHT: 4
};

function LZ77(source, offset) {
  assert(source[offset] === OFFSETS.LZ77_10);
  var length = (
    (readByte(source, offset + 0) << 0) |
    (readByte(source, offset + 1) << 8) |
    (readByte(source, offset + 2) << 16)
  ) >> 8;
  var destination = new Uint8Array(length);

  var xIn = offset + 4;
  var xOut = 0;
  var xLen = destination.length;
  while (xLen > 0) {
    var d = source[xIn++];
    for (var ii = 0; ii < 8; ++ii) {
      if ((d & 0x80) !== 0) {
        var data = source[xIn] << 8 | source[xIn + 1];
        xIn += 2;
        var length$1 = (data >> 12) + 3;
        var offset$1 = (data & 0xFFF);
        var windowsOffset = xOut - offset$1 - 1;
        for (var j = 0; j < length$1; j++) {
          destination[xOut++] = destination[windowsOffset++];
          xLen--;
          if (xLen === 0) { return destination; }
        }
      } else {
        destination[xOut++] = source[xIn++];
        xLen--;

        if (xLen === 0) { return destination; }
      }

      d = ((d << 1) & 0xFF);
    }
  }
}

function toHex(n) {
  return "0x" + (n).toString(16).toUpperCase();
}



function hasConnection(connections, dir) {
  for (var ii = 0; ii < connections.length; ++ii) {
    var con = connections[ii];
    switch (con.lType) {
      case OFFSETS.MAP_CONNECTION.LEFT:
        if (dir === DIR.LEFT) { return true; }
      break;
      case OFFSETS.MAP_CONNECTION.UP:
        if (dir === DIR.UP) { return true; }
      break;
      case OFFSETS.MAP_CONNECTION.RIGHT:
        if (dir === DIR.RIGHT) { return true; }
      break;
      case OFFSETS.MAP_CONNECTION.DOWN:
        if (dir === DIR.DOWN) { return true; }
      break;
    }
  }
  return false;
}

function decodeCharByte(byte) {
  switch (byte) {
    case 0x00: return " ";
    case 0x01: return "À";
    case 0x02: return "Á";
    case 0x03: return "Â";
    case 0x04: return "Ç";
    case 0x05: return "È";
    case 0x06: return "É";
    case 0x07: return "Ê";
    case 0x08: return "Ë";
    case 0x09: return "Ì";
    case 0x0B: return "Î";
    case 0x0C: return "Ï";
    case 0x0D: return "Ò";
    case 0x0E: return "Ó";
    case 0x0F: return "Ô";
    case 0x10: return "Œ";
    case 0x11: return "Ù";
    case 0x12: return "Ú";
    case 0x13: return "Û";
    case 0x14: return "Ñ";
    case 0x15: return "ß";
    case 0x16: return "à";
    case 0x17: return "á";
    case 0x19: return "ç";
    case 0x1A: return "è";
    case 0x1B: return "é";
    case 0x1C: return "ê";
    case 0x1D: return "ë";
    case 0x1E: return "ì";
    case 0x20: return "î";
    case 0x21: return "ï";
    case 0x22: return "ò";
    case 0x23: return "ó";
    case 0x24: return "ô";
    case 0x25: return "œ";
    case 0x26: return "ù";
    case 0x27: return "ú";
    case 0x28: return "û";
    case 0x29: return "ñ";
    case 0x2A: return "º";
    case 0x2B: return "ª";
    case 0x2D: return "&";
    case 0x2E: return "+";
    case 0x34: return "[Lv]";
    case 0x35: return "=";
    case 0x36: return ";";
    case 0x51: return "¿";
    case 0x52: return "¡";
    case 0x53: return "[pk]";
    case 0x54: return "[mn]";
    case 0x55: return "[po]";
    case 0x56: return "[ké]";
    case 0x57: return "[bl]";
    case 0x58: return "[oc]";
    case 0x59: return "[k]";
    case 0x5A: return "Í";
    case 0x5B: return "%";
    case 0x5C: return "(";
    case 0x5D: return ")";
    case 0x68: return "â";
    case 0x6F: return "í";
    case 0x79: return "[U]";
    case 0x7A: return "[D]";
    case 0x7B: return "[L]";
    case 0x7C: return "[R]";
    case 0x85: return "<";
    case 0x86: return ">";
    case 0xA1: return "0";
    case 0xA2: return "1";
    case 0xA3: return "2";
    case 0xA4: return "3";
    case 0xA5: return "4";
    case 0xA6: return "5";
    case 0xA7: return "6";
    case 0xA8: return "7";
    case 0xA9: return "8";
    case 0xAA: return "9";
    case 0xAB: return "!";
    case 0xAC: return "?";
    case 0xAD: return ".";
    case 0xAE: return "-";
    case 0xAF: return "·";
    case 0xB0: return "...";
    case 0xB1: return "«";
    case 0xB2: return "»";
    case 0xB3: return "'";
    case 0xB4: return "'";
    case 0xB5: return "|m|";
    case 0xB6: return "|f|";
    case 0xB7: return "$";
    case 0xB8: return ",";
    case 0xB9: return "*";
    case 0xBA: return "/";
    case 0xBB: return "A";
    case 0xBC: return "B";
    case 0xBD: return "C";
    case 0xBE: return "D";
    case 0xBF: return "E";
    case 0xC0: return "F";
    case 0xC1: return "G";
    case 0xC2: return "H";
    case 0xC3: return "I";
    case 0xC4: return "J";
    case 0xC5: return "K";
    case 0xC6: return "L";
    case 0xC7: return "M";
    case 0xC8: return "N";
    case 0xC9: return "O";
    case 0xCA: return "P";
    case 0xCB: return "Q";
    case 0xCC: return "R";
    case 0xCD: return "S";
    case 0xCE: return "T";
    case 0xCF: return "U";
    case 0xD0: return "V";
    case 0xD1: return "W";
    case 0xD2: return "X";
    case 0xD3: return "Y";
    case 0xD4: return "Z";
    case 0xD5: return "a";
    case 0xD6: return "b";
    case 0xD7: return "c";
    case 0xD8: return "d";
    case 0xD9: return "e";
    case 0xDA: return "f";
    case 0xDB: return "g";
    case 0xDC: return "h";
    case 0xDD: return "i";
    case 0xDE: return "j";
    case 0xDF: return "k";
    case 0xE0: return "l";
    case 0xE1: return "m";
    case 0xE2: return "n";
    case 0xE3: return "o";
    case 0xE4: return "p";
    case 0xE5: return "q";
    case 0xE6: return "r";
    case 0xE7: return "s";
    case 0xE8: return "t";
    case 0xE9: return "u";
    case 0xEA: return "v";
    case 0xEB: return "w";
    case 0xEC: return "x";
    case 0xED: return "y";
    case 0xEE: return "z";
    case 0xEF: return "|>|";
    case 0xF0: return ":";
    case 0xF1: return "Ä";
    case 0xF2: return "Ö";
    case 0xF3: return "Ü";
    case 0xF4: return "ä";
    case 0xF5: return "ö";
    case 0xF6: return "ü";
    case 0xF7: return "|A|";
    case 0xF8: return "|V|";
    case 0xF9: return "|<|";
    case 0xFA: return "|nb|";
    case 0xFB: return "|nb2|";
    case 0xFC: return "|FC|";
    case 0xFD: return "|FD|";
    case 0xFE: return "|br|";
    case 0xFF: return "|end|";
  }
  return "";
}

function getMaxFrame(index) {
  return OFFSETS.OVERWORLD_FRAME_LIMITS[index];
}

function isFrameMirrorable(frame) {
  switch (frame) {
    case 2:
    case 7:
    case 8:
    case 11:
    case 16:
    case 17:
    case 18:
    case 23:
    case 22:
    case 24:
    return true;
  }
  return false;
}

var I8 = Int8Array.BYTES_PER_ELEMENT;





function intToPointer(value) {
  return value & 0x1FFFFFF;
}

function readByte(buffer, offset) {
  return (
    buffer[offset] & 0xff
  );
}

function readShort(buffer, offset) {
  return (
    ((buffer[offset] & 0xff) << 0) |
    ((buffer[offset + 1] & 0xff) << 8)
  );
}

function readInt(buffer, offset) {
  return (
    ((buffer[offset + 0] & 0xff) << 0)  |
    ((buffer[offset + 1] & 0xff) << 8)  |
    ((buffer[offset + 2] & 0xff) << 16) |
    ((buffer[offset + 3] & 0xff) << 24)
  );
}

function readPointer(buffer, offset) {
  return (
    readInt(buffer, offset) & 0x1FFFFFF
  );
}



function readChar(buffer, offset) {
  return decodeCharByte(readByte(buffer, offset));
}

function readWord(buffer, offset) {
  var bytes = readBytes(buffer, offset, 2);
  return (bytes[1] << 8) + (bytes[0]);
}

function readHWord(buffer, offset) {
  var low = buffer[offset + 0];
  var high = buffer[offset + 1];
  return ((high << 8) | low);
}

function readLong(buffer, offset) {
  var ptr = readInt(buffer, offset);
  return ptr | 0;
}

function readBytes(buffer, offset, length) {
  var data = new Uint8Array(length);
  for (var ii = 0; ii < length; ++ii) {
    data[ii] = readByte(buffer, offset + ii * I8);
  }
  return data;
}







function readString(buffer, offset, max) {
  var ii = 0;
  var chars = [];
  var char = readChar(buffer, offset);
  while (char !== "|end|") {
    chars.push(char);
    char = readChar(buffer, offset + (++ii));
    if (ii > max) { break; }
  }
  return chars.join("");
}

function readBinaryString(buffer, offset, length) {
  var data = [];
  for (var ii = 0; ii < length; ++ii) {
    var char = readByte(buffer, offset + ii);
    data[ii] = String.fromCharCode(char);
  }
  return data.join("");
}

function readPalette(buffer, offset, uncmp) {
  if ( uncmp === void 0 ) uncmp = false;

  var colors = [];
  var palette = uncmp ? readBytes(buffer, offset, 0xfff) : LZ77(buffer, offset);
  for (var ii = 0; ii < palette.length; ++ii) {
    var value = palette[ii] | (palette[++ii] << 8);
    var color = decodePalette(value);
    colors[ii / 2 | 0] = color;
  }
  return colors;
}

function decodePalette(palette) {
  var r = ( palette & 0x1F ) << 3;
  var g = ( palette & 0x3E0 ) >> 2;
  var b = ( palette & 0x7C00 ) >> 7;
  return { r: r, g: g, b: b };
}

function readPixels(buffer, offset, palette, width, height, uncmp) {
  if ( uncmp === void 0 ) uncmp = false;

  var index = 0;
  var TILE_SIZE = 8;
  var pixels = new ImageData(width, height);
  var size = (width / TILE_SIZE) * (height / TILE_SIZE) | 0;
  var data = uncmp ? readBytes(buffer, offset, 0xfff) : LZ77(buffer, offset);
  for (var ii = 0; ii < size; ++ii) {
    var xx = (ii % (width / TILE_SIZE)) | 0;
    var yy = (ii / (width / TILE_SIZE)) | 0;
    for (var jj = 0; jj < TILE_SIZE * TILE_SIZE; ++jj) {
      var px = (jj % (TILE_SIZE)) | 0;
      var py = (jj / (TILE_SIZE)) | 0;
      var depth = 4;
      var pix = (index / (TILE_SIZE / depth)) | 0;
      var pixel = data[pix];
      if ((index & 1) === 0) { pixel &= 0x0F; }
      else { pixel = (pixel & 0xF0) >> depth; }
      if (pixel > 0) {
        var r = palette[pixel].r;
        var g = palette[pixel].g;
        var b = palette[pixel].b;
        var idx = (((py + (yy * TILE_SIZE)) * width + (px + (xx * TILE_SIZE))) | 0) * 4;
        pixels.data[idx + 0] = r;
        pixels.data[idx + 1] = g;
        pixels.data[idx + 2] = b;
        pixels.data[idx + 3] = 0xff;
      }
      index++;
    }
  }
  return pixels;
}

function decodePixels(data) {
  var out = [];
  for (var ii = 0; ii < data.length; ++ii) {
    out.push((data[ii] % 0x10) & 0x7f);
    out.push((data[ii] / 0x10) & 0x7f);
  }
  return out;
}

var Rom = function Rom(buffer, opt) {
  var this$1 = this;
  if ( opt === void 0 ) opt = {};

  this.options = opt;
  this.buffer = buffer;
  this.code = null;
  this.name = null;
  this.maker = null;
  this.names = {
    pkmn: "",
    pkmns: {},
    items: {},
    attacks: {}
  };
  this.graphics = {
    effects: {},
    items: {},
    pkmns: {
      back: {},
      front: {},
      icon: {}
    },
    doors: {},
    overworlds: {}
  };
  this.maps = {};
  this.animations = {};
  this.bankPointers = [];
  this.mapInBanksCount = [];
  return new Promise(function (resolve) {
    this$1.init().then(function () { return resolve(this$1); });
  });
};
Rom.prototype.init = function init (resolve) {
    var this$1 = this;

  var buffer = this.buffer;
  this.code = readBinaryString(buffer, OFFSETS.GAME_CODE, 4);
  this.name = readBinaryString(buffer, OFFSETS.GAME_NAME, 4);
  this.maker = readBinaryString(buffer, OFFSETS.GAME_MAKER, 2);
  assert(this.code === "BPEE"); // emerald rom
  return new Promise(function (resolve) {
    this$1.generateTables().then(resolve);
  });
  /*for (let ii = 1; ii < OFS.PKMN_COUNT; ++ii) {
    let pkmn = ii;
    let bisa_front = this.getPkmnFrontImgById(pkmn);
    let bisa_back = this.getPkmnBackImgById(pkmn);
    let bisa_front_anim = this.getPkmnFrontAnimationImgById(pkmn);
    let bisa_icon = this.getPkmnIconImgById(pkmn);
    document.body.appendChild(bisa_front.canvas);
    document.body.appendChild(bisa_front_anim.canvas);
    document.body.appendChild(bisa_back.canvas);
    document.body.appendChild(bisa_icon.canvas);
  };
  for (let ii = 1; ii < OFS.ITEM_COUNT; ++ii) {
    let item = this.getItemImageById(ii);
    document.body.appendChild(item.canvas);
  };
  for (let ii = 0; ii < OFS.OVERWORLD_COUNT; ++ii) {
    let sprite = this.getOverworldImgById(ii, 0);
    document.body.appendChild(sprite.canvas);
  };*/
};
Rom.prototype.generateTables = function generateTables () {
    var this$1 = this;

  var tasks = [];
  tasks.push(this.generatePkmnString, "Generating Pkmn String...");
  tasks.push(this.generateItemNameTable, "Generating Item Name Table...");
  tasks.push(this.generatePkmnNameTable, "Generating Pkmn Name Table...");
  tasks.push(this.generateAttackNameTable, "Generating Attack Name Table...");
  tasks.push(this.generatePkmnGraphicTable, "Generating Pkmn Graphic Table...");
  tasks.push(this.generateItemGraphicTable, "Generating Item Graphic Table...");
  tasks.push(this.generateFieldEffectGraphicTable, "Generating Field Effect Graphic Table...");
  tasks.push(this.generateOverworldGraphicTable, "Generating Overworld Graphic Table...");
  tasks.push(this.generateMaps, "Generating World Map...");
  tasks.push(function () {}, "Finished!");
  return new Promise(function (resolve) {
    var self = this$1;
    (function nextTask() {
      if (!tasks.length) { return; }
      var task = tasks.shift();
      var desc = tasks.shift();
      self.options.debug(desc);
      setTimeout(function () {
        task.call(self, []);
        !tasks.length ? resolve() : nextTask();
      });
    })();
  });
};
Rom.prototype.generateMaps = function generateMaps () {
    var this$1 = this;

  for (var ii = 0; ii < OFFSETS.MAP_BANK_POINTERS.length; ++ii) {
    this$1.mapInBanksCount[ii] = OFFSETS.MAPS_IN_BANK[ii];
    this$1.bankPointers[ii] = OFFSETS.MAP_BANK_POINTERS[ii];
  }
};
Rom.prototype.fetchMap = function fetchMap (bBank, bMap) {
  var id = bBank + ":" + bMap;
  return (
    this.maps[id] ||
    (this.maps[id] = this.generateMap(bBank, bMap))
  );
};
Rom.prototype.loadMapWithConnections = function loadMapWithConnections (bBank, bMap, deep) {
    var this$1 = this;

  var map = this.fetchMap(bBank, bMap);
  if (map.loaded) { return; }
  map.loaded = true;
  map.connections.map(function (con) {
    var conMap = this$1.fetchMap(con.bBank, con.bMap);
    switch (con.lType) {
      case OFFSETS.MAP_CONNECTION.DOWN:
        conMap.x = map.x + con.lOffset;
        conMap.y = map.y + map.height;
      break;
      case OFFSETS.MAP_CONNECTION.UP:
        conMap.x = map.x + con.lOffset;
        conMap.y = map.y - conMap.height;
      break;
      case OFFSETS.MAP_CONNECTION.LEFT:
        conMap.x = map.x - conMap.width;
        conMap.y = map.y + con.lOffset;
      break;
      case OFFSETS.MAP_CONNECTION.RIGHT:
        conMap.x = map.x + map.width;
        conMap.y = map.y + con.lOffset;
      break;
    }
    if (deep) { this$1.loadMapWithConnections(con.bBank, con.bMap, deep); }
    else { this$1.fetchMap(con.bBank, con.bMap); }
  });
};
Rom.prototype.generateMap = function generateMap (bank, map) {
    var this$1 = this;

  var buffer = this.buffer;
  var bankOffset = this.bankPointers[bank] + map * 4;
  var mapHeaderPointer = readPointer(buffer, bankOffset);
  var offset = mapHeaderPointer;

  // # HEADER
  var pMap = readPointer(buffer, offset); offset += 0x4;
  var pSprites = readPointer(buffer, offset); offset += 0x4;
  var pScript = readPointer(buffer, offset); offset += 0x4;
  var pConnect = readPointer(buffer, offset); offset += 0x4;
  var hSong = readWord(buffer, offset); offset += 0x2;
  var hMap = readWord(buffer, offset); offset += 0x2;

  var bLabelID = readByte(buffer, offset); offset += 0x1;
  var bFlash = readByte(buffer, offset); offset += 0x1;
  var bWeather = readByte(buffer, offset); offset += 0x1;
  var bType = readByte(buffer, offset); offset += 0x1;
  var bUnused1 = readByte(buffer, offset); offset += 0x1;
  var bUnused2 = readByte(buffer, offset); offset += 0x1;
  var bLabelToggle = readByte(buffer, offset); offset += 0x1;
  var bUnused3 = readByte(buffer, offset); offset += 0x1;
  var hdrSize = offset - mapHeaderPointer - 0x8000000;

  // # CONNECTION
  offset = intToPointer(pConnect);
  var pNumConnections = readPointer(buffer, offset); offset += 0x4;
  var pData = readPointer(buffer, offset); offset += 0x4;

  // NULL check, no map connections
  if (pConnect === 0x0) { pNumConnections = 0; }

  var connections = [];
  for (var ii = 0; ii < pNumConnections; ++ii) {
    offset = intToPointer(pData) + (ii * 0xc);
    var conn = {};
    conn.lType = readPointer(buffer, offset); offset += 0x4;
    conn.lOffset = readLong(buffer, offset); offset += 0x4;
    conn.bBank = readByte(buffer, offset); offset += 0x1;
    conn.bMap = readByte(buffer, offset); offset += 0x1;
    conn.wFiller = readWord(buffer, offset); offset += 0x2;
    connections.push(conn);
  }
  var originalSize = pNumConnections * 12;

  offset = pSprites &0x1FFFFFF;
  // # TILESET DATA
  var bNumNPCs = readByte(buffer, offset); offset += 0x1;
  var bNumExits = readByte(buffer, offset); offset += 0x1;
  var bNumTraps = readByte(buffer, offset); offset += 0x1;
  var bNumSigns = readByte(buffer, offset); offset += 0x1;
  var pNPCs = readPointer(buffer, offset); offset += 0x4;
  var pExits = readPointer(buffer, offset); offset += 0x4;
  var pTraps = readPointer(buffer, offset); offset += 0x4;
  var pSigns = readPointer(buffer, offset); offset += 0x4;

  var events = {
    npcs: [],
    exits: [],
    signs: []
  };

  // # MAP EXITS
  offset = pExits;
  for (var ii$1 = 0; ii$1 < bNumExits; ++ii$1) {
    var bX = readByte(buffer, offset); offset += 0x1;
    offset += 0x1;
    var bY = readByte(buffer, offset); offset += 0x1;
    offset += 0x2;
    var bWarp = readByte(buffer, offset); offset += 0x1;
    var bMap = readByte(buffer, offset); offset += 0x1;
    var bBank = readByte(buffer, offset); offset += 0x1;
    events.exits.push({
      x: bX, y: bY,
      warp: bWarp,
      map: bMap,
      bank: bBank
    });
  }

  // # MAP SIGNS
  offset = pSigns;
  for (var ii$2 = 0; ii$2 < bNumSigns; ++ii$2) {
    var bX$1 = readByte(buffer, offset); offset += 0x1;
    offset += 0x1;
    var bY$1 = readByte(buffer, offset); offset += 0x1;
    offset += 0x5;
    var pScript$1 = readPointer(buffer, offset); offset += 0x4;
    events.signs.push({
      x: bX$1, y: bY$1,
      script: pScript$1
    });
  }

  // #MAP NPCS
  offset = pNPCs;
  for (var ii$3 = 0; ii$3 < bNumNPCs; ++ii$3) {
    var npcID = readByte(buffer, offset); offset += 0x1;
    var imageID = readByte(buffer, offset); offset += 0x1;
    var replacement = readByte(buffer, offset); offset += 0x1;
    var filler_1 = readByte(buffer, offset); offset += 0x1;
    var positionX = readHWord(buffer, offset); offset += 0x2;
    var positionY = readHWord(buffer, offset); offset += 0x2;
    var level = readByte(buffer, offset); offset += 0x1;
    var behaviour = readByte(buffer, offset); offset += 0x1;
    var tempRadius = readByte(buffer, offset); offset += 0x1;
    var moveRadiusX = tempRadius & 15;
    var moveRadiusY = tempRadius >> 4;
    var filler_2 = readByte(buffer, offset); offset += 0x1;
    var property = readByte(buffer, offset); offset += 0x1;
    var filler_3 = readByte(buffer, offset); offset += 0x1;
    var viewRadius = readHWord(buffer, offset); offset += 0x2;
    var ptrScript = readPointer(buffer, offset); offset += 0x4;
    var flag = readHWord(buffer, offset); offset += 0x2;
    var filler_4 = readByte(buffer, offset); offset += 0x1;
    var filler_5 = readByte(buffer, offset); offset += 0x1;
    events.npcs.push({
      x: positionX, y: positionY,
      sprite: this$1.graphics.overworlds[imageID],
      movement: behaviour
    });
  }

  // # MAP DATA
  offset = pMap;
  var mapWidth = readPointer(buffer, offset); offset += 0x4;
  var mapHeight = readPointer(buffer, offset); offset += 0x4;
  var borderTilePtr = readPointer(buffer, offset); offset += 0x4;
  var mapTilesPtr = readPointer(buffer, offset); offset += 0x4;
  var pMajorTileset = readPointer(buffer, offset); offset += 0x4;
  var pMinorTileset = readPointer(buffer, offset); offset += 0x4;
  var borderWidth = 2; offset += 0x1;
  var borderHeight = 2; offset += 0x1;
  var secondarySize = borderWidth + 0xA0;

  var labelOffset = OFFSETS.MAP_LABEL_DATA + (bLabelID * 8);
  var pMapLabel = readPointer(buffer, labelOffset);
  var mapName = readString(buffer, pMapLabel);

  // # MAP DATA
  var tiles = [];
  var size = mapWidth * mapHeight;
  for (var ii$4 = 0; ii$4 < size; ++ii$4) {
    var xx = (ii$4 % mapWidth) | 0;
    var yy = (ii$4 / mapWidth) | 0;
    var index = (yy * mapWidth + xx) | 0;
    var tile = readWord(buffer, intToPointer(mapTilesPtr) + index * 2);
    tiles.push([tile & 0x3ff, (tile & 0xfc00) >> 10]);
  }

  // # MAP TILESETS [PRIMARY, SECONDARY]
  var majorTileset = this.readTilesetHeader(pMajorTileset, mapHeaderPointer);
  var minorTileset = this.readTilesetHeader(pMinorTileset, mapHeaderPointer);

  console.log(("Loading " + mapName + " [" + mapWidth + "x" + mapHeight + "], [" + (connections.length) + "] at " + (toHex(pMap))));

  var mainPalCount = OFFSETS.MAIN_TS_PAL_COUNT;
  var mainHeight = OFFSETS.MAIN_TS_HEIGHT;
  var localHeight = OFFSETS.LOCAL_TS_HEIGHT;
  var mainSize = OFFSETS.MAIN_TS_SIZE;
  var localSize = OFFSETS.LOCAL_TS_SIZE;
  var mainBlocks = OFFSETS.MAIN_TS_BLOCKS;
  var localBlocks = OFFSETS.LOCAL_TS_SIZE;

  // # RENDER MAP TILESETS [PRIMARY, SECONDARY]
  var tileData = this.createTileset(mapWidth, mapHeight, minorTileset, majorTileset);

  var tileSize = 16;

  var behavior = new Uint8Array(mapWidth * mapHeight);
  var background = new Uint8Array(mapWidth * mapHeight);
  var attributes = new Uint8Array(mapWidth * mapHeight);
  var animations = [
    [], []
  ];

  var doors = [];
  var layers = [
    createCanvasBuffer(mapWidth * tileSize, mapHeight * tileSize).ctx,
    createCanvasBuffer(mapWidth * tileSize, mapHeight * tileSize).ctx
  ];
  var bgb = createCanvasBuffer(mapWidth * tileSize, mapHeight * tileSize).ctx;
  var layerData = [
    tileData.layers.background,
    tileData.layers.foreground
  ];

  // # BORDER TILE
  var border = this.createBorderMap(mapWidth, mapHeight, borderTilePtr, layerData, connections);

  var frameBuffers = {};

  // # RENDER MAP
  offset = mapTilesPtr;
  for (var ll = 0; ll < layers.length; ++ll) {
    var ctx = layers[ll];
    var tileset = layerData[ll];
    for (var ii$5 = 0; ii$5 < mapWidth * mapHeight; ++ii$5) {
      var xx$1 = (ii$5 % mapWidth) | 0;
      var yy$1 = (ii$5 / mapWidth) | 0;
      var value = readShort(buffer, offset + ii$5 * 2);
      var tile$1 = value & 0x3FF;
      var attr = value >> 10;
      var tx = (tile$1 % 8) * tileSize;
      var ty = (((tile$1 / 8) | 0) * tileSize);
      var tindex = ty * tileset.canvas.width + tx;
      behavior[ii$5] = tileData.behavior[tindex];
      background[ii$5] = tileData.background[tindex];
      attributes[ii$5] = attr;
      // tile (4 tile based) is animated
      for (var jj = 0; jj < 4; ++jj) {
        var x = (jj % 2) | 0;
        var y = (jj / 2) | 0;
        var pos = this$1.getAnimationAt(tileData, ll, (tile$1 % 8) | 0, (tile$1 / 8) | 0, jj);
        if (pos !== -1) {
          var anim = tileData.animations[ll][pos];
          var frames = anim.data.length;
          // allocate framebuffer
          if (!frameBuffers[ll]) { frameBuffers[ll] = {}; }
          if (!frameBuffers[ll][frames]) {
            frameBuffers[ll][frames] = [];
            for (var kk = 0; kk < frames; ++kk) {
              var frame = createCanvasBuffer(mapWidth * 16, mapHeight * 16).ctx;
              frameBuffers[ll][frames].push(frame);
            }
          }
          for (var kk$1 = 0; kk$1 < frames; ++kk$1) {
            var frameBuffer = frameBuffers[ll][frames][kk$1];
            var mx = (xx$1 * 16) + (x * 8);
            var my = (yy$1 * 16) + (y * 8);
            frameBuffer.drawImage(
              anim.data[kk$1].canvas,
              0, 0,
              8, 8,
              mx, my,
              8, 8
            );
          }
        }
      }
      // block covered by hero
      if (
        (background[ii$5] === 0x10 && ll === 1)
      ) {
        bgb.drawImage(
          tileset.canvas,
          tx, ty,
          tileSize, tileSize,
          xx$1 * tileSize, (yy$1 * tileSize),
          tileSize, tileSize
        );
      } else {
        ctx.drawImage(
          tileset.canvas,
          tx, ty,
          tileSize, tileSize,
          xx$1 * tileSize, (yy$1 * tileSize),
          tileSize, tileSize
        );
      }
      if (ll === 0 && behavior[ii$5] === 0x69) {
        var anim$1 = this$1.getDoorAnimationByBlock(tile$1, minorTileset.palettePtr);
        if (anim$1 !== null) {
          doors.push({
            frame: 0,
            x: xx$1 * tileSize,
            y: yy$1 * tileSize,
            data: anim$1,
            isOpening: true,
            isClosing: false
          });
        }
        /*ctx.fillRect(
          xx * tileSize, (yy * tileSize),
          tileSize, tileSize
        );*/
      }
    }
  }

  layers.push(bgb);

  return {
    id: map,
    events: events,
    bank: bank,
    border: border.ctx,
    name: mapName,
    width: mapWidth,
    height: mapHeight,
    texture: layers,
    behavior: behavior,
    background: background,
    attributes: attributes,
    doors: doors,
    animations: frameBuffers,
    connections: connections,
    loaded: false, // anti recursion
    x: 0, y: 0
  };

};
Rom.prototype.getAnimationAt = function getAnimationAt (tileData, layer, x, y, index) {
  var animations = tileData.animations[layer];
  for (var ii = 0; ii < animations.length; ++ii) {
    var anim = animations[ii];
    if (anim.x === x && anim.y === y && anim.index === index && anim.layer === layer) { return ii; }
  }
  return -1;
};
Rom.prototype.createTileset = function createTileset (mapWidth, mapHeight, minorTileset, majorTileset) {
    var this$1 = this;

  var buffer = this.buffer;
  var offset = 0;
  var tileSize = 16;
  var width = mapWidth * tileSize;
  var height = mapHeight * tileSize;

  var majorPalettes = 96;

  var ctx = createCanvasBuffer(128, 2560).ctx;

  var paldata = [];

  // e.g. used to find secondary tileset relative animations
  var tileset = majorTileset.number + ":" + minorTileset.number;

  // # READ PALETTE
  offset = minorTileset.palettePtr;
  for (var ii = 0; ii < 208; ++ii) {
    var palette = readShort(buffer, offset); offset += 0x2;
    paldata[ii] = palette;
  }

  offset = majorTileset.palettePtr;
  for (var ii$1 = 0; ii$1 < 96; ++ii$1) {
    var palette$1 = readShort(buffer, offset); offset += 0x2;
    paldata[ii$1] = palette$1;
  }

  // # READ TILESET
  var blockLimits = [512, 512];
  var tilesetSize = [0x4000, 0x5000];
  var tilesetImageOffsets = [ majorTileset.tilesetImgPtr, minorTileset.tilesetImgPtr ];

  var tiles = [];
  for (var ii$2 = 0; ii$2 < 2; ++ii$2) {
    offset = tilesetImageOffsets[ii$2];
    var bytes = readBytes(buffer, offset, tilesetSize[ii$2]);
    var data = decodePixels(LZ77(bytes, 0));
    for (var jj = 0; jj < data.length; ++jj) { tiles.push(data[jj]); }
    if (ii$2 === 0 && tiles.length < 0x8000) {
      for (var ii$3 = 0; ii$3 < 640; ii$3++) { tiles.push(0x0); }
    }
  }

  // # DECODE PALETTES
  var palettes = [];
  for (var ii$4 = 0; ii$4 < 256; ++ii$4) {
    palettes[ii$4] = decodePalette(paldata[ii$4]);
  }

  // # DRAW TILESET
  var tilesetBlockDataOffset = [ majorTileset.blocksPtr, minorTileset.blocksPtr ];
  var tilesetBehaveDataOffset = [ majorTileset.behavePtr, minorTileset.behavePtr ];
  var x = 0; var y = 0;
  var posX = [0, 8, 0, 8];
  var posY = [0, 0, 8, 8];

  var bganimations = [];
  var fganimations = [];

  var cw = ctx.canvas.width; var ch = ctx.canvas.height;
  var backgroundImage = new ImageData(cw, ch);
  var foregroundImage = new ImageData(cw, ch);
  var backgroundPixels = backgroundImage.data;
  var foregroundPixels = foregroundImage.data;
  var offset2 = 0;
  var behaviorData = new Uint8Array(cw * ch);
  var backgroundData = new Uint8Array(cw * ch);
  for (var ts = 0; ts < 2; ++ts) {
    offset = tilesetBlockDataOffset[ts];
    offset2 = tilesetBehaveDataOffset[ts];
    for (var ii$5 = 0; ii$5 < blockLimits[ts]; ++ii$5) {
      for (var ly = 0; ly < 2; ++ly) { // 2, bg, fg
        var isBackground = ly === 0;
        var isForeground = ly === 1;
        var bytes$1 = readBytes(buffer, offset2 + ii$5 * 2, 2);
        var behavior = bytes$1[0];
        var background = bytes$1[1];
        for (var tt = 0; tt < 4; ++tt) { // 4 tile based
          var tile = readWord(buffer, offset); offset += 0x2;
          var tileIndex = tile & 0x3FF;
          var flipX = (tile & 0x400) >> 10;
          var flipY = (tile & 0x800) >> 11;
          var palIndex = (tile & 0xF000) >> 12;
          var tileSeeker = tileIndex * 64;
          if (tileSeeker + 64 > tiles.length) { continue; }
          var dx = x * tileSize + posX[tt];
          var dy = y * tileSize + posY[tt];
          if (behavior > 0) {
            behaviorData[dy * cw + dx] = behavior;
          }
          if (background > 0) {
            backgroundData[dy * cw + dx] = background;
          }
          var anim = this$1.getTileAnimation(tileIndex, tileset);
          // tile is animated
          if (anim !== null) {
            var data$1 = this$1.getAnimationTileImg(anim, tileIndex, palIndex, flipX, flipY, minorTileset, majorTileset);
            var animLayer = isForeground ? fganimations : bganimations;
            var offset$1 = anim.offset;
            animLayer.push({
              x: x, y: y,
              data: data$1,
              layer: ly,
              tile: offset$1,
              index: tt,
              interval: anim.interval || -1
            });
          }
          var xx = 0; var yy = 0;
          for (var px = 0; px < 64; ++px) {
            var pixel = tiles[tileSeeker + px];
            if (pixel > 0) {
              var color = palettes[pixel + (palIndex * 16)];
              var ddx = (dx + (flipX > 0 ? (-xx + 7) : xx));
              var ddy = (dy + (flipY > 0 ? (-yy + 7) : yy));
              var index = 4 * (ddy * cw + ddx);
              if (isBackground) {
                backgroundPixels[index + 0] = color.r;
                backgroundPixels[index + 1] = color.g;
                backgroundPixels[index + 2] = color.b;
                backgroundPixels[index + 3] = 0xff;
              } else {
                foregroundPixels[index + 0] = color.r;
                foregroundPixels[index + 1] = color.g;
                foregroundPixels[index + 2] = color.b;
                foregroundPixels[index + 3] = 0xff;
              }
            }
            xx++; if (xx === 8) { xx = 0; yy++; }
          }
        }
      }
      if ((++x) === 8) { x = 0; y++; }
    }
  }

  var bg = createCanvasBuffer(128, 2560).ctx;
  var fg = createCanvasBuffer(128, 2560).ctx;

  bg.putImageData(backgroundImage, 0, 0);
  fg.putImageData(foregroundImage, 0, 0);
  //document.body.appendChild(ctx.canvas);
  return {
    behavior: behaviorData,
    background: backgroundData,
    layers: {
      background: bg,
      foreground: fg
    },
    animations: [ bganimations, fganimations ],
    canvas: ctx.canvas
  };
};
Rom.prototype.createBorderMap = function createBorderMap (mapWidth, mapHeight, borderTilePtr, layerData, connections) {
  var buffer = this.buffer;
  var bw = 2; var bh = 2;
  var tileSize = 16;
  var borderTile = createCanvasBuffer(bw * tileSize, bh * tileSize);
  var offset = borderTilePtr;
  for (var ll = 0; ll < 2; ++ll) {
    var tileset = layerData[ll];
    for (var ii = 0; ii < bw * bh; ++ii) {
      var xx = (ii % bw) | 0;
      var yy = (ii / bw) | 0;
      var value = readShort(buffer, offset + ii * 2);
      var tile = value & 0x3ff;
      var srcX = (tile % 8) * tileSize;
      var srcY = ((tile / 8) | 0) * tileSize;
      var destX = xx * tileSize;
      var destY = yy * tileSize;
      borderTile.ctx.drawImage(
        tileset.canvas,
        srcX, srcY,
        tileSize, tileSize,
        destX, destY,
        tileSize, tileSize
      );
    }
  }
  var padding = 8;
  var halfpad = padding / 2;
  var mw = mapWidth + (padding * 2);
  var mh = mapHeight + (padding * 2);
  var border = createCanvasBuffer(mw * tileSize, mh * tileSize);
  // just fill everything with the border tile
  for (var ii$1 = 0; ii$1 < mw * mh; ++ii$1) {
    var xx$1 = (ii$1 % mw) | 0;
    var yy$1 = (ii$1 / mw) | 0;
    border.ctx.drawImage(
      borderTile.canvas,
      0, 0,
      32, 32,
      (xx$1 * 32), (yy$1 * 32),
      32, 32
    );
  }
  // clear the border parts where it slices a connection
  if (hasConnection(connections, DIR.DOWN)) {
    border.ctx.clearRect(0, (mh * tileSize) - (halfpad * 32), (mapWidth * 32), (halfpad * 32));
  }
  if (hasConnection(connections, DIR.UP)) {
    border.ctx.clearRect(0, 0, (mapWidth * 32), (halfpad * 32));
  }
  if (hasConnection(connections, DIR.LEFT)) {
    border.ctx.clearRect(0, 0, (halfpad * 32), (mapHeight * 32));
  }
  if (hasConnection(connections, DIR.RIGHT)) {
    border.ctx.clearRect((mw * tileSize) - (halfpad * 32), 0, (halfpad * 32), (mapHeight * 32));
  }
  return border;
};
Rom.prototype.getAnimationTileImg = function getAnimationTileImg (anim, tileIndex, palIndex, flipX, flipY, minorTileset, majorTileset) {
    var this$1 = this;

  var frames = [];
  var index = (tileIndex - anim.offset);
  var tileset = (anim.tileset ? minorTileset : majorTileset).palettePtr;
  var palette = tileset + (palIndex * 0x20);
  var tileFrame = index % 0x4;
  var tileX = (index / 0x4) | 0;
  var length = anim.animations.length;
  var isFlipped = flipX || flipY;
  for (var ii = 0; ii < length; ++ii) {
    var index$1 = 0;
    var offset = 0;
    // special animation
    if (anim.interval !== void 0) {
      index$1 = (tileIndex - anim.offset) % 0x4;
      offset = anim.animations[((length - ii) + tileX) % length];
    // default animation
    } else {
      offset = anim.animations[ii];
      index$1 = (tileIndex - anim.offset);
    }
    var location = (offset + (index$1 * 0x20));
    // try to grab a cached tile version
    // only cache unflipped tiles
    var cached = this$1.animations[location] || null;
    if (cached !== null && !isFlipped) {
      frames.push(cached);
      continue;
    }
    var pal = readPalette(this$1.buffer, palette, true);
    var tile = readPixels(this$1.buffer, location, pal, 0x8, 0x8, true);
    var buffer = createCanvasBuffer(0x8, 0x8).ctx;
    buffer.putImageData(tile, 0, 0);
    if (flipX) {
      var img = createCanvasBuffer(0x8, 0x8).ctx;
      img.scale(-1, 1);
      img.drawImage(buffer.canvas, 0, 0, -0x8, 0x8);
      buffer = img;
    }
    if (flipY) {
      var img$1 = createCanvasBuffer(0x8, 0x8).ctx;
      img$1.scale(1, -1);
      img$1.drawImage(buffer.canvas, 0, 0, 0x8, -0x8);
      buffer = img$1;
    }
    // cache the tile for future access
    if (!isFlipped) { this$1.animations[location] = buffer; }
    frames.push(buffer);
  }
  return frames;
};
// checks if a tile lies inside a
// tileset animation offset range
Rom.prototype.getTileAnimation = function getTileAnimation (offset, tileset) {
  var animations = OFFSETS.TILESET_PRIMARY_ANIMATIONS;
  var sanimations = OFFSETS.TILESET_SECONDARY_ANIMATIONS;
  return null;
  // primary animations
  for (var ii = 0; ii < animations.length; ++ii) {
    var anim = animations[ii];
    var start = anim.offset;
    var end = start + anim.size;
    if (offset >= start && offset < end) { return anim; }
  }
  // secondary non-special animations
  for (var ii$1 = 0; ii$1 < sanimations.length; ++ii$1) {
    var anim$1 = sanimations[ii$1];
    if (anim$1.tileset !== tileset) { continue; }
    if (anim$1.interval !== void 0) { continue; }
    var start$1 = anim$1.offset;
    var end$1 = start$1 + anim$1.size;
    if (offset >= start$1 && offset < end$1) { return anim$1; }
  }
  // secondary special animations
  for (var ii$2 = 0; ii$2 < sanimations.length; ++ii$2) {
    var anim$2 = sanimations[ii$2];
    if (anim$2.tileset !== tileset) { continue; }
    if (anim$2.interval === void 0) { continue; }
    for (var jj = 0; jj < anim$2.animations.length; ++jj) {
      var start$2 = anim$2.offset + ((jj % 8) * anim$2.interval);
      var end$2 = start$2 + anim$2.size;
      if (offset >= start$2 && offset < end$2) { return anim$2; }
    }
  }
  return null;
};
Rom.prototype.readTilesetHeader = function readTilesetHeader (offset, tilesetHeader) {
  var buffer = this.buffer;
  var object = {};
  object.compressed = readByte(buffer, offset); offset += 0x1;
  object.primary = readByte(buffer, offset); offset += 0x1;
  offset += 2; // unknown
  object.tilesetImgPtr = readPointer(buffer, offset); offset += 0x4;
  object.palettePtr = readPointer(buffer, offset); offset += 0x4;
  object.blocksPtr = readPointer(buffer, offset); offset += 0x4;
  object.behavePtr = readPointer(buffer, offset); offset += 0x4;
  object.animPtr = readPointer(buffer, offset); offset += 0x4;
  object.number = ((offset - 0x3DF704 + 8) / 0x18) - 1 | 0;
  return object;
};
Rom.prototype.getPkmnString = function getPkmnString () {
  var buffer = this.buffer;
  var string = readString(buffer, OFFSETS.PKMN_STRING);
  return string.substring(0, 7);
};
Rom.prototype.getImage = function getImage (s, p, x, y, w, h, compressed) {
    if ( compressed === void 0 ) compressed = false;

  var buffer = this.buffer;
  var ctx = createCanvasBuffer(w + x, h + y).ctx;
  var palette = readPalette(buffer, p, !!compressed);
  var pixels = readPixels(buffer, s, palette, w, h, !!compressed);
  ctx.putImageData(pixels, x, y);
  return {
    canvas: ctx.canvas,
    data: new Uint8Array(pixels.data)
  };
};
Rom.prototype.getOverworldImgById = function getOverworldImgById (id, frame) {
  var buffer = this.buffer;
  var offset = (OFFSETS.OVERWORLD_BANK + (id * 36));
  offset += 4; // skip ffff
  var paletteNum = readByte(buffer, offset - 2); offset += 0x1;
  offset += 0x3; // unknown
  var width = readByte(buffer, offset); offset += 0x1;
  offset += 0x1; // unknown
  var height = readByte(buffer, offset); offset += 0x1;
  offset += 0x1; // unknown
  offset += 0x1; // unknown
  offset += 0x3; // unknown
  offset += 0x4; // unknown ptr
  offset += 0x4; // unknown ptr
  offset += 0x4; // unknown ptr
  var spritePtr = readPointer(buffer, offset); offset += 0x4;

  // get palette, weird stuff
  var palettePtr = 0;
  for (var ii = 0; ii < OFFSETS.OVERWORLD_PAL_COUNT; ++ii) {
    var index = OFFSETS.OVERWORLD_PAL_HEADERS + (ii * 8);
    if (readByte(buffer, index + 4) === paletteNum) {
      palettePtr = readLong(buffer, index) - 0x8000000;
    }
  }

  var pixels = readPointer(buffer, spritePtr + (8 * frame));
  var palette = palettePtr;
  return this.getImage(pixels, palette, 0, 0, width, height, true);
};
Rom.prototype.getPkmnFrontImgById = function getPkmnFrontImgById (id) {
  var buffer = this.buffer;
  var pixels = readPointer(buffer, OFFSETS.PKMN_FRONT_IMG + id * 8);
  var palette = readPointer(buffer, OFFSETS.PKMN_NORMAL_PAL + id * 8);
  return this.getImage(pixels, palette, 0, 0, 64, 64);
};
Rom.prototype.getPkmnBackImgById = function getPkmnBackImgById (id) {
  var buffer = this.buffer;
  var pixels = readPointer(buffer, OFFSETS.PKMN_BACK_IMG + id * 8);
  var palette = readPointer(buffer, OFFSETS.PKMN_NORMAL_PAL + id * 8);
  return this.getImage(pixels, palette, 0, 0, 64, 64);
};
Rom.prototype.getPkmnFrontAnimationImgById = function getPkmnFrontAnimationImgById (id) {
  var buffer = this.buffer;
  var pixels = readPointer(buffer, OFFSETS.PKMN_FRONT_ANIM + id * 8);
  var palette = readPointer(buffer, OFFSETS.PKMN_NORMAL_PAL + id * 8);
  return this.getImage(pixels, palette, 0, -64, 64, 128);
};
Rom.prototype.getPkmnIconImgById = function getPkmnIconImgById (id) {
  var buffer = this.buffer;
  var pixels = readPointer(buffer, OFFSETS.ICON_POINTER_TBL + (id * 4));
  var poffset = OFFSETS.ICON_PALS + (readByte(buffer, OFFSETS.ICON_PAL_TABLE + id) * 32);
  return this.getImage(pixels, poffset, 0, 0, 32, 64, true);
};
Rom.prototype.getItemImageById = function getItemImageById (id) {
  var buffer = this.buffer;
  if (id === 139) {
    //console.log(readPointer(buffer, OFS.ITEM_IMG + id * 8), toHex(readPointer(buffer, OFS.ITEM_IMG + id * 8)));
  }
  var pixels = readPointer(buffer, OFFSETS.ITEM_IMG + id * 8);
  var palette = readPointer(buffer, OFFSETS.ITEM_IMG + (id * 8) + 4);
  return this.getImage(pixels, palette, 0, 0, 24, 24);
};
Rom.prototype.getItemNameById = function getItemNameById (id) {
  var buffer = this.buffer;
  var offset = OFFSETS.ITEM_DATA + id * 44;
  return readString(buffer, offset);
};
Rom.prototype.getAttackNameById = function getAttackNameById (id) {
  var buffer = this.buffer;
  var offset = OFFSETS.ATTACK_NAMES + id * 13;
  return readString(buffer, offset);
};
Rom.prototype.getPkmnNameById = function getPkmnNameById (id) {
  var offset = id * 11;
  var buffer = this.buffer;
  return readString(buffer, OFFSETS.PKMN_NAMES + offset)
};
Rom.prototype.getPkmnCryById = function getPkmnCryById (id) {
  var buffer = this.buffer;
  var cryTbl1 = OFFSETS.CRY_TABLE;
  var cryTbl2 = OFFSETS.CRY_TABLE2;
  var cryConvTbl = OFFSETS.CRY_CONVERSION_TABLE;
  var offset = readPointer(buffer, cryTbl1 + (id * 12) + 4);
  var compressed = 0x1;
  var looped = 0x4000;
  var sampleRate = readInt(buffer, offset + 4) >> 10;
  var loopStart = readInt(buffer, offset + 8);
  var size = readInt(buffer, offset + 12) + 1;
  var bytes = [];
  for (var ii = 0; ii < size; ++ii) {
    var byte = readByte(buffer, offset + 16 + ii);
    bytes.push(byte);
  }
  return bytes;
};
Rom.prototype.generatePkmnString = function generatePkmnString () {
  var string = this.getPkmnString();
  this.names.pkmn = string;
};
Rom.prototype.generateAttackNameTable = function generateAttackNameTable () {
    var this$1 = this;

  var table = this.names.attacks;
  for (var ii = 1; ii <= OFFSETS.ATTACK_COUNT; ++ii) {
    var atk = this$1.getAttackNameById(ii);
    table[ii] = atk;
  }
};
Rom.prototype.generatePkmnNameTable = function generatePkmnNameTable () {
    var this$1 = this;

  var table = this.names.pkmns;
  for (var ii = 1; ii <= OFFSETS.PKMN_COUNT; ++ii) {
    var name = this$1.getPkmnNameById(ii);
    table[ii] = name;
  }
};
Rom.prototype.generatePkmnGraphicTable = function generatePkmnGraphicTable () {
    var this$1 = this;

  var table = this.graphics.pkmns;
  for (var ii = 1; ii <= OFFSETS.PKMN_COUNT; ++ii) {
    var icon = this$1.getPkmnIconImgById(ii);
    var back = this$1.getPkmnBackImgById(ii);
    var front = this$1.getPkmnFrontImgById(ii);
    table.icon[ii] = icon;
    table.back[ii] = back;
    table.front[ii] = front;
  }
};
Rom.prototype.generateItemNameTable = function generateItemNameTable () {
    var this$1 = this;

  var table = this.names.items;
  for (var ii = 1; ii <= OFFSETS.ITEM_COUNT; ++ii) {
    var name = this$1.getItemNameById(ii);
    table[ii] = name;
  }
};
Rom.prototype.generateItemGraphicTable = function generateItemGraphicTable () {
    var this$1 = this;

  var table = this.graphics.items;
  for (var ii = 1; ii <= OFFSETS.ITEM_COUNT; ++ii) {
    var item = this$1.getItemImageById(ii);
    table[ii] = item;
  }
};
Rom.prototype.generateFieldEffectGraphicTable = function generateFieldEffectGraphicTable () {
    var this$1 = this;

  var table = this.graphics.effects;
  var palettes = OFFSETS.FIELD_EFFECT_PAL;
  var imgs = OFFSETS.FIELD_EFFECT_IMGS;
  for (var ii = 0; ii < imgs.length; ++ii) {
    var item = imgs[ii];
    var img = this$1.getFieldEffect(item[0], palettes[item[1]], item[2], item[3]);
    table[ii] = img;
    //ows.appendChild(img.canvas);
  }
};
Rom.prototype.getFieldEffect = function getFieldEffect (id, pal, w, h) {
  var buffer = this.buffer;
  var baseOffset = OFFSETS.FIELD_EFFECT_HEADER;
  var basePtr = readPointer(buffer, baseOffset + (id * 0x4));
  var offset = basePtr;
  var tilesTag = readShort(buffer, offset); offset += 0x2;
  var paletteTag = readShort(buffer, offset); offset += 0x2;
  var baseOamPtr = readPointer(buffer, offset); offset += 0x4;
  var animTablePtr = readPointer(buffer, offset); offset += 0x4;
  var imgPtr = readPointer(buffer, offset); offset += 0x4;
  var dummyAffine = readPointer(buffer, offset); offset += 0x4;
  var oamc = readPointer(buffer, offset); offset += 0x4;
  var picTable = readPointer(buffer, imgPtr);
  var pixels = picTable;
  var palette = pal;
  return this.getImage(pixels, palette, 0, 0, w, h, true);
};
Rom.prototype.getDoorAnimationByBlock = function getDoorAnimationByBlock (block, palette) {
    var this$1 = this;

  var buffer = this.buffer;
  for (var ii = 0; ii < 53; ++ii) {
    var doorAnimHeader = OFFSETS.DOOR_ANIM_HEADER + (ii * 0xc);
    var blockNumber = readShort(buffer, doorAnimHeader);
    if (block === blockNumber) {
      return this$1.getDoorAnimationById(ii, palette);
    }
  }
  return null;
};
Rom.prototype.getDoorAnimationById = function getDoorAnimationById (id, palette) {
  var buffer = this.buffer;
  var minorTsPalPtr = palette;
  var baseAnimHeader = OFFSETS.DOOR_ANIM_HEADER;
  var doorAnimHeader = baseAnimHeader + (id * 0xc);
  var paletteOffset = readPointer(buffer, doorAnimHeader + 0x8);
  var paletteNum = readByte(buffer, paletteOffset);
  var imageOffset = readPointer(buffer, doorAnimHeader + 0x4);
  var blockNumber = readShort(buffer, doorAnimHeader);
  var palOffset = minorTsPalPtr + (paletteNum * 32);
  return this.getImage(imageOffset, palOffset, 0, 0, 16, 96, true);
};
Rom.prototype.generateOverworldGraphicTable = function generateOverworldGraphicTable () {
    var this$1 = this;

  var table = this.graphics.overworlds;
  for (var ii = 0; ii < OFFSETS.OVERWORLD_COUNT; ++ii) {
    var frames = getMaxFrame(ii);
    table[ii] = [];
    for (var frm = 0; frm <= frames; ++frm) {
      var sprite = this$1.getOverworldImgById(ii, frm);
      table[ii].push(sprite);
      if (frames >= 8 && isFrameMirrorable(frm)) {
        var sprite$1 = this$1.getOverworldImgById(ii, frm);
        var ctx = createCanvasBuffer(sprite$1.canvas.width, sprite$1.canvas.height).ctx;
        ctx.setTransform(-1, 0, 0, 1, sprite$1.canvas.width, 0);
        ctx.drawImage(
          sprite$1.canvas,
          0, 0
        );
        sprite$1.canvas = ctx.canvas;
        table[ii].push(sprite$1);
      }
        
    }
    if (frames >= 8) {
      this$1.swapOverworldSprites(table[ii], 9, 10);
      this$1.swapOverworldSprites(table[ii], 21, 22);
    }
    //if (ii === 0) table[ii].map((sprite) => ows.appendChild(sprite.canvas));
  }
};
Rom.prototype.swapOverworldSprites = function swapOverworldSprites (sprites, a, b) {
  var tmp = sprites[a];
  sprites[a] = sprites[b];
  sprites[b] = tmp;
};



window.Rom = Rom;

return Rom;

}());
