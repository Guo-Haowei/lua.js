/* eslint-disable no-bitwise */

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
