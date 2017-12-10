import {
  assert,
  createCanvasBuffer
} from "./utils";

import {
  PTR,
  readInt,
  readLong,
  readChar,
  readWord,
  readHWord,
  readShort,
  readByte,
  readBytes,
  readString,
  readPointer,
  readPointerAsInt,
  readBinaryString,
  readPalette,
  readPixels,
  intToPointer,
  decodePixels,
  decodePalette
} from "./rom-read";

import {
  LZ77,
  toHex,
  getMaxFrame,
  searchString,
  hasConnection,
  isFrameMirrorable
} from "./rom-utils";

import {
  DIR,
  OFFSETS as OFS
} from "./offsets";

export default class Rom {
  constructor(buffer, opt = {}) {
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
    return new Promise((resolve) => {
      this.init().then(() => resolve(this));
    });
  }
  init(resolve) {
    let buffer = this.buffer;
    this.code = readBinaryString(buffer, OFS.GAME_CODE, 4);
    this.name = readBinaryString(buffer, OFS.GAME_NAME, 4);
    this.maker = readBinaryString(buffer, OFS.GAME_MAKER, 2);
    assert(this.code === "BPEE"); // emerald rom
    return new Promise((resolve) => {
      this.generateTables().then(resolve);
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
  }
  generateTables() {
    let tasks = [];
    tasks.push(this.generatePkmnString, `Generating Pkmn String...`);
    tasks.push(this.generateItemNameTable, `Generating Item Name Table...`);
    tasks.push(this.generatePkmnNameTable, `Generating Pkmn Name Table...`);
    tasks.push(this.generateAttackNameTable, `Generating Attack Name Table...`);
    tasks.push(this.generatePkmnGraphicTable, `Generating Pkmn Graphic Table...`);
    tasks.push(this.generateItemGraphicTable, `Generating Item Graphic Table...`);
    tasks.push(this.generateFieldEffectGraphicTable, `Generating Field Effect Graphic Table...`);
    tasks.push(this.generateOverworldGraphicTable, `Generating Overworld Graphic Table...`);
    tasks.push(this.generateMaps, `Generating World Map...`);
    tasks.push(() => {}, `Finished!`);
    return new Promise((resolve) => {
      let self = this;
      (function nextTask() {
        if (!tasks.length) return;
        let task = tasks.shift();
        let desc = tasks.shift();
        self.options.debug(desc);
        setTimeout(() => {
          task.call(self, []);
          !tasks.length ? resolve() : nextTask();
        });
      })();
    });
  }
  generateMaps() {
    for (let ii = 0; ii < OFS.MAP_BANK_POINTERS.length; ++ii) {
      this.mapInBanksCount[ii] = OFS.MAPS_IN_BANK[ii];
      this.bankPointers[ii] = OFS.MAP_BANK_POINTERS[ii];
    };
  }
  fetchMap(bBank, bMap) {
    let id = bBank + ":" + bMap;
    return (
      this.maps[id] ||
      (this.maps[id] = this.generateMap(bBank, bMap))
    );
  }
  loadMapWithConnections(bBank, bMap, deep) {
    let map = this.fetchMap(bBank, bMap);
    if (map.loaded) return;
    map.loaded = true;
    map.connections.map(con => {
      let conMap = this.fetchMap(con.bBank, con.bMap);
      switch (con.lType) {
        case OFS.MAP_CONNECTION.DOWN:
          conMap.x = map.x + con.lOffset;
          conMap.y = map.y + map.height;
        break;
        case OFS.MAP_CONNECTION.UP:
          conMap.x = map.x + con.lOffset;
          conMap.y = map.y - conMap.height;
        break;
        case OFS.MAP_CONNECTION.LEFT:
          conMap.x = map.x - conMap.width;
          conMap.y = map.y + con.lOffset;
        break;
        case OFS.MAP_CONNECTION.RIGHT:
          conMap.x = map.x + map.width;
          conMap.y = map.y + con.lOffset;
        break;
      };
      if (deep) this.loadMapWithConnections(con.bBank, con.bMap, deep);
      else this.fetchMap(con.bBank, con.bMap);
    });
  }
  generateMap(bank, map) {
    let buffer = this.buffer;
    let bankOffset = this.bankPointers[bank] + map * 4;
    let mapHeaderPointer = readPointer(buffer, bankOffset);
    let offset = mapHeaderPointer;

    // # HEADER
    let pMap = readPointer(buffer, offset); offset += 0x4;
    let pSprites = readPointer(buffer, offset); offset += 0x4;
    let pScript = readPointer(buffer, offset); offset += 0x4;
    let pConnect = readPointer(buffer, offset); offset += 0x4;
    let hSong = readWord(buffer, offset); offset += 0x2;
    let hMap = readWord(buffer, offset); offset += 0x2;

    let bLabelID = readByte(buffer, offset); offset += 0x1;
    let bFlash = readByte(buffer, offset); offset += 0x1;
    let bWeather = readByte(buffer, offset); offset += 0x1;
    let bType = readByte(buffer, offset); offset += 0x1;
    let bUnused1 = readByte(buffer, offset); offset += 0x1;
    let bUnused2 = readByte(buffer, offset); offset += 0x1;
    let bLabelToggle = readByte(buffer, offset); offset += 0x1;
    let bUnused3 = readByte(buffer, offset); offset += 0x1;
    let hdrSize = offset - mapHeaderPointer - 0x8000000;

    // # CONNECTION
    offset = intToPointer(pConnect);
    let pNumConnections = readPointer(buffer, offset); offset += 0x4;
    let pData = readPointer(buffer, offset); offset += 0x4;

    // NULL check, no map connections
    if (pConnect === 0x0) pNumConnections = 0;

    let connections = [];
    for (let ii = 0; ii < pNumConnections; ++ii) {
      offset = intToPointer(pData) + (ii * 0xc);
      let conn = {};
      conn.lType = readPointer(buffer, offset); offset += 0x4;
      conn.lOffset = readLong(buffer, offset); offset += 0x4;
      conn.bBank = readByte(buffer, offset); offset += 0x1;
      conn.bMap = readByte(buffer, offset); offset += 0x1;
      conn.wFiller = readWord(buffer, offset); offset += 0x2;
      connections.push(conn);
    };
    let originalSize = pNumConnections * 12;

    offset = pSprites &0x1FFFFFF;
    // # TILESET DATA
    let bNumNPCs = readByte(buffer, offset); offset += 0x1;
    let bNumExits = readByte(buffer, offset); offset += 0x1;
    let bNumTraps = readByte(buffer, offset); offset += 0x1;
    let bNumSigns = readByte(buffer, offset); offset += 0x1;
    let pNPCs = readPointer(buffer, offset); offset += 0x4;
    let pExits = readPointer(buffer, offset); offset += 0x4;
    let pTraps = readPointer(buffer, offset); offset += 0x4;
    let pSigns = readPointer(buffer, offset); offset += 0x4;

    let events = {
      npcs: [],
      exits: [],
      signs: []
    };

    // # MAP EXITS
    offset = pExits;
    for (let ii = 0; ii < bNumExits; ++ii) {
      let bX = readByte(buffer, offset); offset += 0x1;
      offset += 0x1;
      let bY = readByte(buffer, offset); offset += 0x1;
      offset += 0x2;
      let bWarp = readByte(buffer, offset); offset += 0x1;
      let bMap = readByte(buffer, offset); offset += 0x1;
      let bBank = readByte(buffer, offset); offset += 0x1;
      events.exits.push({
        x: bX, y: bY,
        warp: bWarp,
        map: bMap,
        bank: bBank
      });
    };

    // # MAP SIGNS
    offset = pSigns;
    for (let ii = 0; ii < bNumSigns; ++ii) {
      let bX = readByte(buffer, offset); offset += 0x1;
      offset += 0x1;
      let bY = readByte(buffer, offset); offset += 0x1;
      offset += 0x5;
      let pScript = readPointer(buffer, offset); offset += 0x4;
      events.signs.push({
        x: bX, y: bY,
        script: pScript
      });
    };

    // #MAP NPCS
    offset = pNPCs;
    for (let ii = 0; ii < bNumNPCs; ++ii) {
      let npcID = readByte(buffer, offset); offset += 0x1;
      let imageID = readByte(buffer, offset); offset += 0x1;
      let replacement = readByte(buffer, offset); offset += 0x1;
      let filler_1 = readByte(buffer, offset); offset += 0x1;
      let positionX = readHWord(buffer, offset); offset += 0x2;
      let positionY = readHWord(buffer, offset); offset += 0x2;
      let level = readByte(buffer, offset); offset += 0x1;
      let behaviour = readByte(buffer, offset); offset += 0x1;
      let tempRadius = readByte(buffer, offset); offset += 0x1;
      let moveRadiusX = tempRadius & 15;
      let moveRadiusY = tempRadius >> 4;
      let filler_2 = readByte(buffer, offset); offset += 0x1;
      let property = readByte(buffer, offset); offset += 0x1;
      let filler_3 = readByte(buffer, offset); offset += 0x1;
      let viewRadius = readHWord(buffer, offset); offset += 0x2;
      let ptrScript = readPointer(buffer, offset); offset += 0x4;
      let flag = readHWord(buffer, offset); offset += 0x2;
      let filler_4 = readByte(buffer, offset); offset += 0x1;
      let filler_5 = readByte(buffer, offset); offset += 0x1;
      events.npcs.push({
        x: positionX, y: positionY,
        sprite: this.graphics.overworlds[imageID],
        movement: behaviour
      });
    };

    // # MAP DATA
    offset = pMap;
    let mapWidth = readPointer(buffer, offset); offset += 0x4;
    let mapHeight = readPointer(buffer, offset); offset += 0x4;
    let borderTilePtr = readPointer(buffer, offset); offset += 0x4;
    let mapTilesPtr = readPointer(buffer, offset); offset += 0x4;
    let pMajorTileset = readPointer(buffer, offset); offset += 0x4;
    let pMinorTileset = readPointer(buffer, offset); offset += 0x4;
    let borderWidth = 2; offset += 0x1;
    let borderHeight = 2; offset += 0x1;
    let secondarySize = borderWidth + 0xA0;

    let labelOffset = OFS.MAP_LABEL_DATA + (bLabelID * 8);
    let pMapLabel = readPointer(buffer, labelOffset);
    let mapName = readString(buffer, pMapLabel);

    // # MAP DATA
    let tiles = [];
    let size = mapWidth * mapHeight;
    for (let ii = 0; ii < size; ++ii) {
      let xx = (ii % mapWidth) | 0;
      let yy = (ii / mapWidth) | 0;
      let index = (yy * mapWidth + xx) | 0;
      let tile = readWord(buffer, intToPointer(mapTilesPtr) + index * 2);
      tiles.push([tile & 0x3ff, (tile & 0xfc00) >> 10]);
    };

    // # MAP TILESETS [PRIMARY, SECONDARY]
    let majorTileset = this.readTilesetHeader(pMajorTileset, mapHeaderPointer);
    let minorTileset = this.readTilesetHeader(pMinorTileset, mapHeaderPointer);

    console.log(`Loading ${mapName} [${mapWidth}x${mapHeight}], [${connections.length}] at ${toHex(pMap)}`);

    let mainPalCount = OFS.MAIN_TS_PAL_COUNT;
    let mainHeight = OFS.MAIN_TS_HEIGHT;
    let localHeight = OFS.LOCAL_TS_HEIGHT;
    let mainSize = OFS.MAIN_TS_SIZE;
    let localSize = OFS.LOCAL_TS_SIZE;
    let mainBlocks = OFS.MAIN_TS_BLOCKS;
    let localBlocks = OFS.LOCAL_TS_SIZE;

    // # RENDER MAP TILESETS [PRIMARY, SECONDARY]
    let tileData = this.createTileset(mapWidth, mapHeight, minorTileset, majorTileset);

    let tileSize = 16;

    let behavior = new Uint8Array(mapWidth * mapHeight);
    let background = new Uint8Array(mapWidth * mapHeight);
    let attributes = new Uint8Array(mapWidth * mapHeight);
    let animations = [
      [], []
    ];

    let doors = [];
    let layers = [
      createCanvasBuffer(mapWidth * tileSize, mapHeight * tileSize).ctx,
      createCanvasBuffer(mapWidth * tileSize, mapHeight * tileSize).ctx
    ];
    let bgb = createCanvasBuffer(mapWidth * tileSize, mapHeight * tileSize).ctx;
    let layerData = [
      tileData.layers.background,
      tileData.layers.foreground
    ];

    // # BORDER TILE
    let border = this.createBorderMap(mapWidth, mapHeight, borderTilePtr, layerData, connections);

    let frameBuffers = {};

    // # RENDER MAP
    offset = mapTilesPtr;
    for (let ll = 0; ll < layers.length; ++ll) {
      let ctx = layers[ll];
      let tileset = layerData[ll];
      for (let ii = 0; ii < mapWidth * mapHeight; ++ii) {
        let xx = (ii % mapWidth) | 0;
        let yy = (ii / mapWidth) | 0;
        let value = readShort(buffer, offset + ii * 2);
        let tile = value & 0x3FF;
        let attr = value >> 10;
        let tx = (tile % 8) * tileSize;
        let ty = (((tile / 8) | 0) * tileSize);
        let tindex = ty * tileset.canvas.width + tx;
        behavior[ii] = tileData.behavior[tindex];
        background[ii] = tileData.background[tindex];
        attributes[ii] = attr;
        // tile (4 tile based) is animated
        for (let jj = 0; jj < 4; ++jj) {
          let x = (jj % 2) | 0;
          let y = (jj / 2) | 0;
          let pos = this.getAnimationAt(tileData, ll, (tile % 8) | 0, (tile / 8) | 0, jj);
          if (pos !== -1) {
            let anim = tileData.animations[ll][pos];
            let frames = anim.data.length;
            // allocate framebuffer
            if (!frameBuffers[ll]) frameBuffers[ll] = {};
            if (!frameBuffers[ll][frames]) {
              frameBuffers[ll][frames] = [];
              for (let kk = 0; kk < frames; ++kk) {
                let frame = createCanvasBuffer(mapWidth * 16, mapHeight * 16).ctx;
                frameBuffers[ll][frames].push(frame);
              };
            }
            for (let kk = 0; kk < frames; ++kk) {
              let frameBuffer = frameBuffers[ll][frames][kk];
              let mx = (xx * 16) + (x * 8);
              let my = (yy * 16) + (y * 8);
              frameBuffer.drawImage(
                anim.data[kk].canvas,
                0, 0,
                8, 8,
                mx, my,
                8, 8
              );
            };
          }
        };
        // block covered by hero
        if (
          (background[ii] === 0x10 && ll === 1)
        ) {
          bgb.drawImage(
            tileset.canvas,
            tx, ty,
            tileSize, tileSize,
            xx * tileSize, (yy * tileSize),
            tileSize, tileSize
          );
        } else {
          ctx.drawImage(
            tileset.canvas,
            tx, ty,
            tileSize, tileSize,
            xx * tileSize, (yy * tileSize),
            tileSize, tileSize
          );
        }
        if (ll === 0 && behavior[ii] === 0x69) {
          let anim = this.getDoorAnimationByBlock(tile, minorTileset.palettePtr);
          if (anim !== null) {
            doors.push({
              frame: 0,
              x: xx * tileSize,
              y: yy * tileSize,
              data: anim,
              isOpening: true,
              isClosing: false
            });
          }
          /*ctx.fillRect(
            xx * tileSize, (yy * tileSize),
            tileSize, tileSize
          );*/
        }
      };
    };

    layers.push(bgb);

    return {
      id: map,
      events,
      bank: bank,
      border: border.ctx,
      name: mapName,
      width: mapWidth,
      height: mapHeight,
      texture: layers,
      behavior,
      background,
      attributes,
      doors: doors,
      animations: frameBuffers,
      connections: connections,
      loaded: false, // anti recursion
      x: 0, y: 0
    };

  }
  getAnimationAt(tileData, layer, x, y, index) {
    let animations = tileData.animations[layer];
    for (let ii = 0; ii < animations.length; ++ii) {
      let anim = animations[ii];
      if (anim.x === x && anim.y === y && anim.index === index && anim.layer === layer) return ii;
    };
    return -1;
  }
  createTileset(mapWidth, mapHeight, minorTileset, majorTileset) {
    let buffer = this.buffer;
    let offset = 0;
    let tileSize = 16;
    let width = mapWidth * tileSize;
    let height = mapHeight * tileSize;

    let majorPalettes = 96;

    let ctx = createCanvasBuffer(128, 2560).ctx;

    let paldata = [];

    // e.g. used to find secondary tileset relative animations
    let tileset = majorTileset.number + ":" + minorTileset.number;

    // # READ PALETTE
    offset = minorTileset.palettePtr;
    for (let ii = 0; ii < 208; ++ii) {
      let palette = readShort(buffer, offset); offset += 0x2;
      paldata[ii] = palette;
    };

    offset = majorTileset.palettePtr;
    for (let ii = 0; ii < 96; ++ii) {
      let palette = readShort(buffer, offset); offset += 0x2;
      paldata[ii] = palette;
    };

    // # READ TILESET
    let blockLimits = [512, 512];
    let tilesetSize = [0x4000, 0x5000];
    let tilesetImageOffsets = [ majorTileset.tilesetImgPtr, minorTileset.tilesetImgPtr ];

    let tiles = [];
    for (let ii = 0; ii < 2; ++ii) {
      offset = tilesetImageOffsets[ii];
      let bytes = readBytes(buffer, offset, tilesetSize[ii]);
      let data = decodePixels(LZ77(bytes, 0));
      for (let jj = 0; jj < data.length; ++jj) tiles.push(data[jj]);
      if (ii === 0 && tiles.length < 0x8000) {
        for (let ii = 0; ii < 640; ii++) { tiles.push(0x0); };
      }
    };

    // # DECODE PALETTES
    let palettes = [];
    for (let ii = 0; ii < 256; ++ii) {
      palettes[ii] = decodePalette(paldata[ii]);
    };

    // # DRAW TILESET
    let tilesetBlockDataOffset = [ majorTileset.blocksPtr, minorTileset.blocksPtr ];
    let tilesetBehaveDataOffset = [ majorTileset.behavePtr, minorTileset.behavePtr ];
    let x = 0; let y = 0;
    let posX = [0, 8, 0, 8];
    let posY = [0, 0, 8, 8];

    let bganimations = [];
    let fganimations = [];

    let cw = ctx.canvas.width; let ch = ctx.canvas.height;
    let backgroundImage = new ImageData(cw, ch);
    let foregroundImage = new ImageData(cw, ch);
    let backgroundPixels = backgroundImage.data;
    let foregroundPixels = foregroundImage.data;
    let offset2 = 0;
    let behaviorData = new Uint8Array(cw * ch);
    let backgroundData = new Uint8Array(cw * ch);
    for (let ts = 0; ts < 2; ++ts) {
      offset = tilesetBlockDataOffset[ts];
      offset2 = tilesetBehaveDataOffset[ts];
      for (let ii = 0; ii < blockLimits[ts]; ++ii) {
        for (let ly = 0; ly < 2; ++ly) { // 2, bg, fg
          let isBackground = ly === 0;
          let isForeground = ly === 1;
          let bytes = readBytes(buffer, offset2 + ii * 2, 2);
          let behavior = bytes[0];
          let background = bytes[1];
          for (let tt = 0; tt < 4; ++tt) { // 4 tile based
            let tile = readWord(buffer, offset); offset += 0x2;
            let tileIndex = tile & 0x3FF;
            let flipX = (tile & 0x400) >> 10;
            let flipY = (tile & 0x800) >> 11;
            let palIndex = (tile & 0xF000) >> 12;
            let tileSeeker = tileIndex * 64;
            if (tileSeeker + 64 > tiles.length) continue;
            let dx = x * tileSize + posX[tt];
            let dy = y * tileSize + posY[tt];
            if (behavior > 0) {
              behaviorData[dy * cw + dx] = behavior;
            }
            if (background > 0) {
              backgroundData[dy * cw + dx] = background;
            }
            let anim = this.getTileAnimation(tileIndex, tileset);
            // tile is animated
            if (anim !== null) {
              let data = this.getAnimationTileImg(anim, tileIndex, palIndex, flipX, flipY, minorTileset, majorTileset);
              let animLayer = isForeground ? fganimations : bganimations;
              let offset = anim.offset;
              animLayer.push({
                x: x, y: y,
                data,
                layer: ly,
                tile: offset,
                index: tt,
                interval: anim.interval || -1
              });
            }
            let xx = 0; let yy = 0;
            for (let px = 0; px < 64; ++px) {
              let pixel = tiles[tileSeeker + px];
              if (pixel > 0) {
                let color = palettes[pixel + (palIndex * 16)];
                let ddx = (dx + (flipX > 0 ? (-xx + 7) : xx));
                let ddy = (dy + (flipY > 0 ? (-yy + 7) : yy));
                let index = 4 * (ddy * cw + ddx);
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
            };
          };
        };
        if ((++x) === 8) { x = 0; y++; }
      };
    };

    let bg = createCanvasBuffer(128, 2560).ctx;
    let fg = createCanvasBuffer(128, 2560).ctx;

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
  }
  createBorderMap(mapWidth, mapHeight, borderTilePtr, layerData, connections) {
    let buffer = this.buffer;
    let bw = 2; let bh = 2;
    let tileSize = 16;
    let borderTile = createCanvasBuffer(bw * tileSize, bh * tileSize);
    let offset = borderTilePtr;
    for (let ll = 0; ll < 2; ++ll) {
      let tileset = layerData[ll];
      for (let ii = 0; ii < bw * bh; ++ii) {
        let xx = (ii % bw) | 0;
        let yy = (ii / bw) | 0;
        let value = readShort(buffer, offset + ii * 2);
        let tile = value & 0x3ff;
        let srcX = (tile % 8) * tileSize;
        let srcY = ((tile / 8) | 0) * tileSize;
        let destX = xx * tileSize;
        let destY = yy * tileSize;
        borderTile.ctx.drawImage(
          tileset.canvas,
          srcX, srcY,
          tileSize, tileSize,
          destX, destY,
          tileSize, tileSize
        );
      };
    };
    let padding = 8;
    let halfpad = padding / 2;
    let mw = mapWidth + (padding * 2);
    let mh = mapHeight + (padding * 2);
    let border = createCanvasBuffer(mw * tileSize, mh * tileSize);
    // just fill everything with the border tile
    for (let ii = 0; ii < mw * mh; ++ii) {
      let xx = (ii % mw) | 0;
      let yy = (ii / mw) | 0;
      border.ctx.drawImage(
        borderTile.canvas,
        0, 0,
        32, 32,
        (xx * 32), (yy * 32),
        32, 32
      );
    };
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
  }
  getAnimationTileImg(anim, tileIndex, palIndex, flipX, flipY, minorTileset, majorTileset) {
    let frames = [];
    let index = (tileIndex - anim.offset);
    let tileset = (anim.tileset ? minorTileset : majorTileset).palettePtr;
    let palette = tileset + (palIndex * 0x20);
    let tileFrame = index % 0x4;
    let tileX = (index / 0x4) | 0;
    let length = anim.animations.length;
    let isFlipped = flipX || flipY;
    for (let ii = 0; ii < length; ++ii) {
      let index = 0;
      let offset = 0;
      // special animation
      if (anim.interval !== void 0) {
        index = (tileIndex - anim.offset) % 0x4;
        offset = anim.animations[((length - ii) + tileX) % length];
      // default animation
      } else {
        offset = anim.animations[ii];
        index = (tileIndex - anim.offset);
      }
      let location = (offset + (index * 0x20));
      // try to grab a cached tile version
      // only cache unflipped tiles
      let cached = this.animations[location] || null;
      if (cached !== null && !isFlipped) {
        frames.push(cached);
        continue;
      }
      let pal = readPalette(this.buffer, palette, true);
      let tile = readPixels(this.buffer, location, pal, 0x8, 0x8, true);
      let buffer = createCanvasBuffer(0x8, 0x8).ctx;
      buffer.putImageData(tile, 0, 0);
      if (flipX) {
        let img = createCanvasBuffer(0x8, 0x8).ctx;
        img.scale(-1, 1);
        img.drawImage(buffer.canvas, 0, 0, -0x8, 0x8);
        buffer = img;
      }
      if (flipY) {
        let img = createCanvasBuffer(0x8, 0x8).ctx;
        img.scale(1, -1);
        img.drawImage(buffer.canvas, 0, 0, 0x8, -0x8);
        buffer = img;
      }
      // cache the tile for future access
      if (!isFlipped) this.animations[location] = buffer;
      frames.push(buffer);
    };
    return frames;
  }
  // checks if a tile lies inside a
  // tileset animation offset range
  getTileAnimation(offset, tileset) {
    let animations = OFS.TILESET_PRIMARY_ANIMATIONS;
    let sanimations = OFS.TILESET_SECONDARY_ANIMATIONS;
    return null;
    // primary animations
    for (let ii = 0; ii < animations.length; ++ii) {
      let anim = animations[ii];
      let start = anim.offset;
      let end = start + anim.size;
      if (offset >= start && offset < end) return anim;
    };
    // secondary non-special animations
    for (let ii = 0; ii < sanimations.length; ++ii) {
      let anim = sanimations[ii];
      if (anim.tileset !== tileset) continue;
      if (anim.interval !== void 0) continue;
      let start = anim.offset;
      let end = start + anim.size;
      if (offset >= start && offset < end) return anim;
    };
    // secondary special animations
    for (let ii = 0; ii < sanimations.length; ++ii) {
      let anim = sanimations[ii];
      if (anim.tileset !== tileset) continue;
      if (anim.interval === void 0) continue;
      for (let jj = 0; jj < anim.animations.length; ++jj) {
        let start = anim.offset + ((jj % 8) * anim.interval);
        let end = start + anim.size;
        if (offset >= start && offset < end) return anim;
      };
    };
    return null;
  }
  readTilesetHeader(offset, tilesetHeader) {
    let buffer = this.buffer;
    let object = {};
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
  }
  getPkmnString() {
    let buffer = this.buffer;
    let string = readString(buffer, OFS.PKMN_STRING);
    return string.substring(0, 7);
  }
  getImage(s, p, x, y, w, h, compressed = false) {
    let buffer = this.buffer;
    let ctx = createCanvasBuffer(w + x, h + y).ctx;
    let palette = readPalette(buffer, p, !!compressed);
    let pixels = readPixels(buffer, s, palette, w, h, !!compressed);
    ctx.putImageData(pixels, x, y);
    return {
      canvas: ctx.canvas,
      data: new Uint8Array(pixels.data)
    };
  }
  getOverworldImgById(id, frame) {
    let buffer = this.buffer;
    let offset = (OFS.OVERWORLD_BANK + (id * 36));
    offset += 4; // skip ffff
    let paletteNum = readByte(buffer, offset - 2); offset += 0x1;
    offset += 0x3; // unknown
    let width = readByte(buffer, offset); offset += 0x1;
    offset += 0x1; // unknown
    let height = readByte(buffer, offset); offset += 0x1;
    offset += 0x1; // unknown
    offset += 0x1; // unknown
    offset += 0x3; // unknown
    offset += 0x4; // unknown ptr
    offset += 0x4; // unknown ptr
    offset += 0x4; // unknown ptr
    let spritePtr = readPointer(buffer, offset); offset += 0x4;

    // get palette, weird stuff
    let palettePtr = 0;
    for (let ii = 0; ii < OFS.OVERWORLD_PAL_COUNT; ++ii) {
      let index = OFS.OVERWORLD_PAL_HEADERS + (ii * 8);
      if (readByte(buffer, index + 4) === paletteNum) {
        palettePtr = readLong(buffer, index) - 0x8000000;
      }
    };

    let pixels = readPointer(buffer, spritePtr + (8 * frame));
    let palette = palettePtr;
    return this.getImage(pixels, palette, 0, 0, width, height, true);
  }
  getPkmnFrontImgById(id) {
    let buffer = this.buffer;
    let pixels = readPointer(buffer, OFS.PKMN_FRONT_IMG + id * 8);
    let palette = readPointer(buffer, OFS.PKMN_NORMAL_PAL + id * 8);
    return this.getImage(pixels, palette, 0, 0, 64, 64);
  }
  getPkmnBackImgById(id) {
    let buffer = this.buffer;
    let pixels = readPointer(buffer, OFS.PKMN_BACK_IMG + id * 8);
    let palette = readPointer(buffer, OFS.PKMN_NORMAL_PAL + id * 8);
    return this.getImage(pixels, palette, 0, 0, 64, 64);
  }
  getPkmnFrontAnimationImgById(id) {
    let buffer = this.buffer;
    let pixels = readPointer(buffer, OFS.PKMN_FRONT_ANIM + id * 8);
    let palette = readPointer(buffer, OFS.PKMN_NORMAL_PAL + id * 8);
    return this.getImage(pixels, palette, 0, -64, 64, 128);
  }
  getPkmnIconImgById(id) {
    let buffer = this.buffer;
    let pixels = readPointer(buffer, OFS.ICON_POINTER_TBL + (id * 4));
    let poffset = OFS.ICON_PALS + (readByte(buffer, OFS.ICON_PAL_TABLE + id) * 32);
    return this.getImage(pixels, poffset, 0, 0, 32, 64, true);
  }
  getItemImageById(id) {
    let buffer = this.buffer;
    if (id === 139) {
      //console.log(readPointer(buffer, OFS.ITEM_IMG + id * 8), toHex(readPointer(buffer, OFS.ITEM_IMG + id * 8)));
    }
    let pixels = readPointer(buffer, OFS.ITEM_IMG + id * 8);
    let palette = readPointer(buffer, OFS.ITEM_IMG + (id * 8) + 4);
    return this.getImage(pixels, palette, 0, 0, 24, 24);
  }
  getItemNameById(id) {
    let buffer = this.buffer;
    let offset = OFS.ITEM_DATA + id * 44;
    return readString(buffer, offset);
  }
  getAttackNameById(id) {
    let buffer = this.buffer;
    let offset = OFS.ATTACK_NAMES + id * 13;
    return readString(buffer, offset);
  }
  getPkmnNameById(id) {
    let offset = id * 11;
    let buffer = this.buffer;
    return readString(buffer, OFS.PKMN_NAMES + offset)
  }
  getPkmnCryById(id) {
    let buffer = this.buffer;
    let cryTbl1 = OFS.CRY_TABLE;
    let cryTbl2 = OFS.CRY_TABLE2;
    let cryConvTbl = OFS.CRY_CONVERSION_TABLE;
    let offset = readPointer(buffer, cryTbl1 + (id * 12) + 4);
    let compressed = 0x1;
    let looped = 0x4000;
    let sampleRate = readInt(buffer, offset + 4) >> 10;
    let loopStart = readInt(buffer, offset + 8);
    let size = readInt(buffer, offset + 12) + 1;
    let bytes = [];
    for (let ii = 0; ii < size; ++ii) {
      let byte = readByte(buffer, offset + 16 + ii);
      bytes.push(byte);
    };
    return bytes;
  }
  generatePkmnString() {
    let string = this.getPkmnString();
    this.names.pkmn = string;
  }
  generateAttackNameTable() {
    let table = this.names.attacks;
    for (let ii = 1; ii <= OFS.ATTACK_COUNT; ++ii) {
      let atk = this.getAttackNameById(ii);
      table[ii] = atk;
    };
  }
  generatePkmnNameTable() {
    let table = this.names.pkmns;
    for (let ii = 1; ii <= OFS.PKMN_COUNT; ++ii) {
      let name = this.getPkmnNameById(ii);
      table[ii] = name;
    };
  }
  generatePkmnGraphicTable() {
    let table = this.graphics.pkmns;
    for (let ii = 1; ii <= OFS.PKMN_COUNT; ++ii) {
      let icon = this.getPkmnIconImgById(ii);
      let back = this.getPkmnBackImgById(ii);
      let front = this.getPkmnFrontImgById(ii);
      table.icon[ii] = icon;
      table.back[ii] = back;
      table.front[ii] = front;
    };
  }
  generateItemNameTable() {
    let table = this.names.items;
    for (let ii = 1; ii <= OFS.ITEM_COUNT; ++ii) {
      let name = this.getItemNameById(ii);
      table[ii] = name;
    };
  }
  generateItemGraphicTable() {
    let table = this.graphics.items;
    for (let ii = 1; ii <= OFS.ITEM_COUNT; ++ii) {
      let item = this.getItemImageById(ii);
      table[ii] = item;
    };
  }
  generateFieldEffectGraphicTable() {
    let table = this.graphics.effects;
    let palettes = OFS.FIELD_EFFECT_PAL;
    let imgs = OFS.FIELD_EFFECT_IMGS;
    for (let ii = 0; ii < imgs.length; ++ii) {
      let item = imgs[ii];
      let img = this.getFieldEffect(item[0], palettes[item[1]], item[2], item[3]);
      table[ii] = img;
      //ows.appendChild(img.canvas);
    };
  }
  getFieldEffect(id, pal, w, h) {
    let buffer = this.buffer;
    let baseOffset = OFS.FIELD_EFFECT_HEADER;
    let basePtr = readPointer(buffer, baseOffset + (id * 0x4));
    let offset = basePtr;
    let tilesTag = readShort(buffer, offset); offset += 0x2;
    let paletteTag = readShort(buffer, offset); offset += 0x2;
    let baseOamPtr = readPointer(buffer, offset); offset += 0x4;
    let animTablePtr = readPointer(buffer, offset); offset += 0x4;
    let imgPtr = readPointer(buffer, offset); offset += 0x4;
    let dummyAffine = readPointer(buffer, offset); offset += 0x4;
    let oamc = readPointer(buffer, offset); offset += 0x4;
    let picTable = readPointer(buffer, imgPtr);
    let pixels = picTable;
    let palette = pal;
    return this.getImage(pixels, palette, 0, 0, w, h, true);
  }
  getDoorAnimationByBlock(block, palette) {
    let buffer = this.buffer;
    for (let ii = 0; ii < 53; ++ii) {
      let doorAnimHeader = OFS.DOOR_ANIM_HEADER + (ii * 0xc);
      let blockNumber = readShort(buffer, doorAnimHeader);
      if (block === blockNumber) {
        return this.getDoorAnimationById(ii, palette);
      }
    };
    return null;
  }
  getDoorAnimationById(id, palette) {
    let buffer = this.buffer;
    let minorTsPalPtr = palette;
    let baseAnimHeader = OFS.DOOR_ANIM_HEADER;
    let doorAnimHeader = baseAnimHeader + (id * 0xc);
    let paletteOffset = readPointer(buffer, doorAnimHeader + 0x8);
    let paletteNum = readByte(buffer, paletteOffset);
    let imageOffset = readPointer(buffer, doorAnimHeader + 0x4);
    let blockNumber = readShort(buffer, doorAnimHeader);
    let palOffset = minorTsPalPtr + (paletteNum * 32);
    return this.getImage(imageOffset, palOffset, 0, 0, 16, 96, true);
  }
  generateOverworldGraphicTable() {
    let table = this.graphics.overworlds;
    for (let ii = 0; ii < OFS.OVERWORLD_COUNT; ++ii) {
      let frames = getMaxFrame(ii);
      table[ii] = [];
      for (let frm = 0; frm <= frames; ++frm) {
        let sprite = this.getOverworldImgById(ii, frm);
        table[ii].push(sprite);
        if (frames >= 8 && isFrameMirrorable(frm)) {
          let sprite = this.getOverworldImgById(ii, frm);
          let ctx = createCanvasBuffer(sprite.canvas.width, sprite.canvas.height).ctx;
          ctx.setTransform(-1, 0, 0, 1, sprite.canvas.width, 0);
          ctx.drawImage(
            sprite.canvas,
            0, 0
          );
          sprite.canvas = ctx.canvas;
          table[ii].push(sprite);
        }
        
      };
      if (frames >= 8) {
        this.swapOverworldSprites(table[ii], 9, 10);
        this.swapOverworldSprites(table[ii], 21, 22);
      }
      //if (ii === 0) table[ii].map((sprite) => ows.appendChild(sprite.canvas));
    };
  }
  swapOverworldSprites(sprites, a, b) {
    let tmp = sprites[a];
    sprites[a] = sprites[b];
    sprites[b] = tmp;
  }
};

window.Rom = Rom;
