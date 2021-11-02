import { assert } from 'chai';
import { describe, it } from 'mocha';
import { readFileSync } from 'fs';
import { luaMain, printImpl } from '../src/luac.js';

describe('luac.js', () => {
  [
    {
      fileName: 'arith',
      expect: [4, 5, 9, 45, 1, 45 / 4, 11, -1, 0, 0xFF, 0xFF, 8, 1, -8, 8 ** 9, 0xF0, 0xF],
    },
    {
      fileName: 'sum',
      expect: [2550, 101, 100, 1, 100, 0],
    },
    {
      fileName: 'table',
      expect: [undefined, 'cBaBar3', 'B', 'a', 'Bar', 3],
    },
  ].forEach((ele) => {
    const { fileName, expect } = ele;
    describe(`test ${fileName}.luac`, () => {
      const chunk = readFileSync(`lua/${fileName}.luac`);
      const ls = luaMain(chunk, fileName);

      const { slots, top } = ls.stack;
      it(`should modify stack to ${expect}`, () => {
        for (let i = 0; i < top; i += 1) {
          // skip object for now
          if (typeof slots[i] !== 'object') {
            assert.equal(slots[i], expect[i]);
          }
        }
      });
    });
  });

  [
    {
      fileName: 'func',
      expect: [128, 128, 4, 128, 1, 128, 4],
    },
    {
      fileName: 'upval',
      expect: [1, 2, 1, 3, 2],
    },
    {
      fileName: 'fib',
      expect: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34],
    },
  ].forEach((ele) => {
    const { fileName, expect } = ele;
    describe(`test ${fileName}.luac`, () => {
      const chunk = readFileSync(`lua/${fileName}.luac`);
      let myStdout = '';
      const myPrint = (ls) => {
        myStdout += `${printImpl(ls)}\n`;
      };

      luaMain(chunk, fileName, myPrint);

      it(`${fileName} should has expected output ${expect}`, () => {
        let actual = myStdout.replace(/\t/g, ' ');
        actual = actual.replace(/\n/g, ' ');
        actual = actual.split(' ');
        actual = actual.filter((e) => e !== '');
        actual = actual.map((e) => Number.parseInt(e, 10));
        assert.deepEqual(actual, expect);
      });
    });
  });
});
