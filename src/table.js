const DEFAULT_ARRAY_LENGTH = 20;

export default class LuaTable {
  constructor() {
    this.arr = new Array(DEFAULT_ARRAY_LENGTH).fill(undefined);
    this.map = {};
  }

  shrinkArray() {
    const { arr } = this;
    while (arr.length && arr[arr.length - 1] === undefined) {
      arr.pop();
    }
  }

  static checkKeyType(key) {
    switch (typeof key) {
      case 'string':
      case 'number':
        break;
      default:
        throw new Error(`unexpected key ${key}(type: ${typeof key})`);
    }
  }

  get(key) {
    const { arr, map } = this;

    if (Number.isInteger(key)) {
      const idx = key - 1;
      return arr[idx];
    }

    LuaTable.checkKeyType(key);

    return map[key];
  }

  put(key, value) {
    if (key === undefined) {
      throw new Error('table index is nil!');
    }
    if (Number.isNaN(key)) {
      throw new Error('table index is NaN!');
    }

    const { arr } = this;
    if (Number.isInteger(key)) {
      const idx = key - 1;
      if (idx >= 0) {
        if (idx < arr.length) {
          arr[idx] = value;
          this.shrinkArray();
          return;
        }
        if (idx === arr.length) {
          if (value !== undefined) {
            arr.push(value);
          }
          return;
        }
      }
    }

    LuaTable.checkKeyType(key);

    if (value !== undefined) {
      this.map[key] = value;
    } else {
      delete this.map[key];
    }
  }

  len() {
    return this.arr.length;
  }
}
