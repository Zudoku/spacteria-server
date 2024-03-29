const pako = require('pako');
const atob = require('atob');
const btoa = require('btoa');

module.exports = {
  compressEncodeMapData(mapdata, mapwidth, mapheight) {
    const bresult = new Uint8Array(mapwidth * mapheight * 4);
    for (let i = 0; i < mapwidth * mapheight; i++) {
      bresult[(i * 4)] = mapdata[i];
      bresult[(i * 4) + 1] = 0;
      bresult[(i * 4) + 2] = 0;
      bresult[(i * 4) + 3] = 0;
    }
    const compressed = pako.deflate(bresult);

    const finalProduct = btoa(String.fromCharCode.apply(null, compressed));
    return finalProduct;
  },
  uncompressDecodeMapData(rawMapdata) {
    const charData = atob(rawMapdata).split('').map(x => x.charCodeAt(0));

    const binData = new Uint32Array(charData);

    const rawdata = pako.inflate(binData);

    // const strData = String.fromCharCode.apply(null, new Uint16Array(rawdata));

    const result = [rawdata.length / 4];
    for (let i = 0; i < rawdata.length; i++) {
      result[i] = rawdata[i * 4];
    }
    return result;
  },
  d2arraytod1(d2array) {
    const result = [d2array.length * d2array[0].length];
    for (let x = 0; x < d2array.length; x++) {
      for (let y = 0; y < d2array[0].length; y++) {
        result[(x * d2array.length) + y] = d2array[x][y];
      }
    }
    return result;
  },
  d1arraytod2(d1array, width, height) {
    const result = [width];
    for (let x = 0; x < width; x++) {
      result[x] = [height];
      for (let y = 0; y < height; y++) {
        result[x][y] = d1array[(x * width) + y];
      }
    }
    return result;
  },
};
