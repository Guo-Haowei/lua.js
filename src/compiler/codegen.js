import { MAXARG_SBX } from '../misc.js';
import {
  NilExpr,
  StringExpr,
  FuncCallExpr,
} from './node.js';

/* eslint-disable no-bitwise */
class FuncInfo {
  constructor(parent, funcDefExpr) {
    this.constants = [];
    this.usedRegs = 0;
    this.maxRegs = 0;
    this.scopeLevel = 0;
    this.locVars = [];
    this.locNames = {};
    this.breaks = [];
    this.parent = parent;
    this.upvalues = {};
    this.insts = [];
    this.subFuncs = [];
    this.isVararg = funcDefExpr.isVararg;
    this.numParams = funcDefExpr.paramList.length;
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

  emitABC(op, a, b, c) {
    const i = (b << 23) | (c << 14) | (a << 6) | op;
    this.insts.push(i);
  }

  emitABx(op, a, bx) {
    const i = (bx << 14) | (a << 6) | op;
    this.insts.push(i);
  }

  emitAsBx(op, a, b) {
    const i = ((b + MAXARG_SBX) << 14) | (a << 6) | op;
    this.insts.push(i);
  }

  emitAx(op, ax) {
    const i = (ax << 6) | op;
    this.insts.push(i);
  }

  pc() {
    return this.insts.length - 1;
  }

  fixSbx(pc, sBx) {
    const { insts } = this;
    let i = insts[pc];
    i = (i << 18) >> 18;
    i |= (sBx + MAXARG_SBX) << 14;
    insts[pc] = i;
  }
}

const isVarargOrFuncCall = (node) => {
  if (node instanceof FuncCallExpr) {
    return true;
  }

  return false;
};

const genExpr = (funcInfo, node, a, n) => {
  if (node instanceof NilExpr) {
    return funcInfo.emitLoadNil(a, n);
  }
  if (node instanceof StringExpr) {
    return funcInfo.emitLoadK(a, node.string);
  }

  throw new Error('TODO');
};

const prepFuncCall = (funcInfo, node, a) => {
  console.log(node);
  console.log(a.b.c.d);

  let nArgs = node.args.length;
  let lastArgIsVarargOrFuncCall = false;

  genExpr(funcInfo, node.prefixExpr, a, 1);
  if (node.nameExpr) {
    throw new Error('??');
    // see page 347
    // const c = 0x100 + funcInfo.indexOfConstant(node.nameExpr);
  }

  for (let i = 0; i < node.args.length; i += 1) {
    const arg = node.args[i];
    const tmp = funcInfo.allocReg();
    if ((i === nArgs - 1) && (isVarargOrFuncCall(arg))) {
      lastArgIsVarargOrFuncCall = true;
      genExpr(funcInfo, arg, tmp, -1);
    } else {
      genExpr(funcInfo, arg, tmp, 1);
    }
  }
  funcInfo.freeRegs(nArgs);

  if (node.nameExpr) {
    nArgs += 1;
  }
  if (lastArgIsVarargOrFuncCall) {
    nArgs -= 1;
  }

  return nArgs;
};

const genFuncCallExpr = (funcInfo, node, a, n) => {
  const nArgs = prepFuncCall(funcInfo, node, a);
  funcInfo.emitCall(a, nArgs, n);
};

const genFuncCallStat = (funcInfo, node) => {
  const r = funcInfo.allocReg();
  genFuncCallExpr(funcInfo, node, r, 0);
  funcInfo.freeReg();
};

const genStat = (funcInfo, node) => {
  if (node instanceof FuncCallExpr) {
    return genFuncCallStat(funcInfo, node);
  }

  throw new Error('TODO');
};

const genBlock = (funcInfo, node) => {
  node.stats.forEach((stat) => {
    genStat(stat);
  });
};

export {
  FuncInfo,
  genBlock,
};
