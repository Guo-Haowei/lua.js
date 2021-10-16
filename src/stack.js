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
    if (idx === lua.LUA_REGISTTERYINDEX) {
      return true;
    }

    const absIdx = this.absIdx(idx);
    return absIdx > 0 && absIdx <= this.top;
  }

  get(idx) {
    if (idx === lua.LUA_REGISTTERYINDEX) {
      return this.state.registery;
    }

    const absIdx = this.absIdx(idx);
    if (absIdx > 0 && absIdx <= this.top) {
      return this.slots[absIdx - 1];
    }

    return null;
  }

  set(idx, val) {
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
    while (from < to) {
      [this.slots[from], this.slots[to]] = [this.slots[to], this.slots[from]];
      // eslint-disable-next-line no-param-reassign
      from += 1; to -= 1;
    }
  }
}
