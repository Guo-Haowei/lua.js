import { assert } from 'chai';
import { describe, it } from 'mocha';
import { TOKEN } from '../src/compiler/tokens.js';
import Lexer from '../src/compiler/lexer.js';

describe('lexer.js', () => {
  describe('Parsing chunk', () => {
    const chunk = ' +- ///\r\n  ;\tabcde"fghij"-- abcdefg \n\r;';
    const lexer = new Lexer(chunk);
    [
      { line: 1, token: TOKEN.OP_ADD, raw: '+' },
      { line: 1, token: TOKEN.OP_MINUS, raw: '-' },
      { line: 1, token: TOKEN.OP_IDIV, raw: '//' },
      { line: 1, token: TOKEN.OP_DIV, raw: '/' },
      { line: 2, token: TOKEN.SEP_SEMI, raw: ';' },
      { line: 2, token: TOKEN.IDENTIFIER, raw: 'abcde' },
      { line: 2, token: TOKEN.STRING, raw: '"fghij"' },
      { line: 3, token: TOKEN.SEP_SEMI, raw: ';' },
    ].forEach((expect) => {
      const [line, token, raw] = lexer.nextToken();
      it(`should parse token {${raw}}(type:${token}) ${expect.token} on line ${expect.line}`, () => {
        assert.equal(line, expect.line);
        assert.equal(token, expect.token);
        assert.equal(raw, expect.raw);
      });
    });
  });
});
