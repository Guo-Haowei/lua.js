/* eslint-disable no-unused-vars */
const LUA_TNONE = -1;
const LUA_TNIL = 0;
const LUA_TBOOLEAN = 1;
const LUA_TLIGHTUSERDATA = 2;
const LUA_TNUMBER = 3;
const LUA_TSTRING = 4;
const LUA_TTABLE = 5;
const LUA_TFUNCTION = 6;
const LUA_TUSERDATA = 7;
const LUA_TTHREAD = 8;
/* eslint-enable no-unused-vars */

export default class LuaStack {
  constructor(n) {
    this.slots = new Array(n);
    this.slots.fill(null);
    this.top = 0;
  }

  // check if there are n slots left
  check(n) {
    const free = this.slots.length - this.top;
    for (let idx = free; idx < n; idx += 1) {
      this.slots.push(null);
    }
  }

  push(val) {
    if (this.top >= this.slots.length) {
      // eslint-disable-next-line no-console
      console.error(`attempted to push [${val}] to stack(${this.top}/${this.slots.length})`);
      throw new Error('stack overflow!');
    }

    this.slots[this.top] = val;
    this.top += 1;
  }

  pop() {
    if (this.top < 1) {
      throw new Error('stack underflow!');
    }
    this.top -= 1;
    const ret = this.slots[this.top];
    this.slots[this.top] = null;
    return ret;
  }

  absIdx(idx) {
    if (idx >= 0) {
      return idx;
    }

    return idx + this.top + 1;
  }

  isValidIdx(idx) {
    const absIdx = this.absIdx(idx);
    return absIdx > 0 && absIdx <= this.top;
  }

  get(idx) {
    const absIdx = this.absIdx(idx);
    if (absIdx > 0 && absIdx <= this.top) {
      return this.slots[absIdx - 1];
    }

    return null;
  }

  set(idx, val) {
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
