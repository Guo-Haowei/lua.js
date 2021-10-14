/* eslint-disable no-bitwise */
import { getLuaType } from './value.js';
import * as lua from './constants.js';

const MAXARG_BX = 262143; // 1 << 18 - 1
const MAXARG_SBX = 131071; // MAXARG_BX >> 1

const iABCImpl = (raw) => ({
  a: (raw >>> 6) & 0xFF,
  c: (raw >>> 14) & 0x1FF,
  b: (raw >>> 23) & 0x1FF,
});

const iABxImpl = (raw) => ({
  a: (raw >>> 6) & 0xFF,
  bx: (raw >>> 14),
});

const iAsBxImpl = (raw) => {
  const { a, bx } = iABxImpl(raw);
  return {
    a,
    sbx: bx - MAXARG_SBX,
  };
};

const iAxImpl = (raw) => ({
  ax: (raw >>> 6),
});

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
    func: (a, b) => {
      const typeA = getLuaType(a);
      switch (typeA) {
        case lua.LUA_TNIL:
          return b === undefined;
        case lua.LUA_TBOOLEAN:
        case lua.LUA_TSTRING:
        case lua.LUA_TNUMBER:
          return a === b;
        default:
          return a === b;
      }
    },
  },
  {
    symbol: '<',
    func: (a, b) => {
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`invalid comparison: ${a} < ${b}`);
      }
      return a < b;
    },
  },
  {
    symbol: '<=',
    func: (a, b) => {
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`invalid comparison: ${a} <= ${b}`);
      }
      return a <= b;
    },
  },
];

export {
  iABCImpl,
  iABxImpl,
  iAsBxImpl,
  iAxImpl,
  MAXARG_BX,
  MAXARG_SBX,
  operators,
  comparators,
};
