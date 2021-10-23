import { assert } from 'chai';
import { describe, it } from 'mocha';
import { TOKEN } from '../src/compiler/tokens.js';

describe('tokens.js', () => {
  it('enums should equal', () => {
    assert.equal(TOKEN.OP_UNM, TOKEN.OP_MINUS);
    assert.equal(TOKEN.OP_SUB, TOKEN.OP_MINUS);
    assert.equal(TOKEN.OP_BNOT, TOKEN.OP_WAVE);
    assert.equal(TOKEN.OP_BXOR, TOKEN.OP_WAVE);
  });
});
