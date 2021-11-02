import { TOKEN, strToToken, KEYWORDS } from './tokens.js';

const TODO = () => {
  throw new Error('TODO');
};

const BLOCKEND_TOKENS = [
  TOKEN.KW_RETURN,
  TOKEN.EOF,
  TOKEN.KW_END,
  TOKEN.KW_ELSE,
  TOKEN.KW_ELSEIF,
  TOKEN.KW_UNTIL,
];

// epxressions
const parsePrefixExp = (lexer) => {
  TODO();
};

const parseExpr = (lexer) => {
  TODO();
};

const parseExprList = (lexer) => {
  const exprs = [];
  exprs.push(parseExpr(lexer));
  while (lexer.peekKind() !== TOKEN.SEP_COMMA) {
    lexer.next();
    exprs.push(parseExpr(lexer));
  }

  return exprs;
};

const parseRetExps = (lexer) => {
  if (lexer.peekKind() !== TOKEN.KW_RETURN) {
    throw new Error('expect keyword "return"');
  }

  lexer.next();
  const kind = lexer.peekKind();

  if (BLOCKEND_TOKENS.indexOf(kind) !== -1) {
    return [];
  }

  if (kind === TOKEN.SEP_SEMI) {
    lexer.next();
    return [];
  }

  const exprs = parseExprList(lexer);
  if (lexer.peekKind() === TOKEN.SEP_SEMI) {
    lexer.next();
  }

  return exprs;
};

// TODO: add statements

// statements
const parseEmptyStat = (lexer) => {
  lexer.expect(TOKEN.SEP_SEMI);
  return {};
};

const finishVarList = (lexer, var0) => {
  // TODO: assert var0
  const vars = [var0];
  while (lexer.peekKind() === TOKEN.SEP_COMMA) {
    lexer.next();
    const expr = parsePrefixExp(lexer);
    vars.push(expr);
  }

  return vars;
};

const parseAssignStat = (lexer, var0) => {
  const varList = finishVarList(lexer, var0);
  lexer.expect(TOKEN.OP_ASSIGN);
  const exprList = parseExprList(lexer);
  const lastLine = lexer.currentLine();
  return { varList, exprList, lastLine };
};

const parseAssignOrFuncCallStat = (lexer) => {
  // TODO
  const prefixExpr = parsePrefixExp(lexer);
  if (prefixExpr) {
    return prefixExpr;
  }

  return parseAssignStat(lexer, prefixExpr);
};

const parseStat = (lexer) => {
  const kind = lexer.peekKind();
  switch (kind) {
    case TOKEN.SEP_SEMI: return parseEmptyStat(lexer);
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
  parseEmptyStat,
  parseStat,
  parseStats,
  parse,
};
