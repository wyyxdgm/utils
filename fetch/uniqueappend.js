#!/Users/damo/.nvm/versions/node/v12.18.1/bin/node
const [
  p,
  s1 = '/Users/damo/Downloads/example-gui-config.json',
  s2 = '/Users/damo/Downloads/a.json'] = process.args;

const c1 = require(s1)
const c2 = require(s2)
c1.configs = c1.configs.concat(c2.configs)
fs.writeFileSync(s1, JSON.stringify(c1));