var date = new Date('2018-04-01');
var moment = require('moment');
var roomid = 29;
var userid = 52;
var arr=[];
for (var i = 1; i < 31; i++) {
	date.setDate(i);
	var datestr = moment(date).format('YYYY-MM-DD');
	var is_weekday = date.getDay() == 6 || date.getDay() == 0 ? 0 : 1;
	// console.log(roomid, userid, datestr, is_weekday);
	arr.push(`('${roomid}', '${userid}', '2', '${datestr}', '${is_weekday}', '10:00 PM', '22', '过夜(至次日10AM)', '26', '18', '-3', '0', 'no', '0', '其他', '', '0', '5人以内', '0', '0', '0', '0', 'the formId is a mock one', '', '2018-04-05 16:23:44', '2018-04-05 16:31:19', 'tech','meetbest', '18501620624', '技术部', 'meetbest')`);
}
console.log(arr.join(',\n'));