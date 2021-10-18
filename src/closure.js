class LuaClosure {
  constructor(proto, jsFunc, nUpvals) {
    this.proto = proto;
    this.jsFunc = jsFunc;
    this.upvals = new Array(nUpvals || 0).fill(undefined);
  }
}

const newLuaClosure = (proto) => {
  const nUpvals = proto.upvals.length;
  return new LuaClosure(proto, undefined, nUpvals);
};

const newJsClosure = (jsFunc, nUpvals) => new LuaClosure(undefined, jsFunc, nUpvals);

export { LuaClosure, newLuaClosure, newJsClosure };
