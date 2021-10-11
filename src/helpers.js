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

export {
  iABCImpl,
  iABxImpl,
  iAsBxImpl,
  iAxImpl,
  MAXARG_BX,
  MAXARG_SBX,
};
