import * as lua from './constants.js';
import LuaTable from './table.js';
import { LuaClosure } from './closure.js';

const getLuaType = (val) => {
  if (val === undefined) {
    return lua.LUA_TNIL;
  }

  switch (typeof val) {
    case 'boolean':
      return lua.LUA_TBOOLEAN;
    case 'number':
      return lua.LUA_TNUMBER;
    case 'string':
      return lua.LUA_TSTRING;
    case 'object':
      if (val instanceof LuaTable) {
        return lua.LUA_TTABLE;
      }
      if (val instanceof LuaClosure) {
        return lua.LUA_TFUNCTION;
      }
    // eslint-disable-next-line no-fallthrough
    default: throw new Error(`Invalid value [${val}] of js type '${typeof val}''`);
  }
};

const getLuaTypeString = (val) => {
  switch (val) {
    case lua.LUA_TNIL: return 'nil';
    case lua.LUA_TBOOLEAN: return 'boolean';
    case lua.LUA_TNUMBER: return 'number';
    case lua.LUA_TSTRING: return 'string';
    case lua.LUA_TTABLE: return 'table';
    case lua.LUA_TFUNCTION: return 'function';
    default: throw new Error(`unexpected value ${val}`);
  }
};

const expectLuaType = (value, expectType) => {
  const actualType = getLuaType(value);
  if (actualType === expectType) {
    return;
  }

  throw new Error(`type of ${value}(${getLuaTypeString(actualType)}) is not ${getLuaTypeString(expectType)}!`);
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

// HACK: need to fix
const tmpTableToString = (table) => {
  const { arr, map } = table;
  let result = '';
  arr.forEach((ele, i) => {
    result += `${i}:${ele}, `;
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(map)) {
    result += `'${key}':${value}`;
  }

  if (result.endsWith(', ')) {
    result = result.slice(0, -2);
  }

  return result;
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
    case lua.LUA_TTABLE: // temp
      return tmpTableToString(val);
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
  expectLuaType,
};
