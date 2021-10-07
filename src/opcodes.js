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
  constructor(testFlag, setAFlag, argBMode, argCMode, opMode, debugName) {
    this.testFlag = testFlag;
    this.setAFlag = setAFlag;
    this.argBMode = argBMode;
    this.argCMode = argCMode;
    this.opMode = opMode;
    this.debugName = debugName;
  }
}

const opCodeInfos = [
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'MOVE'), // R(A) := R(B)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.N, OpMode.IABx, 'LOADK'), // R(A) := Kst(Bx)
  new OpCodeInfo(0, 1, OpArgMask.N, OpArgMask.N, OpMode.IABx, 'LOADKX'), // R(A) := Kst(extra arg)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'LOADBOOL'), // R(A) := (bool)B; if (C) pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'LOADNIL'), // R(A), R(A+1), ..., R(A+B) := nil
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'GETUPVAL'), // R(A) := UpValue[B]
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.K, OpMode.IABC, 'GETTABUP'), // R(A) := UpValue[B][RK(C)]
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC, 'GETTABLE'), // R(A) := R(B)[RK(C)]
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABUP'), // UpValue[A][RK(B)] := RK(C)
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'SETUPVAL'), // UpValue[B] := R(A)
  new OpCodeInfo(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SETTABLE'), // R(A)[RK(B)] := RK(C)
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'NEWTABLE'), // R(A) := {} (size = B,C)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC, 'SELF'), // R(A+1) := R(B); R(A) := R(B)[RK(C)]
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'ADD'), // R(A) := RK(B) + RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SUB'), // R(A) := RK(B) - RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'MUL'), // R(A) := RK(B) * RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'MOD'), // R(A) := RK(B) % RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'POW'), // R(A) := RK(B) ^ RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'DIV'), // R(A) := RK(B) / RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'IDIV'), // R(A) := RK(B) // RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BAND'), // R(A) := RK(B) & RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BOR'), // R(A) := RK(B) | RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'BXOR'), // R(A) := RK(B) ~ RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SHL'), // R(A) := RK(B) << RK(C)
  new OpCodeInfo(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'SHR'), // R(A) := RK(B) >> RK(C)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'UNM'), // R(A) := -R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'BNOT'), // R(A) := ~R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'NOT'), // R(A) := not R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC, 'LEN'), // R(A) := length of R(B)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.R, OpMode.IABC, 'CONCAT'), // R(A) := R(B).. ... ..R(C)
  new OpCodeInfo(0, 0, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'JMP'), // pc+=sBx; if (A) close all upvalues >= R(A - 1)
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'EQ'), // if ((RK(B) == RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LT'), // if ((RK(B) <  RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC, 'LE'), // if ((RK(B) <= RK(C)) ~= A) then pc++
  new OpCodeInfo(1, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TEST'), // if not (R(A) <=> C) then pc++
  new OpCodeInfo(1, 1, OpArgMask.R, OpArgMask.U, OpMode.IABC, 'TESTSET'), // if (R(B) <=> C) then R(A) := R(B) else pc++
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'CALL'), // R(A), ... ,R(A+C-2) := R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'TAILCALL'), // return R(A)(R(A+1), ... ,R(A+B-1))
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'RETURN'), // return R(A), ... ,R(A+B-2)
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORLOOP'), // R(A)+=R(A+2); if R(A) <?= R(A+1) then { pc+=sBx; R(A+3)=R(A) }
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'FORPREP'), // R(A)-=R(A+2); pc+=sBx
  new OpCodeInfo(0, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC, 'TFORCALL'), // R(A+3), ... ,R(A+2+C) := R(A)(R(A+1), R(A+2));
  new OpCodeInfo(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx, 'TFORLOOP'), // if R(A+1) ~= nil then { R(A)=R(A+1); pc += sBx }
  new OpCodeInfo(0, 0, OpArgMask.U, OpArgMask.U, OpMode.IABC, 'SETLIST'), // R(A)[(C-1)*FPF+i] := R(A+i), 1 <= i <= B
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABx, 'CLOSURE'), // R(A) := closure(KPROTO[Bx])
  new OpCodeInfo(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC, 'VARARG'), // R(A), R(A+1), ..., R(A+B-2) = vararg
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
