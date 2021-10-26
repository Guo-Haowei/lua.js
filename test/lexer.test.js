import { assert } from 'chai';
import { describe, it } from 'mocha';
import { readFileSync } from 'fs';
import { TOKEN } from '../src/compiler/tokens.js';
import Lexer from '../src/compiler/lexer.js';

describe('lexer.js', () => {
  describe('Parsing chunk', () => {
    const chunk = ' 0xF2A3,1234 +- ///\r\n  ;\tabcde"fghij"-- abcdefg \n\r;';
    const lexer = new Lexer(chunk);
    [
      { line: 1, token: TOKEN.NUMBER, raw: '0xF2A3' },
      { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
      { line: 1, token: TOKEN.NUMBER, raw: '1234' },
      { line: 1, token: TOKEN.OP_ADD, raw: '+' },
      { line: 1, token: TOKEN.OP_MINUS, raw: '-' },
      { line: 1, token: TOKEN.OP_IDIV, raw: '//' },
      { line: 1, token: TOKEN.OP_DIV, raw: '/' },
      { line: 2, token: TOKEN.SEP_SEMI, raw: ';' },
      { line: 2, token: TOKEN.IDENTIFIER, raw: 'abcde' },
      { line: 2, token: TOKEN.STRING, raw: '"fghij"' },
      { line: 3, token: TOKEN.SEP_SEMI, raw: ';' },
      { line: 3, token: TOKEN.EOF, raw: 'EOF' },
    ].forEach((expect) => {
      const [line, token, raw] = lexer.nextToken();
      it(`should parse token {${raw}}(type:${token}) ${expect.token} on line ${expect.line}`, () => {
        assert.equal(line, expect.line);
        assert.equal(token, expect.token);
        assert.equal(raw, expect.raw);
      });
    });
  });

  describe('Parsing files', () => {
    [
      {
        name: 'hello',
        tokens: [
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'print' },
          { line: 1, token: TOKEN.SEP_LPAREN, raw: '(' },
          { line: 1, token: TOKEN.STRING, raw: '"Hello, World!"' },
          { line: 1, token: TOKEN.SEP_RPAREN, raw: ')' },
        ],
      },
      {
        name: 'sum',
        tokens: [
          // local sum = 0
          { line: 1, token: TOKEN.KW_LOCAL, raw: 'local' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'sum' },
          { line: 1, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 1, token: TOKEN.NUMBER, raw: '0' },
          // for i = 1, 100 do
          { line: 2, token: TOKEN.KW_FOR, raw: 'for' },
          { line: 2, token: TOKEN.IDENTIFIER, raw: 'i' },
          { line: 2, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 2, token: TOKEN.NUMBER, raw: '1' },
          { line: 2, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 2, token: TOKEN.NUMBER, raw: '100' },
          { line: 2, token: TOKEN.KW_DO, raw: 'do' },
        ],
      },
      {
        name: 'arith',
        tokens: [
          // local a, b, c, d, e, f, g, h, i, j, k, l, m, n, o
          { line: 1, token: TOKEN.KW_LOCAL, raw: 'local' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'a' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'b' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'c' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'd' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'e' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'f' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'g' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'h' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'i' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'j' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'k' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'l' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'm' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'n' },
          { line: 1, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 1, token: TOKEN.IDENTIFIER, raw: 'o' },
          // local tmp1, tmp2
          { line: 2, token: TOKEN.KW_LOCAL, raw: 'local' },
          { line: 2, token: TOKEN.IDENTIFIER, raw: 'tmp1' },
          { line: 2, token: TOKEN.SEP_COMMA, raw: ',' },
          { line: 2, token: TOKEN.IDENTIFIER, raw: 'tmp2' },
          // a = 4
          { line: 3, token: TOKEN.IDENTIFIER, raw: 'a' },
          { line: 3, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 3, token: TOKEN.NUMBER, raw: '4' },
          // b = 5
          { line: 4, token: TOKEN.IDENTIFIER, raw: 'b' },
          { line: 4, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 4, token: TOKEN.NUMBER, raw: '5' },
          // c = a + b
          { line: 5, token: TOKEN.IDENTIFIER, raw: 'c' },
          { line: 5, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 5, token: TOKEN.IDENTIFIER, raw: 'a' },
          { line: 5, token: TOKEN.OP_ADD, raw: '+' },
          { line: 5, token: TOKEN.IDENTIFIER, raw: 'b' },
          // d = c * b
          { line: 6, token: TOKEN.IDENTIFIER, raw: 'd' },
          { line: 6, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 6, token: TOKEN.IDENTIFIER, raw: 'c' },
          { line: 6, token: TOKEN.OP_MUL, raw: '*' },
          { line: 6, token: TOKEN.IDENTIFIER, raw: 'b' },
          // e = d % a
          { line: 7, token: TOKEN.IDENTIFIER, raw: 'e' },
          { line: 7, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 7, token: TOKEN.IDENTIFIER, raw: 'd' },
          { line: 7, token: TOKEN.OP_MOD, raw: '%' },
          { line: 7, token: TOKEN.IDENTIFIER, raw: 'a' },
          // f = d / a
          { line: 8, token: TOKEN.IDENTIFIER, raw: 'f' },
          { line: 8, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 8, token: TOKEN.IDENTIFIER, raw: 'd' },
          { line: 8, token: TOKEN.OP_DIV, raw: '/' },
          { line: 8, token: TOKEN.IDENTIFIER, raw: 'a' },
          // g = d // a
          { line: 9, token: TOKEN.IDENTIFIER, raw: 'g' },
          { line: 9, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 9, token: TOKEN.IDENTIFIER, raw: 'd' },
          { line: 9, token: TOKEN.OP_IDIV, raw: '//' },
          { line: 9, token: TOKEN.IDENTIFIER, raw: 'a' },
          // h = a - b
          { line: 10, token: TOKEN.IDENTIFIER, raw: 'h' },
          { line: 10, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 10, token: TOKEN.IDENTIFIER, raw: 'a' },
          { line: 10, token: TOKEN.OP_MINUS, raw: '-' },
          { line: 10, token: TOKEN.IDENTIFIER, raw: 'b' },
          // tmp1 = 16
          { line: 11, token: TOKEN.IDENTIFIER, raw: 'tmp1' },
          { line: 11, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 11, token: TOKEN.NUMBER, raw: '16' },
          // tmp2 = 15
          { line: 12, token: TOKEN.IDENTIFIER, raw: 'tmp2' },
          { line: 12, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 12, token: TOKEN.NUMBER, raw: '15' },
          // i = tmp1 & tmp2
          { line: 13, token: TOKEN.IDENTIFIER, raw: 'i' },
          { line: 13, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 13, token: TOKEN.IDENTIFIER, raw: 'tmp1' },
          { line: 13, token: TOKEN.OP_BAND, raw: '&' },
          { line: 13, token: TOKEN.IDENTIFIER, raw: 'tmp2' },
          // tmp1 = 0xF0
          { line: 14, token: TOKEN.IDENTIFIER, raw: 'tmp1' },
          { line: 14, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 14, token: TOKEN.NUMBER, raw: '0xF0' },
          // tmp2 = 0x0F
          { line: 15, token: TOKEN.IDENTIFIER, raw: 'tmp2' },
          { line: 15, token: TOKEN.OP_ASSIGN, raw: '=' },
          { line: 15, token: TOKEN.NUMBER, raw: '0x0F' },
        ],
      },
    ].forEach((testCase) => {
      const { name, tokens } = testCase;
      const path = `lua/${name}.lua`;
      describe(`lex ${path}`, () => {
        const chunk = readFileSync(path).toString();
        const lexer = new Lexer(chunk);
        tokens.forEach((expect) => {
          const [line, token, raw] = lexer.nextToken();
          it(`should parse token {${raw}}(type:${token}) ${expect.token} on line ${expect.line}`, () => {
            assert.equal(line, expect.line);
            assert.equal(token, expect.token);
            assert.equal(raw, expect.raw);
          });
        });
      });
    });
  });
});
