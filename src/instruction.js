import { opCodeInfos } from './opcodes.js';

import {
  iABCImpl,
  iABxImpl,
  iAsBxImpl,
  iAxImpl,
  MAXARG_BX,
  MAXARG_SBX,
} from './misc.js';

class Instruction {
  constructor(raw) {
    this.raw = raw;
  }

  opCode() {
    // eslint-disable-next-line no-bitwise
    return this.raw & 0x3F;
  }

  iABC() {
    return iABCImpl(this.raw);
  }

  iABx() {
    return iABxImpl(this.raw);
  }

  iAsBx() {
    return iAsBxImpl(this.raw);
  }

  iAx() {
    return iAxImpl(this.raw);
  }

  getInfo() {
    return opCodeInfos[this.opCode()];
  }

  execute(vm) {
    const { action, debugName } = this.getInfo();
    if (!action) {
      throw new Error(`TODO: implement ${debugName}`);
    }

    action(this, vm);
  }
}

export {
  MAXARG_BX,
  MAXARG_SBX,
  Instruction,
};
