import { assert } from 'chai';
import { describe, it } from 'mocha';
import { readFileSync } from 'fs';
import { Decoder, undump } from '../src/binary-chunk.js';
import { Instruction } from '../src/vm/instruction.js';
import { OpMode, OpArgMask } from '../src/vm/opcodes.js';

// TODO: refactor
const writeInstruction = (ins) => {
  const {
    opMode, debugName, argBMode, argCMode,
  } = ins.getInfo();
  let s = `${debugName.padEnd(8, ' ')}`;
  switch (opMode) {
    case OpMode.IABC: {
      const { a, b, c } = ins.iABC();
      s += `\t${a} `;
      if (argBMode !== OpArgMask.N) {
        // eslint-disable-next-line no-bitwise
        const argB = (b > 0xFF) ? -1 - (b & 0xFF) : b;
        s += ` ${argB}`;
      }
      if (argCMode !== OpArgMask.N) {
        // eslint-disable-next-line no-bitwise
        const argC = (c > 0xFF) ? -1 - (c & 0xFF) : c;
        s += ` ${argC}`;
      }
      break;
    }
    case OpMode.IABx: {
      const { a, bx } = ins.iABx();
      s += `\t${a} `;
      if (argBMode === OpArgMask.K) {
        s += `${-1 - bx}`;
      } else if (argBMode === OpArgMask.U) {
        s += `${bx}`;
      }
      break;
    }
    case OpMode.IAsBx: {
      const { a, sbx } = ins.iAsBx();
      s += `\t${a} ${sbx}`;
      break;
    }
    case OpMode.IAx: {
      const { ax } = ins.iAx();
      s += `\t${-1 - ax}`;
      break;
    }
    default:
      throw new Error(`Invalid opMode ${opMode}`);
  }

  return s;
};

const writeProto = (proto, stream) => {
  let s = stream || '';
  const {
    lineDefined, code, numParams, upvalues, locVars, constants, protos, lineInfo, upvalueNames,
  } = proto;
  const funcType = lineDefined > 0 ? 'function' : 'main';
  const varargFlag = proto.isVararg > 0 ? '+' : '';
  s += `\n${funcType} <${proto.source}:${lineDefined}:${proto.lastLineDefined}>`;
  s += ` (${code.length} instructions)`;
  s += `\n${numParams}${varargFlag} params, ${proto.maxStackSize} slots, ${upvalues.length} upvalues, `;
  s += `${locVars.length} locals, ${constants.length} constants, ${protos.length} functions\n`;

  code.forEach((ins, i) => {
    const line = lineInfo.length ? `${lineInfo[i]}` : '-';
    const instruction = new Instruction(ins);
    const detail = writeInstruction(instruction);
    s += `\t${i + 1}\t[${line}]\t${detail}\n`;
  });

  s += `constants (${constants.length}):\n`;
  constants.forEach((constant, i) => {
    s += `\t${i + 1}\t${constant}\n`;
  });

  s += `locals (${locVars.length}):\n`;
  locVars.forEach((locVar, i) => {
    s += `\t${i}\t${locVar.varName}\t${locVar.startPC + 1}\t${locVar.endPC + 1}\n`;
  });

  s += `upvalues (${upvalues.length}):\n`;
  upvalues.forEach((upvalue, i) => {
    const upvalueName = upvalueNames.length ? upvalueNames[i] : '-';
    s += `\t${i}\t${upvalueName}\t${upvalue.inStack}\t${upvalue.index}\n`;
  });

  protos.forEach((ele) => writeProto(ele, s));
  return s;
};

describe('binary-chunk.js', () => {
  describe('Decoder', () => {
    describe('readByte()', () => {
      const array = [65, 66];
      const decoder = new Decoder(new Uint8Array(array));
      it('should read 65', () => {
        assert.equal(decoder.readByte(), array[0]);
      });
      it('should read 66', () => {
        assert.equal(decoder.readByte(), array[1]);
      });
      it('should throw out of bound error', () => {
        assert.throw(() => { decoder.readByte(); }, 'Buffer out of bound');
      });
    });

    describe('readBytes()', () => {
      const decoder = new Decoder(new Uint8Array([65, 66, 67, 68, 69, 70, 71]));
      const test1 = 'AB';
      it(`should read '${test1}'`, () => {
        assert.equal(decoder.readBytes(2), test1);
      });
      const test2 = 'CDEF';
      it(`should read '${test2}'`, () => {
        assert.equal(decoder.readBytes(4), test2);
      });
      it('should throw out of bound error', () => {
        assert.throw(() => { decoder.readBytes(3); }, 'Buffer out of bound');
      });
    });

    describe('readUint32()', () => {
      it('should read uint32', () => {
        const decoder = new Decoder(
          new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34, 0x12]),
        );
        assert.equal(decoder.readUint32(), 0x9ABCDEF0);
        assert.equal(decoder.readUint32(), 0x12345678);
      });
    });

    describe('readInt64()', () => {
      it('should read int64', () => {
        const decoder = new Decoder(
          new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34, 0x12]),
        );
        assert.equal(decoder.readInt64(), BigInt('0x123456789ABCDEF0'));
      });
      it('should throw out of bound error', () => {
        const decoder = new Decoder(new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34]));
        assert.throw(() => { decoder.readInt64(); }, 'Buffer out of bound');
      });
    });

    describe('readFloat64()', () => {
      const myFloat1 = 990.232;
      const myFloat2 = 23.333;
      const decoder = new Decoder(new Uint8Array(new Float64Array([myFloat1, myFloat2]).buffer));
      it('should read float64', () => {
        assert.equal(decoder.readFloat64(), myFloat1);
        assert.equal(decoder.readFloat64(), myFloat2);
      });
      it('should throw out of bound error', () => {
        assert.throw(() => { decoder.readFloat64(); }, 'Buffer out of bound');
      });
    });
  });

  describe('undump()', () => {
    it('should undump binary chunk', () => {
      const protoString = writeProto(undump(readFileSync('test/hello_world.luac')));
      console.log(protoString);
    });
  });
});
