import { TOKEN } from './tokens.js';

const isNewLine = (char) => char === '\r' || char === '\n';

const isWhiteSpace = (char) => '\t\n\v\f\r '.includes(char);

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

    switch (this.chunk[0]) {
      case ';': this.next(1); return [this.line, TOKEN.SEP_SEMI, ''];
      default: throw new Error(`Unexpected character ${this.chunk[0]} at line ${this.line}`);
    }
  }

  skipWhiteSpaces() {
    while (this.chunk.length > 0) {
      if (this.chunk.startsWith('--')) {
        this.skipComment();
      } else if (this.chunk.startsWith('\r\n') || this.chunk.startsWith('\n\r')) {
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
