import { protoFromFile, listProto, luaMain } from './luac.js';

const HELP_STRING = `luac: no input files given
usage: luac [options] [filenames]
Available options are:
  -l       list (use -l -l for full listing)
  -o name  output to file 'name' (default is "luac.out")
  -p       parse only
  -s       strip debug information
  -v       show version information
  --       stop handling options
  -        stop handling options and process stdin
`;

const main = () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    process.stdout.write(HELP_STRING);
    return;
  }

  while (args.length) {
    const arg = args.shift();
    switch (arg) {
      case '-l': {
        const fileName = args.shift();
        const proto = protoFromFile(fileName);
        listProto(proto);
        break;
      }
      default: {
        const proto = protoFromFile(arg);
        luaMain(proto, true);
      }
    }
  }
};

try {
  main();
} catch (err) {
  process.stderr.write(err);
}
