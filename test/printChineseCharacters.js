/*
    汉字范围
    \u4E00-\u9FA5
*/
// 分析
unescape("%u4E00") // "一"
parseInt("4E00", 16 ) // 19968
parseInt( '9FA5', 16) // 40869
// (19968).toString( 16 ) // "4e00"
// 实现
function printChar( count ){
    var start = 19968;
    var end = 40869;
    var maxCount = end - start;
    if( count > maxCount ){
        console.error('超出限制', maxCount);
        return;
    }
    function transform( n ) {
        return unescape("%u" + n.toString( 16 ));
    }
    function print( data ){
        console.log( data );
    }
    for( var n = 0 ; n < count; n++ ){
        print( transform( start + n ) );
    }
}
var printCount = 10000;
printChar( printCount );