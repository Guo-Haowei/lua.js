import { Instruction } from './instruction.js';

class LuaVM {
  constructor() {
    this.vm = null;
  }

  move(ins) {
    let { a, b } = ins.iABC();
    a += 1;
    b += 1;
    this.vm.copy(b, a);
  }

  jmp(ins) {
    const { a, sbx } = ins.iAsBx();
    this.vm.addPC(sbx);
    if (a !== 0) {
      throw new Error('TODO!');
    }
  }

  loadNil(ins) {
    const { a, b } = ins.iABC();
    this.vm.pushNil();
    for (let i = a + 1; i <= a + 1 + b; i += 1) {
      this.vm.copy(-1, i);
    }
    this.vm.pop(1);
  }

  loadBool(ins) {
    const { a, b, c } = ins.iABC();
    this.vm.pushBoolean(b !== 0);
    this.vm.replace(a + 1);
    if (c !== 0) {
      this.vm.addPC(1);
    }
  }

  loadK(ins) {
    const { a, bx } = ins.iABx();
    this.vm.getConst(bx);
    this.vm.replace(a + 1);
  }

  loadKx(ins) {
    let { a } = ins.iABx();
    a += 1;
    const ax = new Instruction(this.vm.Fetch()).iAx();
    this.vm.getConst(ax);
    this.vm.replace(a);
  }
}

export default LuaVM;
