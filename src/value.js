import * as lua from './constants.js';
import LuaTable from './table.js';

const getLuaType = (val) => {
  if (val === undefined) {
    return lua.LUA_TNIL;
  }

  switch (typeof val) {
    case 'boolean': return lua.LUA_TBOOLEAN;
    case 'number': return lua.LUA_TNUMBER;
    case 'string': return lua.LUA_TSTRING;
    case 'object': if (val instanceof LuaTable) { return lua.LUA_TTABLE; }
    // eslint-disable-next-line no-fallthrough
    default: throw new Error(`Invalid value ${val}`);
  }
};

const getLuaTypeString = (val) => {
  switch (getLuaType(val)) {
    case lua.LUA_TBOOLEAN: return 'nil';
    case lua.LUA_TNUMBER: return 'number';
    case lua.LUA_TSTRING: return 'string';
    case lua.LUA_TTABLE: return 'table';
    default: throw new Error('unreachable');
  }
};

const convertToBoolean = (val) => {
  const type = getLuaType(val);
  switch (type) {
    case lua.LUA_TNIL: return false;
    case lua.LUA_TBOOLEAN: return val;
    default: return true;
  }
};

const convertToNumber = (val) => {
  const type = getLuaType(val);
  switch (type) {
    case lua.LUA_TNUMBER: return [val, true];
    case lua.LUA_TSTRING: {
      const n = parseFloat(val);
      return [val, !Number.isNaN(n)];
    }
    default: return [0, false];
  }
};

const convertToString = (val) => {
  const type = getLuaType(val);
  switch (type) {
    case lua.LUA_TNIL:
      return 'nil';
    case lua.LUA_TBOOLEAN:
    case lua.LUA_TNUMBER:
    case lua.LUA_TSTRING:
      return `${val}`;
    case lua.LUA_TTABLE:
      // eslint-disable-next-line no-console
      console.log(val);
      throw new Error('TODO: implement');
    default:
      throw new Error('unreachable');
  }
};

export {
  convertToBoolean,
  convertToNumber,
  convertToString,
  getLuaType,
  getLuaTypeString,
};
