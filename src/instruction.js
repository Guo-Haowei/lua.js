import { opCodeInfos } from './opcodes.js';

const MAXARG_BX = 262143; // 1 << 18 - 1
const MAXARG_SBX = 131071; // MAXARG_BX >> 1

/* eslint-disable no-bitwise */
class Instruction {
  constructor(raw) {
    this.raw = raw;
  }

  opCode() {
    return this.raw & 0x3F;
  }

  iABC() {
    return {
      a: (this.raw >>> 6) & 0xFF,
      c: (this.raw >>> 14) & 0x1FF,
      b: (this.raw >>> 23) & 0x1FF,
    };
  }

  iABx() {
    return {
      a: (this.raw >>> 6) & 0xFF,
      bx: (this.raw >>> 14),
    };
  }

  iAsBx() {
    const { a, bx } = this.iABx();
    return {
      a,
      sbx: bx - MAXARG_SBX,
    };
  }

  iAx() {
    return { ax: (this.raw >>> 6) };
  }

  getInfo() {
    return opCodeInfos[this.opCode()];
  }
}
/* eslint-enable no-bitwise */

export {
  MAXARG_BX,
  MAXARG_SBX,
  Instruction,
};
