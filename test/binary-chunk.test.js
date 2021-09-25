import { assert } from 'chai';
import { describe, it } from 'mocha';
import { Decoder } from '../src/binary-chunk.js';

describe('binary-chunk.js', () => {
  describe('Decoder', () => {
    describe('readByte()', () => {
      const array = [65, 66];
      const decoder = new Decoder(new Uint8Array(array));
      it('should read 65', () => {
        assert.equal(decoder.readByte(), array[0]);
      });
      it('should read 66', () => {
        assert.equal(decoder.readByte(), array[1]);
      });
      it('should throw out of bound error', () => {
        assert.throw(() => { decoder.readByte(); }, 'Buffer out of bound');
      });
    });

    describe('readBytes()', () => {
      const decoder = new Decoder(new Uint8Array([65, 66, 67, 68, 69, 70, 71]));
      const test1 = 'AB';
      it(`should read '${test1}'`, () => {
        assert.equal(decoder.readBytes(2), test1);
      });
      const test2 = 'CDEF';
      it(`should read '${test2}'`, () => {
        assert.equal(decoder.readBytes(4), test2);
      });
      it('should throw out of bound error', () => {
        assert.throw(() => { decoder.readBytes(3); }, 'Buffer out of bound');
      });
    });

    describe('readUint32()', () => {
      it('should read uint32', () => {
        const decoder = new Decoder(
          new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34, 0x12]),
        );
        assert.equal(decoder.readUint32(), 0x9ABCDEF0);
        assert.equal(decoder.readUint32(), 0x12345678);
      });
    });

    describe('readInt64()', () => {
      it('should read int64', () => {
        const decoder = new Decoder(
          new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34, 0x12]),
        );
        assert.equal(decoder.readInt64(), BigInt('0x123456789ABCDEF0'));
      });
      it('should throw out of bound error', () => {
        const decoder = new Decoder(new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34]));
        assert.throw(() => { decoder.readInt64(); }, 'Buffer out of bound');
      });
    });

    describe('readFloat64()', () => {
      const myFloat1 = 990.232;
      const myFloat2 = 23.333;
      const decoder = new Decoder(new Uint8Array(new Float64Array([myFloat1, myFloat2]).buffer));
      it('should read float64', () => {
        assert.equal(decoder.readFloat64(), myFloat1);
        assert.equal(decoder.readFloat64(), myFloat2);
      });
      it('should throw out of bound error', () => {
        assert.throw(() => { decoder.readFloat64(); }, 'Buffer out of bound');
      });
    });
  });
});
