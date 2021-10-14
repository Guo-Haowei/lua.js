import { assert } from 'chai';
import { describe, it } from 'mocha';
import LuaStack from '../src/stack.js';

describe('stack.js', () => {
  describe('LuaStack', () => {
    const defaultLen = 2;
    const stack1 = new LuaStack(defaultLen);
    describe(`constructor(${defaultLen})`, () => {
      it(`should create stack of size ${defaultLen}`, () => {
        assert.equal(stack1.slots.length, defaultLen);
      });
      it('should fill slots with undefined', () => {
        stack1.slots.forEach((ele) => {
          assert.equal(ele, undefined);
        });
      });
    });
    describe('push(value)', () => {
      const intValue = 255;
      const strValue = 'test string';
      it(`should push int value ${intValue}`, () => {
        stack1.push(intValue);
        assert.equal(stack1.slots[0], intValue);
      });
      it(`should push string value ${strValue}`, () => {
        stack1.push(strValue);
        assert.equal(stack1.slots[1], strValue);
      });
      it('should overflow', () => {
        assert.throw(() => { for (;;) { stack1.push(true); } }, 'stack overflow!');
      });
    });
    describe('pop()', () => {
      const defaultLen2 = 4;
      const stack2 = new LuaStack(defaultLen2);
      const bool = false;
      stack2.push(bool);
      it(`should pop ${bool}`, () => {
        assert.equal(stack2.pop(), bool);
        assert.equal(stack2.top, 0);
      });
      it('should underflow', () => {
        assert.throw(() => { stack2.pop(); }, 'stack underflow!');
      });
    });
    describe('popN()', () => {
      const array = [true, 10, 20.5, false, 'hello'];
      const stack = new LuaStack(array.length);
      array.forEach((ele) => {
        stack.push(ele);
      });
      const offset = 1;
      it(`should pop ${array.slice(offset)}}`, () => {
        assert.deepEqual(stack.popN(array.length - offset), array.slice(offset));
      });
    });
  });
});
