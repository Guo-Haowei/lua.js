/* eslint-disable no-bitwise */
import LuaStack from './stack.js';
import * as lua from './constants.js';
import {
  convertToBoolean,
  convertToNumber,
  convertToString,
  getLuaType,
  getLuaTypeString,
} from './value.js';
import LuaTable from './table.js';

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
    func: (a, b) => a & b,
  },
  {
    symbol: '|',
    func: (a, b) => a | b,
  },
  {
    symbol: '~',
    func: (a, b) => a ^ b,
  },
  {
    symbol: '<<',
    func: (a, b) => a << b,
  },
  {
    symbol: '>>',
    func: (a, b) => a >> b,
  },
  {
    symbol: '-',
    func: (a) => -a,
  },
  {
    symbol: '~',
    func: () => { throw new Error('TODO: implemented unary bnot'); },
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
    this.proto = proto || undefined;
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
        this.stack.push(undefined);
      }
    }
  }

  static checkType(value, expect) {
    const actual = getLuaType(value);
    if (actual === expect) {
      return;
    }

    throw new Error(`type of ${value} is not ${getLuaTypeString(expect)}!`);
  }

  pushNil() {
    this.stack.push(undefined);
  }

  pushBoolean(val) {
    LuaState.checkType(val, lua.LUA_TBOOLEAN);
    this.stack.push(val);
  }

  pushNumber(val) {
    LuaState.checkType(val, lua.LUA_TNUMBER);
    this.stack.push(val);
  }

  pushString(val) {
    LuaState.checkType(val, lua.LUA_TSTRING);
    this.stack.push(val);
  }

  newTable() {
    const table = new LuaTable();
    this.stack.push(table);
  }

  getTableInteral(table, key) {
    LuaState.checkType(table, lua.LUA_TTABLE);

    const value = table.get(key);
    this.stack.push(value);
    return getLuaType(value);
  }

  getTable(idx) {
    const table = this.stack.get(idx);
    const key = this.stack.pop();
    return this.getTableInteral(table, key);
  }

  getField(idx, key) {
    const table = this.stack.get(idx);
    return this.getTableInteral(table, key);
  }

  getIdx(idx, i) {
    const table = this.stack.get(idx);
    return this.getTableInteral(table, i);
  }

  static setTableInternal(table, key, value) {
    LuaState.checkType(table, lua.LUA_TTABLE);
    table.put(key, value);
  }

  setTable(idx) {
    const table = this.stack.get(idx);
    const value = this.stack.pop();
    const key = this.stack.pop();
    LuaState.setTableInternal(table, key, value);
  }

  setField(idx, key) {
    const table = this.stack.get(idx);
    const value = this.stack.pop();
    LuaState.setTableInternal(table, key, value);
  }

  setI(idx, i) {
    const table = this.stack.get(idx);
    const value = this.stack.pop();
    LuaState.setTableInternal(table, i, value);
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

  len(idx) {
    const val = this.stack.get(idx);
    const luaType = getLuaType(val);
    switch (luaType) {
      case lua.LUA_TSTRING:
        this.stack.push(val.length);
        break;
      case lua.LUA_TTABLE:
        this.stack.push(val.len());
        break;
      default:
        throw new Error(`cannot call len() on ${val}(type: ${getLuaTypeString(val)})`);
    }
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

  toBoolean(idx) {
    const val = this.stack.get(idx);
    return convertToBoolean(val);
  }

  toNumber(idx) {
    const val = this.stack.get(idx);
    const [num, ok] = convertToNumber(val);

    if (!ok) {
      throw new Error(`failed to parse number from <${val}>`);
    }

    return num;
  }

  // debug
  toString() {
    let result = '';
    for (let i = 0; i < this.stack.top; i += 1) {
      result += `[${convertToString(this.stack.slots[i])}]`;
    }
    return result;
  }
}
