class LuaClosure {
  constructor(proto, jsFunc) {
    this.proto = proto;
    this.jsFunc = jsFunc;
  }
}

const newLuaClosure = (proto) => new LuaClosure(proto, undefined);
const newJsClosure = (jsFunc) => new LuaClosure(undefined, jsFunc);

export { LuaClosure, newLuaClosure, newJsClosure };
