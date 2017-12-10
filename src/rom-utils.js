import {
  assert
} from "./utils";

import {
  readByte,
  readChar,
  readString
} from "./rom-read";

import {
  DIR,
  OFFSETS as OFS
} from "./offsets";

export function LZ77(source, offset) {
  assert(source[offset] === OFS.LZ77_10);
  let length = (
    (readByte(source, offset + 0) << 0) |
    (readByte(source, offset + 1) << 8) |
    (readByte(source, offset + 2) << 16)
  ) >> 8;
  let destination = new Uint8Array(length);

  let xIn = offset + 4;
  let xOut = 0;
  let xLen = destination.length;
  while (xLen > 0) {
    let d = source[xIn++];
    for (let ii = 0; ii < 8; ++ii) {
      if ((d & 0x80) !== 0) {
        let data = source[xIn] << 8 | source[xIn + 1];
        xIn += 2;
        let length = (data >> 12) + 3;
        let offset = (data & 0xFFF);
        let windowsOffset = xOut - offset - 1;
        for (let j = 0; j < length; j++) {
          destination[xOut++] = destination[windowsOffset++];
          xLen--;
          if (xLen === 0) return destination;
        }
      } else {
        destination[xOut++] = source[xIn++];
        xLen--;

        if (xLen === 0) return destination;
      }

      d = ((d << 1) & 0xFF);
    }
  };
};

export function toHex(n) {
  return "0x" + (n).toString(16).toUpperCase();
};

export function searchString(buffer, string) {
  let offset = 0x0;
  while (offset < buffer.length) {
    for (let ii = 0; ii < string.length; ++ii) {
      let char = readChar(buffer, offset + ii);
      if (char !== string[ii]) break;
      if (ii + 1 >= string.length) {
        return offset;
      }
    };
    offset++;
  };
  return -1;
};

export function hasConnection(connections, dir) {
  for (let ii = 0; ii < connections.length; ++ii) {
    let con = connections[ii];
    switch (con.lType) {
      case OFS.MAP_CONNECTION.LEFT:
        if (dir === DIR.LEFT) return true;
      break;
      case OFS.MAP_CONNECTION.UP:
        if (dir === DIR.UP) return true;
      break;
      case OFS.MAP_CONNECTION.RIGHT:
        if (dir === DIR.RIGHT) return true;
      break;
      case OFS.MAP_CONNECTION.DOWN:
        if (dir === DIR.DOWN) return true;
      break;
    };
  };
  return false;
};

export function decodeCharByte(byte) {
  switch (byte) {
    case 0x00: return ` `;
    case 0x01: return `À`;
    case 0x02: return `Á`;
    case 0x03: return `Â`;
    case 0x04: return `Ç`;
    case 0x05: return `È`;
    case 0x06: return `É`;
    case 0x07: return `Ê`;
    case 0x08: return `Ë`;
    case 0x09: return `Ì`;
    case 0x0B: return `Î`;
    case 0x0C: return `Ï`;
    case 0x0D: return `Ò`;
    case 0x0E: return `Ó`;
    case 0x0F: return `Ô`;
    case 0x10: return `Œ`;
    case 0x11: return `Ù`;
    case 0x12: return `Ú`;
    case 0x13: return `Û`;
    case 0x14: return `Ñ`;
    case 0x15: return `ß`;
    case 0x16: return `à`;
    case 0x17: return `á`;
    case 0x19: return `ç`;
    case 0x1A: return `è`;
    case 0x1B: return `é`;
    case 0x1C: return `ê`;
    case 0x1D: return `ë`;
    case 0x1E: return `ì`;
    case 0x20: return `î`;
    case 0x21: return `ï`;
    case 0x22: return `ò`;
    case 0x23: return `ó`;
    case 0x24: return `ô`;
    case 0x25: return `œ`;
    case 0x26: return `ù`;
    case 0x27: return `ú`;
    case 0x28: return `û`;
    case 0x29: return `ñ`;
    case 0x2A: return `º`;
    case 0x2B: return `ª`;
    case 0x2D: return `&`;
    case 0x2E: return `+`;
    case 0x34: return `[Lv]`;
    case 0x35: return `=`;
    case 0x36: return `;`;
    case 0x51: return `¿`;
    case 0x52: return `¡`;
    case 0x53: return `[pk]`;
    case 0x54: return `[mn]`;
    case 0x55: return `[po]`;
    case 0x56: return `[ké]`;
    case 0x57: return `[bl]`;
    case 0x58: return `[oc]`;
    case 0x59: return `[k]`;
    case 0x5A: return `Í`;
    case 0x5B: return `%`;
    case 0x5C: return `(`;
    case 0x5D: return `)`;
    case 0x68: return `â`;
    case 0x6F: return `í`;
    case 0x79: return `[U]`;
    case 0x7A: return `[D]`;
    case 0x7B: return `[L]`;
    case 0x7C: return `[R]`;
    case 0x85: return `<`;
    case 0x86: return `>`;
    case 0xA1: return `0`;
    case 0xA2: return `1`;
    case 0xA3: return `2`;
    case 0xA4: return `3`;
    case 0xA5: return `4`;
    case 0xA6: return `5`;
    case 0xA7: return `6`;
    case 0xA8: return `7`;
    case 0xA9: return `8`;
    case 0xAA: return `9`;
    case 0xAB: return `!`;
    case 0xAC: return `?`;
    case 0xAD: return `.`;
    case 0xAE: return `-`;
    case 0xAF: return `·`;
    case 0xB0: return `...`;
    case 0xB1: return `«`;
    case 0xB2: return `»`;
    case 0xB3: return `'`;
    case 0xB4: return `'`;
    case 0xB5: return `|m|`;
    case 0xB6: return `|f|`;
    case 0xB7: return `$`;
    case 0xB8: return `,`;
    case 0xB9: return `*`;
    case 0xBA: return `/`;
    case 0xBB: return `A`;
    case 0xBC: return `B`;
    case 0xBD: return `C`;
    case 0xBE: return `D`;
    case 0xBF: return `E`;
    case 0xC0: return `F`;
    case 0xC1: return `G`;
    case 0xC2: return `H`;
    case 0xC3: return `I`;
    case 0xC4: return `J`;
    case 0xC5: return `K`;
    case 0xC6: return `L`;
    case 0xC7: return `M`;
    case 0xC8: return `N`;
    case 0xC9: return `O`;
    case 0xCA: return `P`;
    case 0xCB: return `Q`;
    case 0xCC: return `R`;
    case 0xCD: return `S`;
    case 0xCE: return `T`;
    case 0xCF: return `U`;
    case 0xD0: return `V`;
    case 0xD1: return `W`;
    case 0xD2: return `X`;
    case 0xD3: return `Y`;
    case 0xD4: return `Z`;
    case 0xD5: return `a`;
    case 0xD6: return `b`;
    case 0xD7: return `c`;
    case 0xD8: return `d`;
    case 0xD9: return `e`;
    case 0xDA: return `f`;
    case 0xDB: return `g`;
    case 0xDC: return `h`;
    case 0xDD: return `i`;
    case 0xDE: return `j`;
    case 0xDF: return `k`;
    case 0xE0: return `l`;
    case 0xE1: return `m`;
    case 0xE2: return `n`;
    case 0xE3: return `o`;
    case 0xE4: return `p`;
    case 0xE5: return `q`;
    case 0xE6: return `r`;
    case 0xE7: return `s`;
    case 0xE8: return `t`;
    case 0xE9: return `u`;
    case 0xEA: return `v`;
    case 0xEB: return `w`;
    case 0xEC: return `x`;
    case 0xED: return `y`;
    case 0xEE: return `z`;
    case 0xEF: return `|>|`;
    case 0xF0: return `:`;
    case 0xF1: return `Ä`;
    case 0xF2: return `Ö`;
    case 0xF3: return `Ü`;
    case 0xF4: return `ä`;
    case 0xF5: return `ö`;
    case 0xF6: return `ü`;
    case 0xF7: return `|A|`;
    case 0xF8: return `|V|`;
    case 0xF9: return `|<|`;
    case 0xFA: return `|nb|`;
    case 0xFB: return `|nb2|`;
    case 0xFC: return `|FC|`;
    case 0xFD: return `|FD|`;
    case 0xFE: return `|br|`;
    case 0xFF: return `|end|`;
  };
  return "";
};

export function getMaxFrame(index) {
  return OFS.OVERWORLD_FRAME_LIMITS[index];
};

export function isFrameMirrorable(frame) {
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
  };
  return false;
};
