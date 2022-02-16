var s2 = document.querySelectorAll("#post-box > div > section > div > table > tbody > tr")
var configList = [];
for (var i = 0; i < s2.length; i++) {
  //console.log('ss://'+s2[i].children[4].innerText+':'+s2[i].children[3].innerText+'@'+s2[i].children[1].innerText+':'+s2[i].children[2].innerText);
  configList.push({
    method: s2[i].children[4].innerText,
    password: s2[i].children[3].innerText,
    server: s2[i].children[1].innerText,
    server_port: Number(s2[i].children[2].innerText),
    // obfs: s2[i].children[6].innerText,
    // protocol: s2[i].children[5].innerText,
    // enable: true,
    remarks: s2[i].children[1].innerText
  });
}
let obj = {
  "random": false,
  "authPass": null,
  "useOnlinePac": false,
  "TTL": 0,
  "global": false,
  "reconnectTimes": 3,
  "index": 0,
  "proxyType": 0,
  "proxyHost": null,
  "authUser": null,
  "proxyAuthPass": null,
  "isDefault": false,
  "pacUrl": null,
  "configs": [],
  "proxyPort": 0,
  "randomAlgorithm": 0,
  "proxyEnable": false,
  "enabled": true,
  "autoban": false,
  "proxyAuthUser": null,
  "shareOverLan": false,
  "localPort": 1080
}
obj.configs = configList;
console.log(JSON.stringify(obj))