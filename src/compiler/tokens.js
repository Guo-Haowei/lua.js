/* eslint-disable no-plusplus */
let counter = 0;

const TOKEN = {
  EOF: counter++,
  VARARG: counter++,
  SEP_SEMI: counter++,
  SEP_COMMA: counter++,
  SEP_DOT: counter++,
  SEP_COLON: counter++,
  SEP_LABEL: counter++,
  SEP_LPAREN: counter++,
  SEP_RPAREN: counter++,
  SEP_LBRACK: counter++,
  SEP_RBRACK: counter++,
  SEP_LCURLY: counter++,
  SEP_RCURLY: counter++,
  OP_ASSIGN: counter++,
  OP_MINUS: counter++,
  OP_WAVE: counter++,
  OP_ADD: counter++,
  OP_MUL: counter++,
  OP_DIV: counter++,
  OP_IDIV: counter++,
  OP_POW: counter++,
  OP_MOD: counter++,
  OP_BAND: counter++,
  OP_BOR: counter++,
  OP_SHR: counter++,
  OP_SHL: counter++,
  OP_CONCAT: counter++,
  OP_LT: counter++,
  OP_LE: counter++,
  OP_GT: counter++,
  OP_GE: counter++,
  OP_EQ: counter++,
  OP_NE: counter++,
  OP_LEN: counter++,
  OP_AND: counter++,
  OP_OR: counter++,
  OP_NOT: counter++,
  KW_BREAK: counter++,
  KW_DO: counter++,
  KW_ELSE: counter++,
  KW_ELSEIF: counter++,
  KW_END: counter++,
  KW_FALSE: counter++,
  KW_FOR: counter++,
  KW_FUNCTION: counter++,
  KW_GOTO: counter++,
  KW_IF: counter++,
  KW_IN: counter++,
  KW_LOCAL: counter++,
  KW_NIL: counter++,
  KW_REPEAT: counter++,
  KW_RETURN: counter++,
  KW_THEN: counter++,
  KW_TRUE: counter++,
  KW_UNTIL: counter++,
  KW_WHILE: counter++,
  IDENTIFIER: counter++,
  NUMBER: counter++,
  STRING: counter++,
};

TOKEN.OP_UNM = TOKEN.OP_MINUS;
TOKEN.OP_SUB = TOKEN.OP_MINUS;
TOKEN.OP_BNOT = TOKEN.OP_WAVE;
TOKEN.OP_BXOR = TOKEN.OP_WAVE;
Object.freeze(TOKEN);

const KEYWORDS = {
  and: TOKEN.OP_AND,
  break: TOKEN.KW_BREAK,
  do: TOKEN.KW_DO,
  else: TOKEN.KW_ELSE,
  elseif: TOKEN.KW_ELSEIF,
  end: TOKEN.KW_END,
  false: TOKEN.KW_FALSE,
  for: TOKEN.KW_FOR,
  function: TOKEN.KW_FUNCTION,
  goto: TOKEN.KW_GOTO,
  if: TOKEN.KW_IF,
  in: TOKEN.KW_IN,
  local: TOKEN.KW_LOCAL,
  nil: TOKEN.KW_NIL,
  not: TOKEN.OP_NOT,
  or: TOKEN.OP_OR,
  repeat: TOKEN.KW_REPEAT,
  return: TOKEN.KW_RETURN,
  then: TOKEN.KW_THEN,
  true: TOKEN.KW_TRUE,
  until: TOKEN.KW_UNTIL,
  while: TOKEN.KW_WHILE,
};
Object.freeze(KEYWORDS);

const tokenTypeMap = {
  ';': TOKEN.SEP_SEMI,
  ',': TOKEN.SEP_COMMA,
  '(': TOKEN.SEP_LPAREN,
  ')': TOKEN.SEP_RPAREN,
  '[': TOKEN.SEP_LBRACK,
  ']': TOKEN.SEP_RBRACK,
  '{': TOKEN.SEP_LCURLY,
  '}': TOKEN.SEP_RCURLY,
  '+': TOKEN.OP_ADD,
  '-': TOKEN.OP_MINUS,
  '*': TOKEN.OP_MUL,
  '^': TOKEN.OP_POW,
  '%': TOKEN.OP_MOD,
  '&': TOKEN.OP_BAND,
  '|': TOKEN.OP_BOR,
  '#': TOKEN.OP_LEN,
  '::': TOKEN.SEP_LABEL,
  ':': TOKEN.SEP_COLON,
  '//': TOKEN.OP_IDIV,
  '/': TOKEN.OP_DIV,
  '~=': TOKEN.OP_NE,
  '~': TOKEN.OP_WAVE,
  '==': TOKEN.OP_EQ,
  '=': TOKEN.OP_ASSIGN,
  '<<': TOKEN.OP_SHL,
  '<=': TOKEN.OP_LE,
  '<': TOKEN.OP_LT,
  '>>': TOKEN.OP_SHR,
  '>=': TOKEN.OP_GE,
  '>': TOKEN.OP_GT,
  '...': TOKEN.VARARG,
  '..': TOKEN.OP_CONCAT,
  '.': TOKEN.SEP_DOT,
};
Object.freeze(KEYWORDS);

const strToToken = (str) => {
  const token = tokenTypeMap[str];
  if (!token) {
    throw new Error(`Token '${str}' not found`);
  }

  return token;
};

export { TOKEN, KEYWORDS, strToToken };
