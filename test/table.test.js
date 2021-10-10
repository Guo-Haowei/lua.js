import { assert } from 'chai';
import { describe, it } from 'mocha';
import LuaTable from '../src/table.js';

describe('table.js', () => {
  describe('get and set', () => {
    const table = new LuaTable();
    const initArr = [10, 9, 8, 7];

    initArr.forEach((ele, i) => {
      table.put(i + 1, ele);
    });

    initArr.forEach((ele, i) => {
      const idx = i + 1;
      it(`should get ${ele} at index ${idx}`, () => {
        assert.equal(table.get(idx), ele);
      });
    });

    const overflow = table.arr.length + 1;
    it(`should get nil at index ${overflow}`, () => {
      assert.isTrue(table.get(overflow) === undefined);
    });

    it('should not append nil', () => {
      const { arr } = table;
      table.put(arr.length + 1, undefined);
      assert.equal(arr.toString(), initArr.toString());
    });

    it('should remove last element if append nil', () => {
      const { arr } = table;
      table.put(arr.length, undefined);
      assert.equal(arr.toString(), initArr.slice(0, -1).toString());
    });
  });
});
