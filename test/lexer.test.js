import { assert } from 'chai';
import { describe, it } from 'mocha';
import { TOKEN } from '../src/compiler/tokens.js';
import Lexer from '../src/compiler/lexer.js';

describe('lexer.js', () => {
  describe('Parsing chunk', () => {
    const chunk = ' \r\n ;\t-- abcdefg \n\r;';
    const lexer = new Lexer(chunk);
    [
      { line: 2, token: TOKEN.SEP_SEMI },
      { line: 3, token: TOKEN.SEP_SEMI },
    ].forEach((expect) => {
      it(`should parse token id ${expect.token} on line ${expect.line}`, () => {
        const [line, token] = lexer.nextToken();
        assert.equal(line, expect.line);
        assert.equal(token, expect.token);
      });
    });
  });
});