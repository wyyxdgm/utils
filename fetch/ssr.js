var s2 = document.querySelectorAll("#post-box > div > section > div > table > tbody > tr")
var ss_LinkList = [];
for (var i = 0; i < s2.length; i++) {
  //console.log('ss://'+s2[i].children[4].innerText+':'+s2[i].children[3].innerText+'@'+s2[i].children[1].innerText+':'+s2[i].children[2].innerText);
  ss_LinkList.push({
    method: s2[i].children[4].innerText,
    password: s2[i].children[3].innerText,
    server: s2[i].children[1].innerText,
    server_port: Number(s2[i].children[2].innerText),
    obfs: s2[i].children[6].innerText,
    protocol: s2[i].children[5].innerText,
    enable: true,
    remarks: s2[i].children[1].innerText
  });
}
console.log(JSON.stringify(ss_LinkList))