const CustomTiledModel = require('./wfc/customtiledmodel.js');
const packer = require('./packer.js');
const fs = require('fs');
const castle = require('./data/castle.js');

const modelIterationLimit = 50000;

module.exports = {
  getTilemap(data, width, height) {
    const model = new CustomTiledModel(data, null, width, height, false);
    if (model.iterate(modelIterationLimit, Math.random)) {
      const result = [width];
      for (let x = 0; x < width; x++) {
        result[x] = [height];
        for (let y = 0; y < height; y++) {
          result[x][y] = '';
        }
      }
      model.retrieveData(result);
      return result;
      //const compressed = packer.compressEncodeMapData(packer.d2arraytod1(result), mapwidth, mapheight);
      //const uncompressed = packer.uncompressDecodeMapData(compressed);
    } else {
      console.log('failed to create map');
      return undefined;
    }
  },
  saveTilemap(tiledata, name, width, height, id, cb) {
    if(tiledata === undefined) {
      console.log('Not trying to save map...');
      return;
    }

    let stream = fs.createWriteStream("maps/" + name + ".tmx");
    let preparedtiledata = packer.compressEncodeMapData(packer.d2arraytod1(tiledata), width, height);
    console.log(preparedtiledata);
    console.log(packer.d1arraytod2(packer.uncompressDecodeMapData(preparedtiledata), width, height));

    stream.once('open', function(fd) {
      stream.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
      stream.write("<map version=\"1.0\" orientation=\"orthogonal\" width=\"" + width + "\" height=\"" + height + "\" tilewidth=\"64\" tileheight=\"64\">\n");
      stream.write(" <tileset firstgid=\"1\" name=\"BasicTileset\" tilewidth=\"64\" tileheight=\"64\">\n");
      stream.write("  <image source=\"tilemap.png\" trans=\"ff00ff\" width=\"1280\" height=\"2560\"/>\n");
      stream.write(" </tileset>\n");
      stream.write(" <layer name=\"" + id + "\" width=\"" + width + "\" height=\"" + height + "\">\n");
      stream.write("  <data encoding=\"base64\" compression=\"zlib\">\n");
      stream.write("   " + preparedtiledata + "\n");
      stream.write("  </data>\n");
      stream.write(" </layer>\n");
      stream.write("</map>\n");
      stream.end();
      cb();
    });
  },
  getPreparedTileData(tiledata, width, height) {
    return packer.compressEncodeMapData(packer.d2arraytod1(tiledata), width, height);
  },
};

//let castleMap = module.exports.getTilemap(castle, 20, 20);
//console.log(castleMap);
//module.exports.saveTilemap(castleMap, 'temp2', 20, 20);
