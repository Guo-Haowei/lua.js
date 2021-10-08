/* eslint-disable no-plusplus */

let counter = 0;
export const LUA_OPADD = counter++; // +
export const LUA_OPSUB = counter++; // -
export const LUA_OPMUL = counter++; // *
export const LUA_OPMOD = counter++; // %
export const LUA_OPPOW = counter++; // ^
export const LUA_OPDIV = counter++; // /
export const LUA_OPIDIV = counter++; // //
export const LUA_OPBAND = counter++; // &
export const LUA_OPBOR = counter++; // |
export const LUA_OPBXOR = counter++; // ~
export const LUA_OPSHL = counter++; // <<
export const LUA_OPSHR = counter++; // >>
export const LUA_OPUNM = counter++; // - (unary minus)
export const LUA_OPBNOT = counter++; // ~

counter = 0;
export const LUA_OPEQ = counter++; // ==
export const LUA_OPLT = counter++; // <
export const LUA_OPLE = counter++; // <=
