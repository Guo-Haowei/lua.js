import * as lua from './constants.js';

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

const binaryArith = (ins, vm, op) => {
  const { a, b, c } = ins.iABC();
  vm.getRK(b);
  vm.getRK(c);
  vm.arith(op);
  vm.replace(a + 1);
};

const unaryArith = (ins, vm, op) => {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;

  vm.pushValue(b);
  vm.arith(op);
  vm.replace(a);
};

function move(ins, vm) {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;
  vm.copy(b, a);
}

function jmp(ins, vm) {
  const { a, sbx } = ins.iAsBx();
  vm.addPC(sbx);
  if (a !== 0) {
    throw new Error('TODO!');
  }
}

function loadNil(ins, vm) {
  const { a, b } = ins.iABC();
  vm.pushNil();
  for (let i = a + 1; i <= a + 1 + b; i += 1) {
    vm.copy(-1, i);
  }
  vm.pop(1);
}

function loadBool(ins, vm) {
  const { a, b, c } = ins.iABC();
  vm.pushBoolean(b !== 0);
  vm.replace(a + 1);
  if (c !== 0) {
    vm.addPC(1);
  }
}

function loadK(ins, vm) {
  const { a, bx } = ins.iABx();
  vm.getConst(bx);
  vm.replace(a + 1);
}

function loadKx(ins, vm) {
  let { a } = ins.iABx();
  a += 1;
  // eslint-disable-next-line no-bitwise
  const ax = vm.fetch() >>> 6;
  vm.getConst(ax);
  vm.replace(a);
}

function add(ins, vm) { binaryArith(ins, vm, lua.LUA_OPADD); }

function sub(ins, vm) { binaryArith(ins, vm, lua.LUA_OPSUB); }

function mul(ins, vm) { binaryArith(ins, vm, lua.LUA_OPMUL); }

function mod(ins, vm) { binaryArith(ins, vm, lua.LUA_OPMOD); }

function pow(ins, vm) { binaryArith(ins, vm, lua.LUA_OPPOW); }

function div(ins, vm) { binaryArith(ins, vm, lua.LUA_OPDIV); }

function idiv(ins, vm) { binaryArith(ins, vm, lua.LUA_OPIDIV); }

function band(ins, vm) { binaryArith(ins, vm, lua.LUA_OPBAND); }

function bor(ins, vm) { binaryArith(ins, vm, lua.LUA_OPBOR); }

function bxor(ins, vm) { binaryArith(ins, vm, lua.LUA_OPBXOR); }

function shl(ins, vm) { binaryArith(ins, vm, lua.LUA_OPSHL); }

function shr(ins, vm) { binaryArith(ins, vm, lua.LUA_OPSHR); }

function unm(ins, vm) { unaryArith(ins, vm, lua.LUA_OPUNM); }

function bnot(ins, vm) { unaryArith(ins, vm, lua.LUA_OPBNOT); }

function len(ins, vm) {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;
  vm.len(b);
  vm.replace(a);
}

function concat(ins, vm) {
  let { a, b, c } = ins.iABC();
  a += 1;
  b += 1;
  c += 1;

  const n = c - b + 1;
  vm.checkState(n);
  for (let i = b; i <= c; i += 1) {
    vm.pushValue(i);
  }
  vm.concat(n);
  vm.replace(a);
}

const opCodeInfos = [
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'MOVE    ', move), // R(A) := R(B)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.N, OpMode.IABx, 'LOADK   ', loadK), // R(A) := Kst(Bx)
  new OpCodeInfo(0, 1, OpArgMask.N, OpArgMask.N, OpMode.IABx, 'LOADKX  ', loadKx), // R(A) := Kst(extra arg)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'LOADBOOL', loadBool), // R(A) := (bool)B; if (C) pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'LOADNIL ', loadNil), // R(A), R(A+1), ..., R(A+B) := nil
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'GETUPVAL'), // R(A) := UpValue[B]
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.K, OpMode.IABC, 'GETTABUP'), // R(A) := UpValue[B][RK(C)]
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC, 'GETTABLE'), // R(A) := R(B)[RK(C)]
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABUP'), // UpValue[A][RK(B)] := RK(C)
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'SETUPVAL'), // UpValue[B] := R(A)
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABLE'), // R(A)[RK(B)] := RK(C)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'NEWTABLE'), // R(A) := {} (size = B,C)
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
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'NOT     '), // R(A) := not R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'LEN     ', len), // R(A) := length of R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.R, OpMode.IABC, 'CONCAT  ', concat), // R(A) := R(B).. ... ..R(C)
  new OpCodeInfo(0, 0, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'JMP     ', jmp), // pc+=sBx; if (A) close all upvalues >= R(A - 1)
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'EQ      '), // if ((RK(B) == RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LT      '), // if ((RK(B) <  RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LE      '), // if ((RK(B) <= RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TEST    '), // if not (R(A) <=> C) then pc++
  new OpCodeInfo(1, 1, OpArgMask.R, OpArgMask.U, OpMode.IABC, 'TESTSET '), // if (R(B) <=> C) then R(A) := R(B) else pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'CALL    '), // R(A), ... ,R(A+C-2) := R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'TAILCALL'), // return R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'RETURN  '), // return R(A), ... ,R(A+B-2)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORLOOP '), // R(A)+=R(A+2); if R(A) <?= R(A+1) then { pc+=sBx; R(A+3)=R(A) }
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORPREP '), // R(A)-=R(A+2); pc+=sBx
  new OpCodeInfo(0, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TFORCALL'), // R(A+3), ... ,R(A+2+C) := R(A)(R(A+1), R(A+2));
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'TFORLOOP'), // if R(A+1) ~= nil then { R(A)=R(A+1); pc += sBx }
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'SETLIST '), // R(A)[(C-1)*FPF+i] := R(A+i), 1 <= i <= B
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
