/* eslint-disable prefer-const */
import * as lua from './constants.js';
import { iAxImpl } from './helpers.js';

/* eslint-disable no-plusplus */
let counter = 0;
const OpMode = {
  IABC: counter++, //  [  B:9  ][  C:9  ][ A:8  ][OP:6]
  IABx: counter++, //  [      Bx:18     ][ A:8  ][OP:6]
  IAsBx: counter++, // [     sBx:18     ][ A:8  ][OP:6]
  IAx: counter++, //   [           Ax:26        ][OP:6]
};
Object.freeze(OpMode);

counter = 0;
const OpArgMask = {
  N: counter++, // argument is not used
  U: counter++, // argument is used
  R: counter++, // argument is a register or a jump offset
  K: counter++, // argument is a constant or register/constant
};
Object.freeze(OpArgMask);

counter = 0;
const OpCode = {
  MOVE: counter++,
  LOADK: counter++,
  LOADKX: counter++,
  LOADBOOL: counter++,
  LOADNIL: counter++,
  GETUPVAL: counter++,
  GETTABUP: counter++,
  GETTABLE: counter++,
  SETTABUP: counter++,
  SETUPVAL: counter++,
  SETTABLE: counter++,
  NEWTABLE: counter++,
  SELF: counter++,
  ADD: counter++,
  SUB: counter++,
  MUL: counter++,
  MOD: counter++,
  POW: counter++,
  DIV: counter++,
  IDIV: counter++,
  BAND: counter++,
  BOR: counter++,
  BXOR: counter++,
  SHL: counter++,
  SHR: counter++,
  UNM: counter++,
  BNOT: counter++,
  NOT: counter++,
  LEN: counter++,
  CONCAT: counter++,
  JMP: counter++,
  EQ: counter++,
  LT: counter++,
  LE: counter++,
  TEST: counter++,
  TESTSET: counter++,
  CALL: counter++,
  TAILCALL: counter++,
  RETURN: counter++,
  FORLOOP: counter++,
  FORPREP: counter++,
  TFORCALL: counter++,
  TFORLOOP: counter++,
  SETLIST: counter++,
  CLOSURE: counter++,
  VARARG: counter++,
  EXTRAARG: counter++,
};
Object.freeze(OpCode);

class OpCodeInfo {
  constructor(testFlag, setAFlag, argBMode, argCMode, opMode, debugName, action) {
    this.testFlag = testFlag;
    this.setAFlag = setAFlag;
    this.argBMode = argBMode;
    this.argCMode = argCMode;
    this.opMode = opMode;
    this.debugName = debugName;
    this.action = action;
  }
}

const move = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;
  vm.copy(b, a);
};

const jmp = (ins, vm) => {
  const { a, sbx } = ins.iAsBx();
  vm.addPC(sbx);
  if (a !== 0) {
    throw new Error('TODO!');
  }
};

const loadNil = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  vm.pushNil();
  for (let i = a; i <= a + b; i += 1) {
    vm.copy(-1, i);
  }
  vm.pop(1);
};

const loadBool = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  vm.pushBoolean(b !== 0);
  vm.replace(a);
  if (c !== 0) {
    vm.addPC(1);
  }
};

const loadK = (ins, vm) => {
  let { a, bx } = ins.iABx();
  a += 1;

  vm.getConst(bx);
  vm.replace(a);
};

const loadKx = (ins, vm) => {
  let { a } = ins.iABx();
  a += 1;
  // eslint-disable-next-line no-bitwise
  const ax = vm.fetch() >>> 6;
  vm.getConst(ax);
  vm.replace(a);
};

const binaryArith = (ins, vm, op) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  vm.getRK(b);
  vm.getRK(c);
  vm.arith(op);
  vm.replace(a);
};

const unaryArith = (ins, vm, op) => {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;

  vm.pushValue(b);
  vm.arith(op);
  vm.replace(a);
};

const add = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPADD); };
const sub = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPSUB); };
const mul = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPMUL); };
const mod = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPMOD); };
const pow = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPPOW); };
const div = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPDIV); };
const idiv = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPIDIV); };
const band = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPBAND); };
const bor = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPBOR); };
const bxor = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPBXOR); };
const shl = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPSHL); };
const shr = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPSHR); };
const unm = (ins, vm) => { unaryArith(ins, vm, lua.LUA_OPUNM); };
const bnot = (ins, vm) => { unaryArith(ins, vm, lua.LUA_OPBNOT); };

const compare = (ins, vm, op) => {
  const { a, b, c } = ins.iABC();
  vm.getRK(b);
  vm.getRK(c);
  if (vm.compare(-2, -1, op) !== (a !== 0)) {
    vm.addPC(1);
  }
  vm.pop(2);
};

const eq = (ins, vm) => { compare(ins, vm, lua.LUA_OPEQ); };
const lt = (ins, vm) => { compare(ins, vm, lua.LUA_OPLT); };
const le = (ins, vm) => { compare(ins, vm, lua.LUA_OPLE); };

const not = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;
  vm.pushBoolean(!vm.toBoolean(b));
  vm.replace(a);
};

const testSet = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;
  b += 1;

  if (vm.toBoolean(b) === (c !== 0)) {
    vm.copy(b, a);
  } else {
    vm.addPC(1);
  }
};

const test = (ins, vm) => {
  let { a, c } = ins.iABC();
  a += 1;

  if (vm.toBoolean(a) !== (c !== 0)) {
    vm.addPC(1);
  }
};

const forPrep = (ins, vm) => {
  let { a, sbx } = ins.iAsBx();
  a += 1;

  // R(A) -= R(A+2)
  vm.pushValue(a);
  vm.pushValue(a + 2);
  vm.arith(lua.LUA_OPSUB);
  vm.replace(a);

  // pc += sbx
  vm.addPC(sbx);
};

const forLoop = (ins, vm) => {
  let { a, sbx } = ins.iAsBx();
  a += 1;

  // R(A) += R(A+2)
  vm.pushValue(a + 2);
  vm.pushValue(a);
  vm.arith(lua.LUA_OPADD);
  vm.replace(a);

  // R(A) <?= R(A+1)
  const isStepPositive = vm.toNumber(a + 2) >= 0;
  if (
    (isStepPositive && vm.compare(a, a + 1, lua.LUA_OPLE))
    || (!isStepPositive && vm.compare(a + 1, a, lua.LUA_OPLE))
  ) {
    vm.addPC(sbx);
    vm.copy(a, a + 3);
  }
};

const newTable = (ins, vm) => {
  let { a } = ins.iABC(); // we don't pass initial size to construct table
  a += 1;

  vm.createTable();
  vm.replace(a);
};

const getTable = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;
  b += 1;

  vm.getRK(c);
  vm.getTable(b);
  vm.replace(a);
};

const setTable = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  vm.getRK(b);
  vm.getRK(c);
  vm.setTable(a);
};

const setList = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  if (c > 0) {
    c -= 1;
  } else {
    c = iAxImpl(vm.fetch).ax;
  }

  const LFIELDS_PER_FLUSH = 50;
  let idx = c * LFIELDS_PER_FLUSH;
  for (let i = 1; i <= b; i += 1) {
    idx += 1;
    vm.pushValue(a + i);
    vm.setI(a, idx);
  }
};

const opCodeInfos = [
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'MOVE    ', move), // R(A) := R(B)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.N, OpMode.IABx, 'LOADK   ', loadK), // R(A) := Kst(Bx)
  new OpCodeInfo(0, 1, OpArgMask.N, OpArgMask.N, OpMode.IABx, 'LOADKX  ', loadKx), // R(A) := Kst(extra arg)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'LOADBOOL', loadBool), // R(A) := (bool)B; if (C) pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'LOADNIL ', loadNil), // R(A), R(A+1), ..., R(A+B) := nil
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'GETUPVAL'), // R(A) := UpValue[B]
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.K, OpMode.IABC, 'GETTABUP'), // R(A) := UpValue[B][RK(C)]
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC, 'GETTABLE', getTable), // R(A) := R(B)[RK(C)]
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABUP'), // UpValue[A][RK(B)] := RK(C)
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'SETUPVAL'), // UpValue[B] := R(A)
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABLE', setTable), // R(A)[RK(B)] := RK(C)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'NEWTABLE', newTable), // R(A) := {} (size = B,C)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC, 'SELF    '), // R(A+1) := R(B); R(A) := R(B)[RK(C)]
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'ADD     ', add), // R(A) := RK(B) + RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SUB     ', sub), // R(A) := RK(B) - RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'MUL     ', mul), // R(A) := RK(B) * RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'MOD     ', mod), // R(A) := RK(B) % RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'POW     ', pow), // R(A) := RK(B) ^ RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'DIV     ', div), // R(A) := RK(B) / RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'IDIV    ', idiv), // R(A) := RK(B) // RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BAND    ', band), // R(A) := RK(B) & RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BOR     ', bor), // R(A) := RK(B) | RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BXOR    ', bxor), // R(A) := RK(B) ~ RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SHL     ', shl), // R(A) := RK(B) << RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SHR     ', shr), // R(A) := RK(B) >> RK(C)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'UNM     ', unm), // R(A) := -R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'BNOT    ', bnot), // R(A) := ~R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'NOT     ', not), // R(A) := not R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'LEN     '), // R(A) := length of R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.R, OpMode.IABC, 'CONCAT  '), // R(A) := R(B).. ... ..R(C)
  new OpCodeInfo(0, 0, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'JMP     ', jmp), // pc+=sBx; if (A) close all upvalues >= R(A - 1)
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'EQ      ', eq), // if ((RK(B) == RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LT      ', lt), // if ((RK(B) <  RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LE      ', le), // if ((RK(B) <= RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TEST    ', test), // if not (R(A) <=> C) then pc++
  new OpCodeInfo(1, 1, OpArgMask.R, OpArgMask.U, OpMode.IABC, 'TESTSET ', testSet), // if (R(B) <=> C) then R(A) := R(B) else pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'CALL    '), // R(A), ... ,R(A+C-2) := R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'TAILCALL'), // return R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'RETURN  '), // return R(A), ... ,R(A+B-2)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORLOOP ', forLoop), // R(A)+=R(A+2); if R(A) <?= R(A+1) then { pc+=sBx; R(A+3)=R(A) }
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORPREP ', forPrep), // R(A)-=R(A+2); pc+=sBx
  new OpCodeInfo(0, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TFORCALL'), // R(A+3), ... ,R(A+2+C) := R(A)(R(A+1), R(A+2));
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'TFORLOOP'), // if R(A+1) ~= nil then { R(A)=R(A+1); pc += sBx }
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'SETLIST ', setList), // R(A)[(C-1)*FPF+i] := R(A+i), 1 <= i <= B
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABx, 'CLOSURE '), // R(A) := closure(KPROTO[Bx])
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'VARARG  '), // R(A), R(A+1), ..., R(A+B-2) = vararg
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.U, OpMode.IAx, 'EXTRAARG'), //  extra (larger) argument for previous opcode
];
Object.freeze(opCodeInfos);

export {
  OpMode,
  OpArgMask,
  OpCode,
  OpCodeInfo,
  opCodeInfos,
};
