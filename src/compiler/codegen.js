export default class FuncInfo {
  constructor() {
    this.constants = [];
    this.usedRegs = 0;
    this.maxRegs = 0;
    this.scopeLevel = 0;
    this.locVars = [];
    this.locNames = {};
    this.breaks = [];
    this.parent = null;
    this.upvalues = {};
    this.instructions = [];
  }

  indexOfConstant(k) {
    const { constants } = this;
    const { length } = constants;
    for (let i = 0; i < length; i += 1) {
      if (constants[i] === k) {
        return i;
      }
    }

    const index = length;
    constants.push(k);
    return index;
  }

  allocReg() {
    this.usedRegs += 1;
    if (this.usedRegs >= 255) {
      throw new Error('function or expression needs too many registers');
    }

    if (this.usedRegs > this.maxRegs) {
      this.maxRegs = this.usedRegs;
    }

    return this.usedRegs - 1;
  }

  freeReg() {
    if (this.usedRegs <= 0) {
      throw new Error('unmatched freeReg() call');
    }
    this.usedRegs -= 1;
  }

  allocRegs(n) {
    for (let i = 0; i < n; i += 1) {
      this.allocReg();
    }
    return this.usedRegs - n;
  }

  freeRegs(n) {
    for (let i = 0; i < n; i += 1) {
      this.freeReg();
    }
  }

  enterScope(breakable) {
    this.scopeLevel += 1;
    if (breakable) {
      this.breaks.push([]);
    } else {
      this.breaks.push(undefined);
    }
  }

  addLocVar(name) {
    const newVar = {
      name,
      prev: this.locNames[name] || null,
      scopeLevel: this.scopeLevel,
      slot: this.allocReg(),
    };

    this.locVars.push(newVar);
    this.locNames[name] = newVar;
    return newVar.slot;
  }

  slotOfLocVar(name) {
    const locVar = this.locNames[name];
    if (locVar) {
      return locVar.slot;
    }

    return -1;
  }

  exitScope() {
    if (this.scopeLevel <= 0) {
      throw new Error('unmatched exitScope() call');
    }

    const { breaks } = this;
    const pendingBreakJumps = breaks[breaks.length - 1];
    this.breaks = breaks.slice(0, breaks.length - 1);
    if (pendingBreakJumps) {
      throw new Error('TODO: see page 324');
    }
    // const a = this.getJmpArgA();
    // for (let i = 0; i < pendingBreakJumps.length; i += 1) {
    //   const sBx = this.pc() - pc;
    // }

    this.scopeLevel -= 1;

    // eslint-disable-next-line no-restricted-syntax
    for (const locVar of Object.values(this.locNames)) {
      if (locVar.scopeLevel > this.scopeLevel) {
        this.removeLocVar(locVar);
      }
    }
  }

  removeLocVar(locVar) {
    this.freeReg();
    if (!locVar.prev) {
      this.locNames[locVar.name] = undefined;
    } else if (locVar.prev.scopeLevel === locVar.scopeLevel) {
      this.removeLocVar(locVar.prev);
    } else {
      this.locNames[locVar.name] = locVar.prev;
    }
  }

  addBreakJump(pc) {
    for (let i = this.scopeLevel; i >= 0; i -= 1) {
      const breaks = this.breaks[i];
      if (breaks) {
        breaks[i].push(pc);
        return;
      }
    }

    throw new Error('<break> at line ? not inside a loop');
  }

  indexOfUpval(name) {
    const { upvalues, parent } = this;
    if (name in upvalues) {
      return upvalues[name].index;
    }

    if (parent) {
      const { locNames } = parent;
      const locVar = locNames[name];
      if (locVar) {
        const index = upvalues.length;
        upvalues[name] = {
          locVarSlot: locVar.slot,
          upvalIndex: -1,
          index,
        };
        return index;
      }

      const uvIdx = parent.indexOfUpval(name);
      if (uvIdx >= 0) {
        const index = upvalues.length;
        upvalues[name] = {
          locVarSlot: -1,
          upvalIndex: uvIdx,
          index,
        };
        return index;
      }
    }

    return -1;
  }
}
