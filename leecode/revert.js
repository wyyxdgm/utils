const str = "12(3(45)67(89)0)";

function revert(str) {
  const charArray = str.split("");
  let leftIdxes = [];
  for (let i = 0; i < charArray.length; i++) {
    let char = charArray[i];
    if (char == "(") {
      leftIdxes.push(i);
    } else if (char == ")") {
      const leftIdx = leftIdxes.pop();
      const rightIdx = i;
      revertArr(charArray, leftIdx, rightIdx - leftIdx + 1);
    } else {
    }
  }
  return charArray.join("");
}

function revertArr(arr, i, len) {
  subArr = arr.splice(i, len); // 取出
  arr.splice(i, 0, ...subArr.reverse()); // 填入
}
const res = revert(str);
console.log(res);
