/* eslint-disable max-classes-per-file */
class EmptyExpr {
}

class NilExpr {
}

class StringExpr {
  constructor(line, raw) {
    this.line = line;
    // TODO: remove quotes
    this.string = raw;
  }
}

class NameExpr {
  constructor(line, raw) {
    this.line = line;
    this.raw = raw;
  }
}

class FuncCallExpr {
  constructor(line, lastLine, prefixExpr, nameExpr, args) {
    this.line = line;
    this.lastLine = lastLine;
    this.prefixExpr = prefixExpr;
    this.args = args;
    if (nameExpr) {
      this.nameExpr = nameExpr;
    }
  }
}

class FuncDefExpr {
  constructor(line, lastLine, paramList, isVararg, block) {
    this.line = line;
    this.lastLine = lastLine;
    this.paramList = paramList;
    this.isVararg = isVararg;
    this.block = block;
  }
}

export {
  EmptyExpr,
  NilExpr,
  StringExpr,
  NameExpr,
  FuncCallExpr,
  FuncDefExpr,
};
