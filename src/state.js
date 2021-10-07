import LuaStack from './stack.js';
import * as lua from './constants.js';

const operators = [
  {
    symbol: '+',
    func: (a, b) => a + b,
  },
  {
    symbol: '-',
    func: (a, b) => a - b,
  },
  {
    symbol: '*',
    func: (a, b) => a * b,
  },
  {
    symbol: '%',
    func: (a, b) => a % b,
  },
  {
    symbol: '^',
    func: (a, b) => a ** b,
  },
  {
    symbol: '/',
    func: (a, b) => a / b,
  },
  {
    symbol: '//',
    func: (a, b) => Math.floor(a / b),
  },
  {
    symbol: '&',
    func: () => { throw new Error('TODO: implemented'); },
  },
  {
    symbol: '|',
    func: () => { throw new Error('TODO: implemented'); },
  },
  {
    symbol: '~',
    func: () => { throw new Error('TODO: implemented'); },
  },
  {
    symbol: '<<',
    func: () => { throw new Error('TODO: implemented'); },
  },
  {
    symbol: '>>',
    func: () => { throw new Error('TODO: implemented'); },
  },
  {
    symbol: '-',
    func: () => { throw new Error('TODO: implemented'); },
  },
  {
    symbol: '~',
    func: () => { throw new Error('TODO: implemented'); },
  },
];

const comparators = [
  {
    symbol: '==',
    func: (a, b) => a === b,
  },
  {
    symbol: '<',
    func: (a, b) => a < b,
  },
  {
    symbol: '<=',
    func: (a, b) => a <= b,
  },
];

const DEFAULT_STACKSIZE = 20;

export default class LuaState {
  constructor(proto, stackSize) {
    this.proto = proto || null;
    this.stack = new LuaStack(stackSize || DEFAULT_STACKSIZE);
    this.pc = 0;
  }

  getTop() {
    return this.stack.top;
  }

  absIdx(idx) {
    return this.stack.absIdx(idx);
  }

  checkStack(n) {
    this.stack.check(n);
    return true;
  }

  pop(n) {
    this.setTop(-1 - n);
  }

  copy(fromIdx, toIdx) {
    if (fromIdx === toIdx) {
      return;
    }
    const val = this.stack.get(fromIdx);
    this.stack.set(toIdx, val);
  }

  pushValue(idx) {
    const val = this.stack.get(idx);
    this.stack.push(val);
  }

  replace(idx) {
    const val = this.stack.pop();
    this.stack.set(idx, val);
  }

  insert(idx) {
    this.rotate(idx, 1);
  }

  remove(idx) {
    this.rotate(idx, -1);
    this.stack.pop();
  }

  rotate(idx, n) {
    const t = this.stack.top - 1;
    const p = this.stack.absIdx(idx) - 1;
    const m = n >= 0 ? t - n : p - n - 1;
    this.stack.reverse(p, m);
    this.stack.reverse(m + 1, t);
    this.stack.reverse(p, t);
  }

  setTop(idx) {
    const newTop = this.stack.absIdx(idx);
    if (newTop < 0) {
      throw new Error('stack underflow!');
    }

    const n = this.stack.top - newTop;
    if (n > 0) {
      for (let i = 0; i < n; i += 1) {
        this.stack.pop();
      }
    } else if (n < 0) {
      for (let i = 0; i > n; i -= 1) {
        this.stack.push(null);
      }
    }
  }

  static checkType(val, type) {
    // eslint-disable-next-line valid-typeof
    if (typeof val !== type) {
      throw new Error(`type of ${val} is not ${type}!`);
    }
  }

  pushNil() {
    this.stack.push(null);
  }

  pushBoolean(val) {
    LuaState.checkType(val, 'boolean');
    this.stack.push(val);
  }

  pushNumber(val) {
    LuaState.checkType(val, 'number');
    this.stack.push(val);
  }

  pushString(val) {
    LuaState.checkType(val, 'string');
    this.stack.push(val);
  }

  arith(op) {
    const b = this.stack.pop();
    const cond = op !== lua.LUA_OPUNM && op !== lua.LUA_OPBNOT;
    const a = cond ? this.stack.pop() : b;

    const { symbol, func } = operators[op];
    const aType = typeof a;
    const bType = typeof b;
    if (aType !== 'number' || bType !== 'number') {
      throw new Error(`Invalid operation: ${a}(${aType}) ${symbol} ${b}(${bType})`);
    }

    this.stack.push(func(a, b));
  }

  compare(idx1, idx2, op) {
    const a = this.stack.get(idx1);
    const b = this.stack.get(idx2);

    const { symbol, func } = comparators[op];

    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error(`invalid comparison: ${a} ${symbol} ${b}`);
    }

    return func(a, b);
  }

  // eslint-disable-next-line class-methods-use-this
  len() {
    throw new Error('TODO: implement');
  }

  // eslint-disable-next-line class-methods-use-this
  concat() {
    throw new Error('TODO: implement');
  }

  addPC(n) {
    this.pc += n;
  }

  fetch() {
    const i = this.proto.code[this.pc];
    this.pc += 1;
    return i;
  }

  getConst(idx) {
    const { constants } = this.proto;
    if (idx >= constants.length) {
      throw new Error(`index ${idx} is out of range ${constants}`);
    }
    const c = constants[idx];
    this.stack.push(c);
  }

  getRK(rk) {
    if (rk > 0xFF) {
      // eslint-disable-next-line no-bitwise
      this.getConst(rk & 0xFF);
    } else {
      this.pushValue(rk + 1);
    }
  }
}
