/**
 * 纵向全排列拼接字符:127、128、...、649
 */

var matrix = [
	[1, 2, 3, 4, 5, 6],
	[2, 3, 4],
	[7, 8, 9]
];

function appendNextRow(matrix, rowIndex, curstr) {
	if (matrix.length <= rowIndex) return console.log(curstr);
	else {
		for (var colIndex in matrix[rowIndex]) {
			appendNextRow(matrix, rowIndex + 1, curstr + matrix[rowIndex][colIndex]);
		}
	}
}
appendNextRow(matrix, 0, '');