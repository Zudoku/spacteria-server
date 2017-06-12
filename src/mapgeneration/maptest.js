const CustomTiledModel = require('./wfc/customtiledmodel.js');
const packer = require('./packer.js');
const data = require('./data/castle.js');


const mapwidth = 20;
const mapheight = 20;

const model = new CustomTiledModel(data, null, mapwidth, mapheight, false);


if (model.iterate(500, Math.random)) {
  const result = [mapwidth];
  for (let x = 0; x < mapwidth; x++) {
    result[x] = [mapheight];
    for (let y = 0; y < mapheight; y++) {
      result[x][y] = '';
    }
  }
  model.retrieveData(result);
  const compressed = packer.compressEncodeMapData(packer.d2arraytod1(result), mapwidth, mapheight);
  const uncompressed = packer.uncompressDecodeMapData(compressed);
}


/*
const mapdata = 'eJxjYmBgYKIyFqUSHjVv1Dx6mseEhR41j/hwp7b7qBW/tHLfYDcPXzhQCwMAU44ZsQ==';

const charData = atob(mapdata).split('').map((x) => {
  return x.charCodeAt(0);
});

const binData = new Uint32Array(charData);

const rawdata = pako.inflate(binData);

const strData = String.fromCharCode.apply(null, new Uint16Array(rawdata));

const result = [rawdata.length / 4];
for (let i = 0; i < rawdata.length; i++) {
  result[i] = rawdata[i * 4];
}
console.log(result);
 */

// console.log(require('util').inspect(result, { depth: 2 }));
