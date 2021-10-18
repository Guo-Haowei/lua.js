import { getLuaType } from './value.js';
import * as lua from './constants.js';

export default class LuaStack {
  constructor(n, ls) {
    this.slots = new Array(n || lua.LUA_MINSTACK);
    this.slots.fill(undefined);
    this.top = 0;
    this.state = ls;
    this.prevStack = null;
    this.varargs = [];
    this.closure = null;
    this.pc = 0;
    this.openuvs = {};
  }

  // check if there are n slots left
  check(n) {
    const free = this.slots.length - this.top;
    for (let idx = free; idx < n; idx += 1) {
      this.slots.push(undefined);
    }
  }

  push(val) {
    // validate type of value
    getLuaType(val);

    if (this.top >= this.slots.length) {
      // eslint-disable-next-line no-console
      console.error(`attempted to push [${val}] to stack(${this.top}/${this.slots.length})`);
      throw new Error('stack overflow!');
    }

    this.slots[this.top] = val;
    this.top += 1;
  }

  pushN(vals, n) {
    // eslint-disable-next-line no-param-reassign
    n = n < 0 ? vals.length : n;
    for (let i = 0; i < n; i += 1) {
      this.push(vals[i]);
    }
  }

  pop() {
    if (this.top < 1) {
      throw new Error('stack underflow!');
    }
    this.top -= 1;
    const ret = this.slots[this.top];
    this.slots[this.top] = undefined;
    return ret;
  }

  popN(n) {
    const ret = Array(n).fill(undefined);
    for (let i = n - 1; i >= 0; i -= 1) {
      ret[i] = this.pop();
    }
    return ret;
  }

  absIdx(idx) {
    if (idx <= lua.LUA_REGISTTERYINDEX) {
      return idx;
    }

    if (idx >= 0) {
      return idx;
    }

    return idx + this.top + 1;
  }

  isValidIdx(idx) {
    if (idx < lua.LUA_REGISTTERYINDEX) {
      const uvIdx = lua.LUA_REGISTTERYINDEX - idx - 1;
      const { closure } = this;
      return closure && uvIdx < closure.upvals.length;
    }

    if (idx === lua.LUA_REGISTTERYINDEX) {
      return true;
    }

    const absIdx = this.absIdx(idx);
    return absIdx > 0 && absIdx <= this.top;
  }

  get(idx) {
    if (idx < lua.LUA_REGISTTERYINDEX) {
      const uvIdx = lua.LUA_REGISTTERYINDEX - idx - 1;
      const { closure } = this;
      if (closure && uvIdx < closure.upvals.length) {
        return closure.upvals[uvIdx];
      }

      return undefined;
    }

    if (idx === lua.LUA_REGISTTERYINDEX) {
      return this.state.registery;
    }

    const absIdx = this.absIdx(idx);
    if (absIdx > 0 && absIdx <= this.top) {
      return this.slots[absIdx - 1];
    }

    return undefined;
  }

  set(idx, val) {
    if (idx < lua.LUA_REGISTTERYINDEX) {
      const uvIdx = lua.LUA_REGISTTERYINDEX - idx - 1;
      const { closure } = this;
      if (closure && uvIdx < closure.upvals.length) {
        closure.upvals[uvIdx] = val;
      }
      return;
    }

    if (idx === lua.LUA_REGISTTERYINDEX) {
      this.state.registery = val;
      return;
    }

    const absIdx = this.absIdx(idx);
    if (absIdx > 0 && absIdx <= this.top) {
      this.slots[absIdx - 1] = val;
      return;
    }

    throw new Error(`invalid index ${idx}/${this.top}`);
  }

  reverse(from, to) {
    const { slots } = this;
    while (from < to) {
      [slots[from], slots[to]] = [slots[to], slots[from]];
      // eslint-disable-next-line no-param-reassign
      from += 1; to -= 1;
    }
  }
}
