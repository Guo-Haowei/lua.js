/* eslint-disable no-console */
import { Instruction } from './instruction.js';
import { OpMode, OpArgMask } from './opcodes.js';
import LuaState from './state.js';

const writeInstruction = (ins) => {
  const {
    opMode, debugName, argBMode, argCMode,
  } = ins.getInfo();
  let s = `${debugName.padEnd(8, ' ')}`;
  switch (opMode) {
    case OpMode.IABC: {
      const { a, b, c } = ins.iABC();
      s += `\t${a}`;
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

const listProto = (proto) => {
  const {
    lineDefined, code, numParams, upvals, locVars, constants, protos, lineInfo, upvalueNames,
  } = proto;
  const funcType = lineDefined > 0 ? 'function' : 'main';
  const varargFlag = proto.isVararg > 0 ? '+' : '';
  process.stdout.write(`\n${funcType} <${proto.source}:${lineDefined}:${proto.lastLineDefined}>`);
  process.stdout.write(` (${code.length} instructions)`);
  process.stdout.write(`\n${numParams}${varargFlag} params, ${proto.maxStackSize} slots, ${upvals.length} upvals, `);
  process.stdout.write(`${locVars.length} locals, ${constants.length} constants, ${protos.length} functions\n`);

  code.forEach((ins, i) => {
    const line = lineInfo.length ? `${lineInfo[i]}` : '-';
    const instruction = new Instruction(ins);
    const detail = writeInstruction(instruction);
    process.stdout.write(`\t${i + 1}\t[${line}]\t${detail}\n`);
  });

  process.stdout.write(`constants (${constants.length}):\n`);
  constants.forEach((constant, i) => {
    process.stdout.write(`\t${i + 1}\t${constant}\n`);
  });

  process.stdout.write(`locals (${locVars.length}):\n`);
  locVars.forEach((locVar, i) => {
    process.stdout.write(`\t${i}\t${locVar.varName}\t${locVar.startPC + 1}\t${locVar.endPC + 1}\n`);
  });

  process.stdout.write(`upvals (${upvals.length}):\n`);
  upvals.forEach((upvalue, i) => {
    const upvalueName = upvalueNames.length ? upvalueNames[i] : '-';
    process.stdout.write(`\t${i}\t${upvalueName}\t${upvalue.inStack}\t${upvalue.index}\n`);
  });

  protos.forEach((ele) => listProto(ele));
};

const printImpl = (ls) => {
  const nArgs = ls.getTop();
  let output = '';
  for (let i = 1; i <= nArgs; i += 1) {
    if (ls.isString(i)) {
      output += ls.toString(i);
    } else if (ls.isNumber(i)) {
      output += `${ls.toNumber(i)}`;
    } else if (ls.isBoolean(i)) {
      output += `${ls.toBoolean(i)}`;
    } else {
      output += ls.typeName(i);
    }

    if (i < nArgs) {
      output += '\t';
    }
  }

  return output;
};

const print = (ls) => {
  console.log(printImpl(ls));
};

const luaMain = (chunk, fileName, myPrint) => {
  const ls = new LuaState();
  ls.register('print', myPrint || print);
  ls.load(chunk, fileName, 'b');
  ls.call(0, 0);
  return ls;
};

export {
  luaMain,
  listProto,
  printImpl, // for testing
};
