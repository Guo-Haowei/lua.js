import { assert } from 'chai';
import { describe, it } from 'mocha';
import { MAXARG_BX, MAXARG_SBX, Instruction } from '../src/instruction.js';

describe('instruction.js', () => {
  describe('constants', () => {
    it('MAXARG_BX', () => {
      // eslint-disable-next-line no-bitwise
      assert.equal(MAXARG_BX, (1 << 18) - 1);
    });
    it('MAXARG_SBX', () => {
      // eslint-disable-next-line no-bitwise
      assert.equal(MAXARG_SBX, MAXARG_BX >>> 1);
    });
  });
  describe('Instruction', () => {
    [
      { opCode: 0x00400006, debugName: 'GETTABUP' },
    ].forEach((test) => {
      describe(`opcode: ${test.opCode}`, () => {
        const instruction = new Instruction(test.opCode);
        const { debugName } = instruction.getInfo();
        assert.equal(debugName, test.debugName);
      });
    });
  });
});

// \t2\t[1]\t0x00004041
// \t3\t[1]\t0x01004024
// \t4\t[1]\t0x00800026
