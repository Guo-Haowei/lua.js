import { readFileSync } from 'fs';
import { undump } from './src/binary-chunk.js';

const buffer = readFileSync('test/hello.luac');
undump(buffer);
