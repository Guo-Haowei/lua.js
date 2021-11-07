import { TOKEN } from './tokens.js';
import {
  EmptyExpr,
  StringExpr,
  NameExpr,
  FuncCallExpr,
  FuncDefExpr,
} from './node.js';

const BLOCKEND_TOKENS = [
  TOKEN.KW_RETURN,
  TOKEN.EOF,
  TOKEN.KW_END,
  TOKEN.KW_ELSE,
  TOKEN.KW_ELSEIF,
  TOKEN.KW_UNTIL,
];

// epxressions
// expr0 ::= nil | false | true | Numeral | LiteralString |
//           '...' | functiondef | prefixExpr | tableConstructor
const parseExpr0 = (lexer) => {
  const kind = lexer.peekKind();
  switch (kind) {
    case 'STRING':
    {
      const { line, raw } = lexer.next();
      return new StringExpr(line, raw);
    }
    default:
      throw new Error(`TODO: implement ${kind}`);
  }
};

const parseExpr = (lexer) => parseExpr0(lexer);

const parseNameExpr = (lexer) => {
  if (lexer.peekKind() !== ':') {
    return null;
  }

  lexer.next();
  const { line, raw } = lexer.next();
  return new StringExpr(line, raw);
};

const parseArgs = (lexer) => {
  let args = [];
  switch (lexer.peekKind()) {
    case '(':
      lexer.next();
      if (lexer.peekKind() !== ')') {
        // eslint-disable-next-line no-use-before-define
        args = parseExprList(lexer);
      }
      lexer.expect(')');
      break;
    default:
      throw new Error('TODO: implement');
  }
  return args;
};

const finishFuncCallExpr = (lexer, prefixExpr) => {
  const nameExpr = parseNameExpr(lexer);
  const line = lexer.currentLine();
  const args = parseArgs(lexer);
  const lastLine = lexer.currentLine();
  return new FuncCallExpr(line, lastLine, prefixExpr, nameExpr, args);
};

const finishPrefixExpr = (lexer, expr) => {
  let ret = expr;
  for (;;) {
    switch (lexer.peekKind()) {
      case '[':
      case '.':
        throw new Error('TODO: table access expr');
      case ':':
      case '(':
      case '{':
      case 'STRING':
        ret = finishFuncCallExpr(lexer, ret);
        break;
      default:
        return ret;
    }
  }
};

const parsePrefixExp = (lexer) => {
  let expr = null;
  if (lexer.peekKind(TOKEN.IDENTIFIER)) {
    const { line, raw } = lexer.next();
    expr = new NameExpr(line, raw);
  } else {
    throw new Error('TODO: parseParensExpr()');
  }

  return finishPrefixExpr(lexer, expr);
};

const parseExprList = (lexer) => {
  const exprs = [];
  exprs.push(parseExpr(lexer));
  while (lexer.peekKind() === ',') {
    lexer.next();
    exprs.push(parseExpr(lexer));
  }

  return exprs;
};

const parseRetExps = (lexer) => {
  if (lexer.peekKind() !== 'return') {
    throw new Error('expect keyword "return"');
  }

  lexer.next();
  const kind = lexer.peekKind();

  if (BLOCKEND_TOKENS.indexOf(kind) !== -1) {
    return [];
  }

  if (kind === ';') {
    lexer.next();
    return [];
  }

  const exprs = parseExprList(lexer);
  if (lexer.peekKind() === ';') {
    lexer.next();
  }

  return exprs;
};

const parseParamList = (lexer) => {
  switch (lexer.peekKind()) {
    case ')': return [[], false];
    case '...': lexer.next(); return [[], true];
    default: break;
  }

  const names = [];
  let isVararg = false;

  let { raw } = lexer.expect(TOKEN.IDENTIFIER);
  names.push(raw);
  while (lexer.peekKind() === ',') {
    lexer.next();
    if (lexer.peekKind() === TOKEN.IDENTIFIER) {
      raw = lexer.next().raw;
      names.push(raw);
    } else {
      lexer.expect('...');
      isVararg = true;
      break;
    }
  }

  return [names, isVararg];
};

// eslint-disable-next-line no-unused-vars
const parseBlock = (lexer) => undefined;

const parseFuncDefExpr = (lexer) => {
  const line = lexer.currentLine();
  lexer.expect('(');
  const [paramList, isVararg] = parseParamList(lexer);
  lexer.expect(')');
  const block = parseBlock(lexer);
  const next = lexer.expect('end');
  const lastLine = next.line;
  return new FuncDefExpr(line, lastLine, paramList, isVararg, block);
};

// TODO: add statements

// statements
const parseEmptyStat = (lexer) => {
  lexer.expect(';');
  return new EmptyExpr();
};

const finishVarList = (lexer, var0) => {
  // TODO: assert var0
  const vars = [var0];
  while (lexer.peekKind() === ',') {
    lexer.next();
    const expr = parsePrefixExp(lexer);
    vars.push(expr);
  }

  return vars;
};

const parseAssignStat = (lexer, var0) => {
  const varList = finishVarList(lexer, var0);
  lexer.expect('=');
  const exprList = parseExprList(lexer);
  const lastLine = lexer.currentLine();
  return { varList, exprList, lastLine };
};

const parseAssignOrFuncCallStat = (lexer) => {
  const prefixExpr = parsePrefixExp(lexer);

  if (prefixExpr instanceof FuncCallExpr) {
    return prefixExpr;
  }

  return parseAssignStat(lexer, prefixExpr);
};

const parseStat = (lexer) => {
  const kind = lexer.peekKind();
  switch (kind) {
    case ';': return parseEmptyStat(lexer);
    default: return parseAssignOrFuncCallStat(lexer);
  }
};

const isReturnOrBlockEnd = (kind) => BLOCKEND_TOKENS.indexOf(kind) !== -1;

const parseStats = (lexer) => {
  const stats = [];
  while (!isReturnOrBlockEnd(lexer.peekKind())) {
    const stat = parseStat(lexer);
    stats.push(stat);
  }
  return stats;
};

const parse = (lexer) => parseStat(lexer);

export {
  parseRetExps,
  parseFuncDefExpr,
  parseEmptyStat,
  parseStat,
  parseStats,
  parseAssignOrFuncCallStat,
  parse,
};
