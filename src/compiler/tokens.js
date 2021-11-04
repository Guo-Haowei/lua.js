const TOKEN = {
  EOF: 'EOF',
  VARARG: '...',
  SEP_SEMI: ';',
  SEP_COMMA: ',',
  SEP_DOT: '.',
  SEP_COLON: ':',
  SEP_LABEL: '::',
  SEP_LPAREN: '(',
  SEP_RPAREN: ')',
  SEP_LBRACK: '[',
  SEP_RBRACK: ']',
  SEP_LCURLY: '{',
  SEP_RCURLY: '}',
  OP_ASSIGN: '=',
  OP_MINUS: '-',
  OP_WAVE: '~',
  OP_ADD: '+',
  OP_MUL: '*',
  OP_DIV: '/',
  OP_IDIV: '//',
  OP_POW: '^',
  OP_MOD: '%',
  OP_BAND: '&',
  OP_BOR: '|',
  OP_SHR: '>>',
  OP_SHL: '<<',
  OP_CONCAT: '..',
  OP_LT: '<',
  OP_LE: '<=',
  OP_GT: '>',
  OP_GE: '>=',
  OP_EQ: '==',
  OP_NE: '~=',
  OP_LEN: '#',
  OP_AND: 'and',
  OP_OR: 'or',
  OP_NOT: 'not',
  KW_BREAK: 'break',
  KW_DO: 'do',
  KW_ELSE: 'else',
  KW_ELSEIF: 'elseif',
  KW_END: 'end',
  KW_FALSE: 'false',
  KW_FOR: 'for',
  KW_FUNCTION: 'function',
  KW_GOTO: 'goto',
  KW_IF: 'if',
  KW_IN: 'in',
  KW_LOCAL: 'local',
  KW_NIL: 'nil',
  KW_REPEAT: 'repeat',
  KW_RETURN: 'return',
  KW_THEN: 'then',
  KW_TRUE: 'true',
  KW_UNTIL: 'until',
  KW_WHILE: 'while',
  IDENTIFIER: 'IDENT',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
};

TOKEN.OP_UNM = TOKEN.OP_MINUS;
TOKEN.OP_SUB = TOKEN.OP_MINUS;
TOKEN.OP_BNOT = TOKEN.OP_WAVE;
TOKEN.OP_BXOR = TOKEN.OP_WAVE;
Object.freeze(TOKEN);

const KEYWORDS = [
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'goto', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while',
];

const isKeyword = (raw) => KEYWORDS.includes(raw);

export {
  TOKEN,
  isKeyword,
};
