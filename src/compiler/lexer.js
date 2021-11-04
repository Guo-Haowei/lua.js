import { isKeyword } from './tokens.js';

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

  lex() {
    const tokenList = [];
    for (;;) {
      const [line, token, raw] = this.nextToken();
      tokenList.push({ line, token, raw });
      if (token === 'EOF') {
        break;
      }
    }
    this.tokenList = tokenList;
  }

  checkIfPeekable() {
    const { tokenList } = this;
    if (tokenList === undefined) {
      throw new Error('call lex() first');
    }

    if (tokenList.length === 0) {
      throw new Error('unexpected EOF');
    }
  }

  peek() {
    this.checkIfPeekable();
    const token = this.tokenList[0];
    this.lastLine = token.line;
    return token;
  }

  peekKind() {
    return this.peek().token;
  }

  expect(kind) {
    const next = this.next();
    const { line, token, raw } = next;
    if (token !== kind) {
      throw new Error(`expect kind <${kind}> on line ${line}, got <${raw}>`);
    }
    return next;
  }

  next() {
    const token = this.peek();
    this.tokenList = this.tokenList.slice(1);
    return token;
  }

  currentLine() {
    return this.lastLine;
  }

  nextToken() {
    this.skipWhiteSpaces();

    if (this.chunk.length === 0) {
      return [this.line, 'EOF', 'EOF'];
    }

    const puncts = ['::', '//', '~=', '==', '<<', '<=', '>>', '>=', '...', '..'];
    for (let i = 0; i < puncts.length; i += 1) {
      const punct = puncts[i];
      if (this.test(punct)) {
        this.advance(punct.length);
        return [this.line, punct, punct];
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
      this.advance(1);
      return [this.line, c, c];
    }

    throw new Error(`Unexpected character ${this.chunk[0]} at line ${this.line}`);
  }

  parseIdentifier() {
    let len = 0;
    for (;;) {
      if (len >= this.chunk.length) {
        break;
      }
      const c = this.chunk[len];
      if (!isLetterOrDigit(c)) {
        break;
      }

      len += 1;
    }

    const id = this.chunk.slice(0, len);
    this.advance(len);

    const token = isKeyword(id) ? id : 'IDENT';
    return [this.line, token, id];
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
    this.advance(len);
    return [this.line, 'NUMBER', num];
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
    this.advance(len);
    return [this.line, 'STRING', raw];
  }

  test(str) {
    return this.chunk.startsWith(str);
  }

  skipWhiteSpaces() {
    while (this.chunk.length > 0) {
      if (this.test('--')) {
        this.skipComment();
      } else if (this.test('\r\n') || this.test('\n\r')) {
        this.advance(2);
        this.line += 1;
      } else if (isNewLine(this.chunk[0])) {
        this.advance(1);
        this.line += 1;
      } else if (isWhiteSpace(this.chunk[0])) {
        this.advance(1);
      } else {
        break;
      }
    }
  }

  advance(n) {
    this.chunk = this.chunk.slice(n || 1);
  }

  skipComment() {
    this.advance(2);
    // long comment
    if (this.chunk[0] === '[') {
      throw new Error('TODO: implement long comment');
    }

    // short comment
    while (this.chunk.length > 0 && !isNewLine(this.chunk[0])) {
      this.advance(1);
    }
  }
}

export default Lexer;
