import LuaStack from './stack.js';
import * as lua from './constants.js';

const operators = [
  {
    symbol: '+',
    func: (a, b) => a + b,
  },
];

const DEFAULT_STACKSIZE = 20;

export default class LuaState {
  constructor() {
    this.stack = new LuaStack(DEFAULT_STACKSIZE);
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

  pushInteger(val) {
    this.pushNumber(val);
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
}
