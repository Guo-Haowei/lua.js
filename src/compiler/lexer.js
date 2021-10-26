import { TOKEN, strToToken } from './tokens.js';

const isNewLine = (char) => char === '\r' || char === '\n';

const isWhiteSpace = (char) => '\t\n\v\f\r '.includes(char);

const isLetter = (char) => char.length === 1 && char.match(/[A-Za-z]/i);

const isDigit = (char) => char.length === 1 && char.match(/[0-9]/i);

const isHex = (char) => char.length === 1 && char.match(/[0-9A-Fa-f]/i);

const isLetterOrDigit = (char) => char.length === 1 && char.match(/[A-Za-z0-9]/i);

class Lexer {
  constructor(chunk, chunkName) {
    this.chunk = chunk;
    this.chunkName = chunkName || '<unknown>';
    this.line = 1;
  }

  nextToken() {
    this.skipWhiteSpaces();

    if (this.chunk.length === 0) {
      return [this.line, TOKEN.EOF, 'EOF'];
    }

    const puncts = ['::', '//', '~=', '==', '<<', '<=', '>>', '>=', '...', '..'];
    for (let i = 0; i < puncts.length; i += 1) {
      const punct = puncts[i];
      if (this.test(punct)) {
        this.next(punct.length);
        return [this.line, strToToken(punct), punct];
      }
    }

    const c = this.chunk[0];

    if (c === '"') {
      return this.parseString();
    }

    if (isDigit(c)) {
      return this.parseNumber();
    }

    if (isLetter(c)) {
      return this.parseIdentifier();
    }

    if (';,()[]{}+-*^%&|#:/~=<>'.includes(c)) {
      this.next(1);
      return [this.line, strToToken(c), c];
    }

    throw new Error(`Unexpected character ${this.chunk[0]} at line ${this.line}`);
  }

  parseIdentifier() {
    let len = 0;
    for (;;) {
      const c = this.chunk[len];
      if (!isLetterOrDigit(c)) {
        break;
      }

      len += 1;
    }

    const id = this.chunk.slice(0, len);
    this.next(len);
    return [this.line, TOKEN.IDENTIFIER, id];
  }

  parseNumber() {
    let len = 0;
    if (this.test('0x')) {
      len += 2;
      for (;;) {
        const c = this.chunk[len];
        if (!isHex(c)) {
          break;
        }
        len += 1;
      }
      if (len === 2) {
        throw new Error(`invalid number 0x on line ${this.line}`);
      }
    } else {
      for (;;) {
        const c = this.chunk[len];
        if (!isDigit(c)) {
          break;
        }
        len += 1;
      }
    }

    const num = this.chunk.slice(0, len);
    this.next(len);
    return [this.line, TOKEN.NUMBER, num];
  }

  parseString() {
    let len = 1;
    for (;;) {
      const c = this.chunk[len];
      if (c === '\\') {
        throw new Error('TODO: implement escape');
      }
      len += 1;

      if (c === '"') {
        break;
      }
    }
    const raw = this.chunk.slice(0, len);
    this.next(len);
    return [this.line, TOKEN.STRING, raw];
  }

  test(str) {
    return this.chunk.startsWith(str);
  }

  skipWhiteSpaces() {
    while (this.chunk.length > 0) {
      if (this.test('--')) {
        this.skipComment();
      } else if (this.test('\r\n') || this.test('\n\r')) {
        this.next(2);
        this.line += 1;
      } else if (isNewLine(this.chunk[0])) {
        this.next(1);
        this.line += 1;
      } else if (isWhiteSpace(this.chunk[0])) {
        this.next(1);
      } else {
        break;
      }
    }
  }

  next(n) {
    this.chunk = this.chunk.slice(n || 1);
  }

  skipComment() {
    this.next(2);
    // long comment
    if (this.chunk[0] === '[') {
      throw new Error('TODO: implement long comment');
    }

    // short comment
    while (this.chunk.length > 0 && !isNewLine(this.chunk[0])) {
      this.next(1);
    }
  }
}

export default Lexer;
