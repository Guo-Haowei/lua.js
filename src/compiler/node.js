/* eslint-disable max-classes-per-file */
export class EmptyExpr {
}

export class StringExpr {
  constructor(line, raw) {
    this.line = line;
    // TODO: remove quotes
    this.raw = raw;
  }
}

export class NameExpr {
  constructor(line, raw) {
    this.line = line;
    this.raw = raw;
  }
}

export class FuncCallExpr {
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
