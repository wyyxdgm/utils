#!/Users/damo/.nvm/versions/node/v12.18.1/bin/node
const [
  nodePath,
  filePath,
  s1 = '/Users/damo/Downloads/export.json',
  s2 = '/Users/damo/Downloads/a.json'] = process.argv;

function echoHelp(exitCode, msg) {
  console.log(msg || 'uniqueappend.js source target')
  exitCode !== undefined && process.exit(exitCode)
}

try {
  const c1 = require(s1)
  const c2 = require(s2)
  console.log('s1==============', s1);
  console.log('c1==============', c1.configs.length);
  console.log('s2==============', s2);
  console.log('c2==============', c2.configs.length);
  c1.configs = c1.configs.concat(c2.configs)
  if (!s1 || !c1.configs || !c1.configs.length) echoHelp(1);

  let s = new Set();
  c1.configs = c1.configs.filter(u => {
    const { password, server, server_port } = u;
    let key = `${server}#${server_port}` // #${password}
    if (s.has(key)) { return false; }
    else { s.add(key) }
    return true;
  })

  console.log('re path==============', s1);
  console.log('re length==============', c1.configs.length);
  const fs = require('fs');
  fs.writeFileSync(s1, JSON.stringify(c1));
  console.log(`write to ${s1} done`, c1.configs.length);
} catch (error) {
  echoHelp(1, error);
}
