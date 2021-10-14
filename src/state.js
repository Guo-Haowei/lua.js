/* eslint-disable no-bitwise */
import * as lua from './constants.js';
import {
  convertToBoolean,
  convertToNumber,
  convertToString,
  expectLuaType,
  getLuaType,
  getLuaTypeString,
} from './value.js';
import LuaTable from './table.js';
import LuaStack from './stack.js';
import LuaClosure from './closure.js';
import { operators, comparators } from './misc.js';
import { undump } from './binary-chunk.js';
import { Instruction } from './instruction.js';
import { OpCode } from './opcodes.js';

export default class LuaState {
  constructor(cap) {
    this.stack = new LuaStack(cap);
  }

  pushLuaStack(stack) {
    // eslint-disable-next-line no-param-reassign
    stack.prevStack = this.stack;
    this.stack = stack;
  }

  popLuaStack() {
    const { stack } = this;
    if (stack === null) {
      throw new Error('stack is null');
    }

    this.stack = stack.prevStack;
    stack.prevStack = null;
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

  pushNil() {
    this.stack.push(undefined);
  }

  pushBoolean(val) {
    expectLuaType(val, lua.LUA_TBOOLEAN);
    this.stack.push(val);
  }

  pushNumber(val) {
    expectLuaType(val, lua.LUA_TNUMBER);
    this.stack.push(val);
  }

  pushString(val) {
    expectLuaType(val, lua.LUA_TSTRING);
    this.stack.push(val);
  }

  newTable() {
    const table = new LuaTable();
    this.stack.push(table);
  }

  getTableInteral(table, key) {
    expectLuaType(table, lua.LUA_TTABLE);

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
    expectLuaType(table, lua.LUA_TTABLE);
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

    const { func } = comparators[op];

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
        throw new Error(`cannot call len() on ${val}(type: ${getLuaTypeString(luaType)})`);
    }
  }

  concat(n) {
    if (n === 1) {
      return;
    }

    if (n === 0) {
      this.stack.push('');
      return;
    }

    for (let i = 1; i < n; i += 1) {
      if (!this.isString(-1) || !this.isString(-2)) {
        throw new Error('concat error');
      }

      const s2 = this.toString(-1);
      const s1 = this.toString(-2);
      this.stack.pop();
      this.stack.pop();
      this.stack.push(s1 + s2);
    }
  }

  pc() {
    return this.stack.pc;
  }

  addPC(n) {
    this.stack.pc += n;
  }

  fetch() {
    const { stack } = this;
    const { code } = stack.closure.proto;
    if (stack.pc >= code.length) {
      throw new Error(`pc overflows ${stack.pc}/${code.length}`);
    }
    const i = code[stack.pc];
    stack.pc += 1;
    return i;
  }

  getConst(idx) {
    const { constants } = this.stack.closure.proto;
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

  registerCount() {
    return this.stack.closure.proto.maxStackSize;
  }

  // api_access
  isString(idx) {
    const val = this.stack.get(idx);
    const type = getLuaType(val);
    return type === lua.LUA_TSTRING || type === lua.LUA_TNUMBER;
  }

  toStringX(idx) {
    const val = this.stack.get(idx);
    const type = getLuaType(val);
    switch (type) {
      case lua.LUA_TSTRING:
        return [val, true];
      case lua.LUA_TNUMBER: {
        const s = `${val}`;
        this.stack.set(idx, s); // convert from number to string
        return [s, true];
      }
      default:
        return ['', false];
    }
  }

  toString(idx) {
    // eslint-disable-next-line no-unused-vars
    const [s, ok] = this.toStringX(idx);
    return s;
  }

  // eslint-disable-next-line no-unused-vars
  load(chunck, chunckName, mode) {
    const proto = undump(chunck);
    const closure = new LuaClosure(proto);
    this.stack.push(closure);
    return 0;
  }

  loadVararg(n) {
    const { varargs } = this.stack;
    // eslint-disable-next-line no-param-reassign
    n = n < 0 ? varargs.length : n;

    this.stack.check(n);
    this.stack.pushN(varargs, n);
  }

  loadProto(idx) {
    const proto = this.stack.closure.proto.protos[idx];
    const closure = new LuaClosure(proto);
    this.stack.push(closure);
  }

  call(nArgs, nResults) {
    const closure = this.stack.get(-(nArgs + 1));
    expectLuaType(closure, lua.LUA_TFUNCTION);

    const { source, lineDefined, lastLineDefined } = closure.proto;
    console.log(`call ${source}<${lineDefined},${lastLineDefined}>`);
    this.callLuaClosure(nArgs, nResults, closure);
  }

  callLuaClosure(nArgs, nResults, closure) {
    const { maxStackSize, numParams, isVararg } = closure.proto;
    const newStack = new LuaStack(maxStackSize + 20);
    newStack.closure = closure;

    const funcAndArgs = this.stack.popN(nArgs + 1);
    newStack.pushN(funcAndArgs.slice(1), numParams);
    newStack.top = maxStackSize;
    if (nArgs > numParams && isVararg) {
      newStack.varargs = funcAndArgs.slice(numParams + 1);
    }

    this.pushLuaStack(newStack);
    this.runLuaClosure();
    this.popLuaStack();

    if (nResults !== 0) {
      const results = newStack.popN(newStack.top - maxStackSize);
      this.stack.check(results.length);
      this.stack.pushN(results, nResults);
    }
  }

  runLuaClosure() {
    for (;;) {
      const ins = new Instruction(this.fetch());
      // const { debugName } = ins.getInfo();
      // console.log(`executing instruction ${debugName}`);
      ins.execute(this);
      if (ins.opCode() === OpCode.RETURN) {
        break;
      }
    }
  }

  // debug
  toDebugString() {
    let result = '';
    for (let i = 0; i < this.stack.top; i += 1) {
      result += `[${convertToString(this.stack.slots[i])}]`;
    }
    return result;
  }
}
