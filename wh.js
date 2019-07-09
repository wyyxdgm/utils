var img = {
	width: $('img').css('width'),
	height: $('img').css('height')
};
var T = {
	width: 210,
	height: 140
};
var ra = img.width / T.width > img.height / T.height ? img.width / T.width : img.height / T.height;
var ST = {
	width: parseInt(img.width / ra),
	height: parseInt(img.height / ra)
};
console.log('比例：', ra, '变换后width:', ST.width, '变换后height:', ST.height);