const LUA_SIGNITURE = '\x1bLua';
const LUAC_VERSION = 0x53;
const LUAC_FORMAT = 0;
const LUAC_DATA = '\x19\x93\r\n\x1a\n';
const CINT_SIZE = 4;
const CSIZET_SIZE = 8;
const INSTRUCTION_SIZE = 4;
const LUA_INTEGER_SIZE = 8;
const LUA_NUMBER_SIZE = 8;
const LUAC_INT = 0x5678n;
const LUAC_NUM = 370.5;

class Reader {
  constructor(buffer) {
    this.buffer = buffer;
  }

  readByte() {
    const byte = this.buffer[0];
    this.buffer = this.buffer.slice(1);
    return byte;
  }

  readBytes(n) {
    let str = '';
    for (let idx = 0; idx < n; idx += 1) {
      str += String.fromCharCode(this.readByte());
    }
    return str;
  }

  readInt64() {
    const int64 = new BigInt64Array(
      new Uint8Array(Array.from(this.buffer.slice(0, LUA_INTEGER_SIZE))).buffer,
    )[0];
    this.buffer = this.buffer.slice(LUA_INTEGER_SIZE);
    return int64;
  }

  readFloat64() {
    const float64 = new Float64Array(
      new Uint8Array(Array.from(this.buffer.slice(0, LUA_NUMBER_SIZE))).buffer,
    )[0];
    this.buffer = this.buffer.slice(LUA_NUMBER_SIZE);
    return float64;
  }

  checkHeader() {
    if (this.readBytes(4) !== LUA_SIGNITURE) {
      return 'not a precompiled binary chunk';
    }

    if (this.readByte() !== LUAC_VERSION) {
      return 'version mismatch';
    }

    if (this.readByte() !== LUAC_FORMAT) {
      return 'format mismatch';
    }

    if (this.readBytes(6) !== LUAC_DATA) {
      return 'binary chunk corrupted';
    }

    const sizesToCheck = [
      { size: CINT_SIZE, name: 'int' },
      { size: CSIZET_SIZE, name: 'size' },
      { size: INSTRUCTION_SIZE, name: 'instruction' },
      { size: LUA_INTEGER_SIZE, name: 'lua integer' },
      { size: LUA_NUMBER_SIZE, name: 'lua number' },
    ];

    for (let idx = 0; idx < sizesToCheck.length; idx += 1) {
      const ele = sizesToCheck[idx];
      if (this.readByte() !== ele.size) {
        return `${ele.name} size mismatch`;
      }
    }

    if (this.readInt64() !== LUAC_INT) {
      return 'endianness mismatch';
    }

    if (this.readFloat64() !== LUAC_NUM) {
      return 'float format mismatch';
    }

    return '';
  }
}

const undump = (buffer) => {
  const reader = new Reader(buffer);
  const error = reader.checkHeader();
  if (error !== '') {
    // eslint-disable-next-line no-console
    console.error(`reader.checkeHeader() failed: ${error}`);
    return false;
  }

  return true;
};

export {
  Reader,
  undump,
};
