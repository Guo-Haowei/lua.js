import { assert } from 'chai';
import { describe, it } from 'mocha';
import { TOKEN } from '../src/compiler/tokens.js';
import Lexer from '../src/compiler/lexer.js';
import {
  parseEmptyStat,
} from '../src/compiler/parser.js';

describe('parser.js', () => {
  it('should parse empty stat', () => {
    const source = ';';
    const lexer = new Lexer(source);
    lexer.lex();
    const ast = parseEmptyStat(lexer);
    assert.deepEqual(ast, {});
    assert.equal(lexer.peekKind(), TOKEN.EOF);
  });
});
