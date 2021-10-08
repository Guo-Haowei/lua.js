import { assert } from 'chai';
import { describe, it } from 'mocha';
import LuaState from '../src/state.js';
import * as lua from '../src/constants.js';

describe('state.js', () => {
  describe('LuaStack', () => {
    describe('rotate(idx, n)', () => {
      const state1 = new LuaState();
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
        const state2 = new LuaState();
        state2.pushBoolean(true);
        assert.equal(state2.toString(), '[true]');
        state2.pushNumber(10);
        assert.equal(state2.toString(), '[true][10]');
        state2.pushNil();
        assert.equal(state2.toString(), '[true][10][null]');
        state2.pushString('hello');
        assert.equal(state2.toString(), '[true][10][null][hello]');
        state2.pushValue(-4); // push value at -4(true) to top of stack
        assert.equal(state2.toString(), '[true][10][null][hello][true]');
        state2.replace(3); // pop top and push to slot 3
        assert.equal(state2.toString(), '[true][10][true][hello]');
        state2.setTop(6); // fill slot 5, 6 with null
        assert.equal(state2.toString(), '[true][10][true][hello][null][null]');
        state2.remove(-4); // remove true
        assert.equal(state2.toString(), '[true][10][hello][null][null]');
        state2.setTop(-5); // remove last 4
        assert.equal(state2.toString(), '[true]');
      });
    });
    describe('basic arith operations', () => {
      it('should modify state', () => {
        const state3 = new LuaState();
        [4, 3, 2, 1].forEach((ele) => state3.pushNumber(ele));
        assert.equal(state3.toString(), '[4][3][2][1]');
        state3.arith(lua.LUA_OPSUB);
        assert.equal(state3.toString(), '[4][3][1]');
        state3.arith(lua.LUA_OPADD);
        assert.equal(state3.toString(), '[4][4]');
        state3.arith(lua.LUA_OPMUL);
        assert.equal(state3.toString(), '[16]');
      });
    });
    describe('more arith operations', () => {
      it('should modify state', () => {
        const state4 = new LuaState();
        [1, 2, 3, 10.4, 4].forEach((ele) => state4.pushNumber(ele));
        state4.arith(lua.LUA_OPIDIV);
        assert.equal(state4.toString(), '[1][2][3][2]');
        state4.arith(lua.LUA_OPPOW);
        assert.equal(state4.toString(), '[1][2][9]');
        assert.equal(state4.compare(3, 2, lua.LUA_OPEQ), false);
        assert.equal(state4.compare(2, 3, lua.LUA_OPLT), true);
        state4.arith(lua.LUA_OPMOD);
        assert.equal(state4.toString(), '[1][2]');
        state4.arith(lua.LUA_OPDIV);
        assert.equal(state4.toString(), '[0.5]');
      });
    });
  });
});
