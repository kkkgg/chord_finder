
function findChord(code_str){
	// TODO 全角半角変換、半角カナ変換
	code_str = code_str.replace(/[ 　\/]+/g, "");
	if(!code_str) return {"elements":"", "code":""};
	code_str = code_str.toLowerCase();
	code_str = code_str.replace(/＃/g, "#");
	code_str = code_str.replace(/ド/g, "c");
	code_str = code_str.replace(/レ/g, "d");
	code_str = code_str.replace(/ミ/g, "e");
	code_str = code_str.replace(/ファ/g, "f");
	code_str = code_str.replace(/ソ/g, "g");
	code_str = code_str.replace(/ラ/g, "a");
	code_str = code_str.replace(/シ/g, "b");
	var code_ary = code_str.match(/.[#♭]?/g);
	// TODO 異常文字の無視
	// 重複排除、右手とルート音の重なりのみ許可
	// midiノートにする。左のCを36として計算
	var num_ary = [];
	{
		var code2num = {
			"c":  0,
			"b#": 0,
			"c#": 1,
			"d♭": 1,
			"d":  2,
			"d#": 3,
			"e♭": 3,
			"e":  4,
			"f♭": 4,
			"f":  5,
			"f#": 6,
			"g♭": 6,
			"g":  7,
			"g#": 8,
			"a♭": 8,
			"a":  9,
			"a#": 10,
			"b♭": 10,
			"b":  11,
		};
		var base_num = 36;
		var before_num = base_num;
		code_ary.forEach(function(e){
			num = base_num + code2num[e];
			if(num < before_num){
				base_num += 12;
				num = base_num + code2num[e];
			}
			num_ary.push(num);
			before_num = num;
		});
	}
	
	// 転回の調整

	// 相対値の取得
	var rel_num_ary = [];
	{
		var base_num = num_ary[0];
		num_ary.forEach(function(e){
			rel_num_ary.push(e - base_num);
		});
	}
	
	// 基礎和音にはまるか判定
	{
		var str2waon = {
			"0,4,7": "",
			"0,3,7": "m",
			"0,4,7,10": "7",
			"0,3,7,10": "m7",
			"0,4,7,11": "M7",
			"0,5,7": "sus4",
			//"0,2,7": "sus2",
			"0,4,8": "aug",
			"0,3,6,9": "dim",
			// ここへ全組み合わせを記述しておけばよい！？、組み合わせ数は？
		};
		var waon = str2waon[rel_num_ary.join(",")];
		var result = {
			"elements": code_ary,
			"code": code_ary[0].toUpperCase() + (waon == null ? "?" : waon),
		};
	}
	
	// ベース音をとって判定
	// 2音のときどうするか
	// 音が多すぎるときどうするか
	return result;
}

function test(){
	var ary = [
		"ソシレ",
		"ソシ♭レ",
		"ソシ#レ",
		"ソシレ",
		"cgb",
		"cegb",
		"ACED",
		"ファ ドミソシ",
		"レ ドミソシ",
	];
	ary.forEach(function(e){
		console.log( findChord(e) );
	});
}

// test();
