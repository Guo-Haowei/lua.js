/* eslint-disable prefer-const */
import * as lua from './constants.js';
import { iAxImpl } from './misc.js';

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

const luamove = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;
  vm.copy(b, a);
};

const luajmp = (ins, vm) => {
  const { a, sbx } = ins.iAsBx();
  vm.addPC(sbx);
  if (a !== 0) {
    throw new Error('TODO!');
  }
};

const lualoadNil = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  vm.pushNil();
  for (let i = a; i <= a + b; i += 1) {
    vm.copy(-1, i);
  }
  vm.pop(1);
};

const lualoadBool = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  vm.pushBoolean(b !== 0);
  vm.replace(a);
  if (c !== 0) {
    vm.addPC(1);
  }
};

const lualoadK = (ins, vm) => {
  let { a, bx } = ins.iABx();
  a += 1;

  vm.getConst(bx);
  vm.replace(a);
};

const lualoadKx = (ins, vm) => {
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

const luaadd = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPADD); };
const luasub = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPSUB); };
const luamul = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPMUL); };
const luamod = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPMOD); };
const luapow = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPPOW); };
const luadiv = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPDIV); };
const luaidiv = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPIDIV); };
const luaband = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPBAND); };
const luabor = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPBOR); };
const luabxor = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPBXOR); };
const luashl = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPSHL); };
const luashr = (ins, vm) => { binaryArith(ins, vm, lua.LUA_OPSHR); };
const luaunm = (ins, vm) => { unaryArith(ins, vm, lua.LUA_OPUNM); };
const luabnot = (ins, vm) => { unaryArith(ins, vm, lua.LUA_OPBNOT); };

const compare = (ins, vm, op) => {
  const { a, b, c } = ins.iABC();
  vm.getRK(b);
  vm.getRK(c);
  if (vm.compare(-2, -1, op) !== (a !== 0)) {
    vm.addPC(1);
  }
  vm.pop(2);
};

const luaeq = (ins, vm) => { compare(ins, vm, lua.LUA_OPEQ); };
const lualt = (ins, vm) => { compare(ins, vm, lua.LUA_OPLT); };
const luale = (ins, vm) => { compare(ins, vm, lua.LUA_OPLE); };

const luanot = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;
  vm.pushBoolean(!vm.toBoolean(b));
  vm.replace(a);
};

const lualen = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  b += 1;

  vm.len(b);
  vm.replace(a);
};

const luaconcat = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;
  b += 1;
  c += 1;

  const n = c - b + 1;
  vm.checkStack(n);
  for (let i = b; i <= c; i += 1) {
    vm.pushValue(i);
  }
  vm.concat(n);
  vm.replace(a);
};

const luatestSet = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;
  b += 1;

  if (vm.toBoolean(b) === (c !== 0)) {
    vm.copy(b, a);
  } else {
    vm.addPC(1);
  }
};

const luatest = (ins, vm) => {
  let { a, c } = ins.iABC();
  a += 1;

  if (vm.toBoolean(a) !== (c !== 0)) {
    vm.addPC(1);
  }
};

const luaforPrep = (ins, vm) => {
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

const luaforLoop = (ins, vm) => {
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

const luanewtable = (ins, vm) => {
  let { a } = ins.iABC(); // we don't pass initial size to construct table
  a += 1;

  vm.newTable();
  vm.replace(a);
};

const luagettable = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;
  b += 1;

  vm.getRK(c);
  vm.getTable(b);
  vm.replace(a);
};

const luasettable = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  vm.getRK(b);
  vm.getRK(c);
  vm.setTable(a);
};

const luasetList = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  if (c > 0) {
    c -= 1;
  } else {
    c = iAxImpl(vm.fetch).ax;
  }

  const bIsZero = b === 0;
  if (bIsZero) {
    b = vm.toNumber(-1) - a - 1;
    vm.pop(1);
  }

  vm.checkStack(1);
  const LFIELDS_PER_FLUSH = 50;
  let idx = c * LFIELDS_PER_FLUSH;
  for (let i = 1; i <= b; i += 1) {
    idx += 1;
    vm.pushValue(a + i);
    vm.setI(a, idx);
  }

  if (bIsZero) {
    for (let i = vm.registerCount() + 1; i <= vm.getTop(); i += 1) {
      idx += 1;
      vm.pushValue(i);
      vm.setI(a, idx);
    }

    // clear stack
    vm.setTop(vm.registerCount());
  }
};

const luaclosure = (ins, vm) => {
  let { a, bx } = ins.iABx();
  a += 1;

  vm.loadProto(bx);
  vm.replace(a);
};

// function call helpers
const fixStack = (a, vm) => {
  const x = vm.toNumber(-1);
  vm.pop(1);

  vm.checkStack(x - a);
  for (let i = a; i < x; i += 1) {
    vm.pushValue(i);
  }
  vm.rotate(vm.registerCount() + 1, x - a);
};

const pushFuncAndArgs = (a, b, vm) => {
  if (b >= 1) { // b - 1 args
    vm.checkStack(b);
    for (let i = a; i < a + b; i += 1) {
      vm.pushValue(i);
    }
    return b - 1;
  }

  fixStack(a, vm);
  return vm.getTop() - vm.registerCount() - 1;
};

const popResults = (a, c, vm) => {
  if (c === 1) {
    return;
  }

  if (c > 1) {
    for (let i = a + c - 2; i >= a; i -= 1) {
      vm.replace(i);
    }
    return;
  }

  vm.checkStack(1);
  vm.pushNumber(a);
};

const luacall = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;

  const nArgs = pushFuncAndArgs(a, b, vm);
  vm.call(nArgs, c - 1);

  popResults(a, c, vm);
};

const luareturn = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;

  if (b === 1) {
    return;
  }

  if (b > 1) {
    vm.checkStack(b - 1);
    for (let i = a; i <= a + b - 2; i += 1) {
      vm.pushValue(i);
    }

    return;
  }

  fixStack(a, vm);
};

const luavararg = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;

  if (b !== 1) {
    vm.loadVararg(b - 1);
    popResults(a, b, vm);
  }
};

const luagettabup = (ins, vm) => {
  let { a, c } = ins.iABC();
  a += 1;

  vm.pushGlobalTable();
  vm.getRK(c);
  vm.getTable(-2);
  vm.replace(a);
  vm.pop();
};

// HACK: temp
const luatailcall = (ins, vm) => {
  let { a, b } = ins.iABC();
  a += 1;
  const c = 0;

  const nArgs = pushFuncAndArgs(a, b, vm);
  vm.call(nArgs, c - 1);
  popResults(a, c, vm);
};

const luaself = (ins, vm) => {
  let { a, b, c } = ins.iABC();
  a += 1;
  b += 1;

  vm.copy(b, a + 1);
  vm.getRK(c);
  vm.getTable(b);
  vm.replace(a);
};

const opCodeInfos = [
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'MOVE    ', luamove), // R(A) := R(B)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.N, OpMode.IABx, 'LOADK   ', lualoadK), // R(A) := Kst(Bx)
  new OpCodeInfo(0, 1, OpArgMask.N, OpArgMask.N, OpMode.IABx, 'LOADKX  ', lualoadKx), // R(A) := Kst(extra arg)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'LOADBOOL', lualoadBool), // R(A) := (bool)B; if (C) pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'LOADNIL ', lualoadNil), // R(A), R(A+1), ..., R(A+B) := nil
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'GETUPVAL'), // R(A) := UpValue[B]
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.K, OpMode.IABC, 'GETTABUP', luagettabup), // R(A) := UpValue[B][RK(C)]
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC, 'GETTABLE', luagettable), // R(A) := R(B)[RK(C)]
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABUP'), // UpValue[A][RK(B)] := RK(C)
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'SETUPVAL'), // UpValue[B] := R(A)
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABLE', luasettable), // R(A)[RK(B)] := RK(C)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'NEWTABLE', luanewtable), // R(A) := {} (size = B,C)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC, 'SELF    ', luaself), // R(A+1) := R(B); R(A) := R(B)[RK(C)]
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'ADD     ', luaadd), // R(A) := RK(B) + RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SUB     ', luasub), // R(A) := RK(B) - RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'MUL     ', luamul), // R(A) := RK(B) * RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'MOD     ', luamod), // R(A) := RK(B) % RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'POW     ', luapow), // R(A) := RK(B) ^ RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'DIV     ', luadiv), // R(A) := RK(B) / RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'IDIV    ', luaidiv), // R(A) := RK(B) // RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BAND    ', luaband), // R(A) := RK(B) & RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BOR     ', luabor), // R(A) := RK(B) | RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BXOR    ', luabxor), // R(A) := RK(B) ~ RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SHL     ', luashl), // R(A) := RK(B) << RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SHR     ', luashr), // R(A) := RK(B) >> RK(C)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'UNM     ', luaunm), // R(A) := -R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'BNOT    ', luabnot), // R(A) := ~R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'NOT     ', luanot), // R(A) := not R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'LEN     ', lualen), // R(A) := length of R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.R, OpMode.IABC, 'CONCAT  ', luaconcat), // R(A) := R(B).. ... ..R(C)
  new OpCodeInfo(0, 0, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'JMP     ', luajmp), // pc+=sBx; if (A) close all upvalues >= R(A - 1)
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'EQ      ', luaeq), // if ((RK(B) == RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LT      ', lualt), // if ((RK(B) <  RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LE      ', luale), // if ((RK(B) <= RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TEST    ', luatest), // if not (R(A) <=> C) then pc++
  new OpCodeInfo(1, 1, OpArgMask.R, OpArgMask.U, OpMode.IABC, 'TESTSET ', luatestSet), // if (R(B) <=> C) then R(A) := R(B) else pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'CALL    ', luacall), // R(A), ... ,R(A+C-2) := R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'TAILCALL', luatailcall), // return R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'RETURN  ', luareturn), // return R(A), ... ,R(A+B-2)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORLOOP ', luaforLoop), // R(A)+=R(A+2); if R(A) <?= R(A+1) then { pc+=sBx; R(A+3)=R(A) }
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORPREP ', luaforPrep), // R(A)-=R(A+2); pc+=sBx
  new OpCodeInfo(0, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TFORCALL'), // R(A+3), ... ,R(A+2+C) := R(A)(R(A+1), R(A+2));
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'TFORLOOP'), // if R(A+1) ~= nil then { R(A)=R(A+1); pc += sBx }
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'SETLIST ', luasetList), // R(A)[(C-1)*FPF+i] := R(A+i), 1 <= i <= B
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABx, 'CLOSURE ', luaclosure), // R(A) := closure(KPROTO[Bx])
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'VARARG  ', luavararg), // R(A), R(A+1), ..., R(A+B-2) = vararg
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
