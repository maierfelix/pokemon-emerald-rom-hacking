function $(name) {
  return document.querySelector(name);
};

function debug(msg) {
  console.log(msg);
};

function createCanvasBuffer(width, height) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  ctx.imageSmoothingEnabled = false;
  return ctx;
};

function showInitScreen() {
  let el = $("#rom_drop");
  el.style.display = "flex";
  return new Promise((resolve) => {
    el.ondragover = (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };
    el.ondrop = (e) => {
      e.stopPropagation();
      e.preventDefault();
      let file = e.dataTransfer.files[0];
      let name = file.name;
      let ext = name.substr(name.lastIndexOf("."), name.length);
      if (ext !== ".gba") console.warn(`Invalid ROM file extension!`);
      let reader = new FileReader();
      reader.onload = (e) => {
        let buffer = reader.result;
        let view = new Uint8Array(buffer);
        el.style.display = "none";
        resolve(view);
      };
      reader.readAsArrayBuffer(file);
    };
  });
};

let rom = null;
showInitScreen().then(buffer => {
  new Rom(buffer, { debug }).then((instance) => {
    rom = instance;
    init();
  });
});

function printItems() {
  let el = $(`#item-container .container-children`);
  for (let key in rom.graphics.items) {
    let item = rom.graphics.items[key];
    el.appendChild(item.canvas);
  };
};

function printPkmnIcons() {
  let el = $(`#pkmn-icon-container .container-children`);
  for (let key in rom.graphics.pkmns.icon) {
    let icon = rom.graphics.pkmns.icon[key];
    el.appendChild(icon.canvas);
  };
};

function printPkmnBattleSprites() {
  let el = $(`#pkmn-battle-container .container-children`);
  for (let key in rom.graphics.pkmns.back) {
    let back = rom.graphics.pkmns.back[key];
    let front = rom.graphics.pkmns.front[key];
    el.appendChild(back.canvas);
    el.appendChild(front.canvas);
  };
};

function printOverworlds() {
  let el = $(`#overworld-container .container-children`);
  for (let key in rom.graphics.overworlds) {
    let ow = rom.graphics.overworlds[key];
    el.appendChild(ow[0].canvas);
  };
};

function printEffects() {
  let el = $(`#effect-container .container-children`);
  for (let key in rom.graphics.effects) {
    let effect = rom.graphics.effects[key];
    el.appendChild(effect.canvas);
  };
};

function printMap(bankId, mapId) {
  $(`#map-container .container-title`).innerHTML = `Dumping...`;
  setTimeout(() => {
    rom.loadMapWithConnections(bankId, mapId, true);
    for (let key in rom.maps) {
      let map = rom.maps[key];
      let buffer = createCanvasBuffer(
        map.texture[0].canvas.width,
        map.texture[0].canvas.height
      );
      buffer.drawImage(map.texture[0].canvas, 0, 0);
      buffer.drawImage(map.texture[1].canvas, 0, 0);
      buffer.drawImage(map.texture[2].canvas, 0, 0);
      let el = $(`#map-container .container-children`);
      el.appendChild(buffer.canvas);
    };
    $(`#map-container .container-title`).innerHTML = `Maps:`;
  }, 100);
};

function init() {
  printItems();
  printPkmnIcons();
  printPkmnBattleSprites();
  printOverworlds();
  printEffects();
  printMap(0, 9);
};
