import { assert } from 'chai';
import { describe, it } from 'mocha';
import { TOKEN } from '../src/compiler/tokens.js';
import Lexer from '../src/compiler/lexer.js';
import {
  parseFuncDefExpr,
  parseEmptyStat,
  parseAssignOrFuncCallStat,
} from '../src/compiler/parser.js';
import {
  EmptyExpr,
  StringExpr,
  NameExpr,
  // FuncCallExpr,
  // FuncDefExpr,
} from '../src/compiler/node.js';

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
      assert.deepEqual(node, new EmptyExpr());
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
      assert.deepEqual(prefixExpr, new NameExpr(1, 'print'));
      assert.deepEqual(args, [new StringExpr(1, '"Hello, World!"')]);
    });
  });

  describe('parseFuncDefExpr()', () => {
    [
      {
        source: 'function\n()\nend',
        func: (node) => {
          assert.equal(node.isVararg, false);
          assert.equal(node.line, 1);
          assert.equal(node.lastLine, 3);
        },
      },
      {
        source: 'function (...) end',
        func: (node) => {
          assert.equal(node.isVararg, true);
          assert.equal(node.line, 1);
          assert.equal(node.lastLine, 1);
        },
      },
      {
        source: 'function (a, b, c) end',
        func: (node) => {
          assert.equal(node.isVararg, false);
          assert.deepEqual(node.paramList, ['a', 'b', 'c']);
          assert.equal(node.line, 1);
          assert.equal(node.lastLine, 1);
        },
      },
      {
        source: 'function (d, e, f, ...) end',
        func: (node) => {
          assert.equal(node.isVararg, true);
          assert.deepEqual(node.paramList, ['d', 'e', 'f']);
          assert.equal(node.line, 1);
          assert.equal(node.lastLine, 1);
        },
      },
    ].forEach((testCase) => {
      const { source, func } = testCase;
      it(`should parse '${source.replace(/\n/g, ' ')}'`, () => {
        const lexer = setUpLexer(source);
        lexer.expect(TOKEN.KW_FUNCTION);
        const node = parseFuncDefExpr(lexer);
        func(node);
        assert.equal(lexer.peekKind(), TOKEN.EOF);
      });
    });
  });
});
