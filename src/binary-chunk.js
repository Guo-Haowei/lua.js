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

const TAG_NIL = 0x00;
const TAG_BOOLEAN = 0x01;
const TAG_NUMBER = 0x03;
const TAG_INTEGER = 0x13;
const TAG_SHORT_STRING = 0x04;
const TAG_LONG_STRING = 0x14;

class Decoder {
  constructor(buffer) {
    this.buffer = buffer;
  }

  checkRange(n) {
    if (this.buffer.length < n) {
      throw new Error('Buffer out of bound');
    }
  }

  readByte() {
    this.checkRange(1);
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

  readAny(sizeInByte, func) {
    this.checkRange(sizeInByte);
    const ret = func(new Uint8Array(Array.from(this.buffer.slice(0, sizeInByte))).buffer)[0];
    this.buffer = this.buffer.slice(sizeInByte);
    return ret;
  }

  readUint32() {
    return this.readAny(4, (buffer) => new Uint32Array(buffer));
  }

  readInt64() {
    return this.readAny(8, (buffer) => new BigInt64Array(buffer));
  }

  readFloat64() {
    return this.readAny(8, (buffer) => new Float64Array(buffer));
  }

  readString() {
    const length = this.readByte();
    if (length === 0) {
      return '';
    }
    return this.readBytes((length === 0xFF ? this.readInt64() : length) - 1);
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

  readUint32Array() {
    const num = this.readUint32();
    const ret = [];
    for (let idx = 0; idx < num; idx += 1) {
      ret.push(this.readUint32());
    }
    return ret;
  }

  readStringArray() {
    const num = this.readUint32();
    const ret = [];
    for (let idx = 0; idx < num; idx += 1) {
      ret.push(this.readString());
    }
    return ret;
  }

  readConstant() {
    switch (this.readByte()) {
      case TAG_NIL: return undefined;
      case TAG_BOOLEAN: return this.readByte() !== 0;
      case TAG_INTEGER: return parseInt(this.readInt64(), 10);
      case TAG_NUMBER: return this.readFloat64();
      case TAG_SHORT_STRING: return this.readString();
      case TAG_LONG_STRING: return this.readString();
      default: throw new Error('bad type');
    }
  }

  readConstants() {
    const num = this.readUint32();
    const ret = [];
    for (let idx = 0; idx < num; idx += 1) {
      ret.push(this.readConstant());
    }
    return ret;
  }

  readUpvals() {
    const num = this.readUint32();
    const ret = [];
    for (let idx = 0; idx < num; idx += 1) {
      const inStack = this.readByte();
      const index = this.readByte();
      ret.push({ inStack, index });
    }
    return ret;
  }

  readProto(parentSource) {
    let source = this.readString();
    if (source === '') {
      source = parentSource;
    }
    const lineDefined = this.readUint32();
    const lastLineDefined = this.readUint32();
    const numParams = this.readByte();
    const isVararg = this.readByte();
    const maxStackSize = this.readByte();
    const code = this.readUint32Array();
    const constants = this.readConstants();
    const upvals = this.readUpvals();
    const protos = this.readProtos(source);
    const lineInfo = this.readUint32Array();
    const locVars = this.readLocVars();
    const upvalueNames = this.readStringArray();
    return {
      source,
      lineDefined,
      lastLineDefined,
      numParams,
      isVararg,
      maxStackSize,
      code,
      constants,
      upvals,
      protos,
      lineInfo,
      locVars,
      upvalueNames,
    };
  }

  readProtos(parentSource) {
    const num = this.readUint32();
    const ret = [];
    for (let idx = 0; idx < num; idx += 1) {
      ret.push(this.readProto(parentSource));
    }
    return ret;
  }

  readLocVars() {
    const num = this.readUint32();
    const ret = [];
    for (let idx = 0; idx < num; idx += 1) {
      const varName = this.readString();
      const startPC = this.readUint32();
      const endPC = this.readUint32();
      ret.push({ varName, startPC, endPC });
    }
    return ret;
  }
}

const undump = (buffer) => {
  const decoder = new Decoder(buffer);
  const error = decoder.checkHeader();
  if (error !== '') {
    throw new Error(`reader.checkeHeader() failed: ${error}`);
  }

  // skip upvalue for now
  decoder.readByte();

  return decoder.readProto('');
};

export {
  Decoder,
  undump,
};
