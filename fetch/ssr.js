// ssr
var ssrTr = document.querySelectorAll("#post-box > div > section > div > table > tbody > tr")
var ssr_LinkList = [];
for (var i = 0; i < ssrTr.length; i++) {
  //console.log('ss://'+ssrTr[i].children[4].innerText+':'+ssrTr[i].children[3].innerText+'@'+ssrTr[i].children[1].innerText+':'+ssrTr[i].children[2].innerText);
  ssr_LinkList.push({
    method: ssrTr[i].children[4].innerText,
    password: ssrTr[i].children[3].innerText,
    server: ssrTr[i].children[1].innerText,
    server_port: Number(ssrTr[i].children[2].innerText),
    obfs: ssrTr[i].children[6].innerText,
    protocol: ssrTr[i].children[5].innerText,
    enable: true,
    remarks: ssrTr[i].children[1].innerText
  });
}
let ssr_obj = {
  "random" : false,
  "authPass" : null,
  "useOnlinePac" : false,
  "TTL" : 0,
  "global" : false,
  "reconnectTimes" : 3,
  "index" : 0,
  "proxyType" : 0,
  "proxyHost" : null,
  "authUser" : null,
  "proxyAuthPass" : null,
  "isDefault" : false,
  "pacUrl" : null,
  "configs" : [
    {
      "enable" : true,
      "password" : "dongtaiwang.com",
      "method" : "none",
      "remarks" : "新服务器",
      "server" : "lg1.free4444.xyz",
      "obfs" : "tls1.2_ticket_auth",
      "protocol" : "auth_chain_a",
      "server_port" : 443,
      "remarks_base64" : "5paw5pyN5Yqh5Zmo"
    }
  ],
  "proxyPort" : 0,
  "randomAlgorithm" : 0,
  "proxyEnable" : false,
  "enabled" : true,
  "autoban" : false,
  "proxyAuthUser" : null,
  "shareOverLan" : false,
  "localPort" : 1080
}
ssr_obj.configs = ssr_obj.configs.concat(ssr_LinkList);
console.log(JSON.stringify(ssr_obj))