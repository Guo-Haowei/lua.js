const convertToBoolean = (val) => {
  switch (typeof val) {
    case 'undefined': return false;
    case 'boolean': return val;
    default: return true;
  }
};

const convertToNumber = (val) => {
  switch (typeof val) {
    case 'number': {
      return [val, true];
    }
    case 'string': {
      const n = parseFloat(val);
      return [val, !Number.isNaN(n)];
    }
    default: {
      return [0, false];
    }
  }
};

const convertToString = (val) => {
  let str = '';
  if (val === undefined) {
    str = 'nil';
  } else {
    switch (typeof val) {
      case 'number':
      case 'boolean':
      case 'string':
        str = `${val}`;
        break;
      default:
        throw new Error(`Unexpected value ${val}`);
    }
  }

  return str;
};

export { convertToBoolean, convertToNumber, convertToString };
