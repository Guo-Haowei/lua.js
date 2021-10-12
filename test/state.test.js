import { assert } from 'chai';
import { describe, it } from 'mocha';
import LuaState from '../src/state.js';
import * as lua from '../src/constants.js';
import LuaStack from '../src/stack.js';

const createDummyState = () => {
  const state = new LuaState();
  const stack = new LuaStack(null);
  state.pushLuaStack(stack);
  return state;
};

describe('state.js', () => {
  describe('LuaStack', () => {
    describe('rotate(idx, n)', () => {
      const state1 = createDummyState();
      for (let idx = 0; idx < 5; idx += 1) {
        state1.stack.push(idx);
      }
      it('should rotate the stack', () => {
        state1.rotate(2, -1);
        [0, 2, 3, 4, 1].forEach((ele, idx) => {
          assert.equal(ele, state1.stack.slots[idx]);
        });
      });
    });
    describe('basic state operations', () => {
      it('should modify state', () => {
        const state2 = createDummyState();
        state2.pushBoolean(true);
        assert.equal(state2.toDebugString(), '[true]');
        state2.pushNumber(10);
        assert.equal(state2.toDebugString(), '[true][10]');
        state2.pushNil();
        assert.equal(state2.toDebugString(), '[true][10][nil]');
        state2.pushString('hello');
        assert.equal(state2.toDebugString(), '[true][10][nil][hello]');
        state2.pushValue(-4); // push value at -4(true) to top of stack
        assert.equal(state2.toDebugString(), '[true][10][nil][hello][true]');
        state2.replace(3); // pop top and push to slot 3
        assert.equal(state2.toDebugString(), '[true][10][true][hello]');
        state2.setTop(6); // fill slot 5, 6 with null
        assert.equal(state2.toDebugString(), '[true][10][true][hello][nil][nil]');
        state2.remove(-4); // remove true
        assert.equal(state2.toDebugString(), '[true][10][hello][nil][nil]');
        state2.setTop(-5); // remove last 4
        assert.equal(state2.toDebugString(), '[true]');
      });
    });
    describe('basic arith operations', () => {
      it('should modify state', () => {
        const state3 = createDummyState();
        [4, 3, 2, 1].forEach((ele) => state3.pushNumber(ele));
        assert.equal(state3.toDebugString(), '[4][3][2][1]');
        state3.arith(lua.LUA_OPSUB);
        assert.equal(state3.toDebugString(), '[4][3][1]');
        state3.arith(lua.LUA_OPADD);
        assert.equal(state3.toDebugString(), '[4][4]');
        state3.arith(lua.LUA_OPMUL);
        assert.equal(state3.toDebugString(), '[16]');
      });
    });
    describe('more arith operations', () => {
      it('should modify state', () => {
        const state4 = createDummyState();
        [1, 2, 3, 10.4, 4].forEach((ele) => state4.pushNumber(ele));
        state4.arith(lua.LUA_OPIDIV);
        assert.equal(state4.toDebugString(), '[1][2][3][2]');
        state4.arith(lua.LUA_OPPOW);
        assert.equal(state4.toDebugString(), '[1][2][9]');
        assert.equal(state4.compare(3, 2, lua.LUA_OPEQ), false);
        assert.equal(state4.compare(2, 3, lua.LUA_OPLT), true);
        state4.arith(lua.LUA_OPMOD);
        assert.equal(state4.toDebugString(), '[1][2]');
        state4.arith(lua.LUA_OPDIV);
        assert.equal(state4.toDebugString(), '[0.5]');
        const str = 'hello';
        state4.pushString(str);
        state4.len(2);
        assert.equal(state4.toDebugString(), `[0.5][${str}][${str.length}]`);
      });
    });
  });
});
