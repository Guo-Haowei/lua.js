import { assert } from 'chai';
import { describe, it } from 'mocha';
import { TOKEN } from '../src/compiler/tokens.js';
import Lexer from '../src/compiler/lexer.js';
import {
  parseEmptyStat,
  parseAssignOrFuncCallStat,
} from '../src/compiler/parser.js';
import * as ast from '../src/compiler/node.js';

const setUpLexer = (source) => {
  const lexer = new Lexer(source);
  lexer.lex();
  return lexer;
};

describe('parser.js', () => {
  describe('parseEmptyStat()', () => {
    const source = ';';
    it(`should parse < ${source} > empty stat`, () => {
      const lexer = setUpLexer(source);
      const node = parseEmptyStat(lexer);
      assert.deepEqual(node, {});
      assert.equal(lexer.peekKind(), TOKEN.EOF);
    });
  });

  describe('parseAssignOrFuncCallStat()', () => {
    const source = 'print("Hello, World!")';
    it(`should parse < ${source} > as FuncCallExpr`, () => {
      const lexer = setUpLexer(source);
      const node = parseAssignOrFuncCallStat(lexer);
      const {
        line, lastLine, prefixExpr, args,
      } = node;
      assert.equal(lastLine, 1);
      assert.equal(line, 1);
      assert.deepEqual(prefixExpr, new ast.NameExpr(1, 'print'));
      assert.deepEqual(args, [new ast.StringExpr(1, '"Hello, World!"')]);
    });
  });
});
