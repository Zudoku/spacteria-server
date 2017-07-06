const packer = require('./packer.js');
const fs = require('fs');
const mapalgo = require('./mapalgo.js');

module.exports = {
  getTilemap(data) {
    return mapalgo.map(data);
  },
  saveTilemap(tiledata, name, width, height, id, cb) {
    if (tiledata === undefined) {
      console.log('Not trying to save map...');
      return;
    }

    const stream = fs.createWriteStream(`maps/${name}.tmx`);
    const preparedtiledata = packer.compressEncodeMapData(packer.d2arraytod1(tiledata), width, height);
    /// console.log(packer.d1arraytod2(packer.uncompressDecodeMapData(preparedtiledata), width, height));

    stream.once('open', (fd) => {
      stream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
      stream.write(`<map version="1.0" orientation="orthogonal" width="${width}" height="${height}" tilewidth="64" tileheight="64">\n`);
      stream.write(' <tileset firstgid="1" name="BasicTileset" tilewidth="64" tileheight="64">\n');
      stream.write('  <image source="tilemap.png" trans="ff00ff" width="1280" height="2560"/>\n');
      stream.write(' </tileset>\n');
      stream.write(` <layer name="${id}" width="${width}" height="${height}">\n`);
      stream.write('  <data encoding="base64" compression="zlib">\n');
      stream.write(`   ${preparedtiledata}\n`);
      stream.write('  </data>\n');
      stream.write(' </layer>\n');
      stream.write('</map>\n');
      stream.end();
      console.log('map ' + name + ' written.');
      cb();
    });
  },
  getPreparedTileData(tiledata, width, height) {
    return packer.compressEncodeMapData(packer.d2arraytod1(tiledata), width, height);
  },
};

// let castleMap = module.exports.getTilemap(castle, 20, 20);
// console.log(castleMap);
// module.exports.saveTilemap(castleMap, 'temp2', 20, 20);
