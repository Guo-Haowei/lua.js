import { assert } from 'chai';
import { describe, it } from 'mocha';
import { foo } from '../src/foobar.js';

describe('foo', () => {
  it('return foo', () => {
    assert.equal(foo(), 'foo');
  });
});
