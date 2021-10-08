import { assert } from 'chai';
import { describe, it } from 'mocha';
import { luaMain, protoFromFile } from '../src/luac.js';

describe('luac.js', () => {
  const fileName = 'arith';
  const expect = [4, 5, 9, 45, 1, 45 / 4, 11, -1, 0, 0xFF, 0xFF, 8, 1, -8, 8 ** 9, 0xF0, 0xF];
  describe(`execute ${fileName}.luac`, () => {
    const proto = protoFromFile(`lua/${fileName}.luac`);
    const ls = luaMain(proto);

    const { slots, top } = ls.stack;
    it(`should modify stack to ${expect}`, () => {
      for (let i = 0; i < top; i += 1) {
        assert.equal(slots[i], expect[i]);
      }
    });
  });
});
