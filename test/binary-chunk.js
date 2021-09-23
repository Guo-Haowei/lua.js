import { assert } from 'chai';
import { describe, it } from 'mocha';
import { Reader } from '../src/binary-chunk.js';

describe('Reader', () => {
  it('readByte()', () => {
    const array = [65, 66, 67, 68];
    const reader = new Reader(new Uint8Array(array));
    array.forEach((ele) => {
      assert.equal(reader.readByte(), ele);
    });
  });

  it('readBytes(n)', () => {
    const reader = new Reader(new Uint8Array([65, 66, 67, 68, 69, 70, 71]));
    assert.equal(reader.readBytes(2), 'AB');
    assert.equal(reader.readBytes(3), 'CDE');
    assert.equal(reader.readBytes(2), 'FG');
  });

  it('readInt64()', () => {
    const reader = new Reader(new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34, 0x12]));
    assert.equal(reader.readInt64(), BigInt('0x123456789ABCDEF0'));
  });

  it('readFloat64()', () => {
    const myFloat = 990.232;
    const reader = new Reader(new Uint8Array(new Float64Array([myFloat]).buffer));
    assert.equal(reader.readFloat64(), myFloat);
  });
});
