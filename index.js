import { readFileSync } from 'fs';
import { undump } from './src/binary-chunk.js';

const proto = undump(readFileSync('test/hello_world.luac'));
// eslint-disable-next-line no-console
console.log(proto);
