// 破壊的
function rotateArray(arr, num, reverse){
  for(var i=0; i<num; i++){
    if(reverse)
      arr.unshift(arr.pop());
    else
      arr.push(arr.shift());
  }
  return arr;
}

// 非破壊的
// function uniqArray(arr){
//   return arr.filter(function (x, i, self) {
//     return self.indexOf(x) === i;
//   });
// }

function productArray(ary1, ary2){
	var res = [];
	ary1.forEach(function(e1){
		ary2.forEach(function(e2){
			var ary = [];
			var exist = false;
			[e1[0],e2[0]].forEach(function(e){
				if(e == null){
				}
				else if(e instanceof Array){
					ary = ary.concat(e);
				}
				else if(ary.indexOf(e) >= 0){
					exist = true;
				}
				else{
					ary.push(e)
				}
			});
			if(exist) return;
			res.push([
				ary,
				e1[1] + e2[1]
			]);
		});
	});
	return res;
}

function generateChordList(){
	// 0
	var root_ary = [
		[0, ""],
	];
	// 3
	var third_ary = [
		[null, "omit3"], // omitの場合表記は末尾っぽい
		// [1, "sus-2"],
		// [2, "sus2"],
		[3, "m"],
		[4, ""],
		[5, "sus4"],
	];

	// 5
	var fifth_ary = [
		[null, "omit5"],
		[6, "-5"],
		[7, ""],
		[8, "+5"],
	];

	// 6,7
	var seventh_ary = [
		[null, ""],
		[9, "6"],
		[10, "7"],
		[11, "M7"],
	];

	// tension
	// 重なっている場合加えない、それぞれ独立
	var tension_ary1 = [
		[null, ""],
		// [1, "add-9"],
		// [2, "add9"], // トライアドに足すときはこっち
		// [3, "add+9"],
		[1, "(-9)"],
		[2, "(9)"],
		[3, "(+9)"],
	];
	var tension_ary2 = [
		[null, ""],
		//[5, "add4"],  // トライアドに足すときはこっち
		[5, "(11)"], // 7thに足すときはこっちっぽい
		[6, "(#11)"], // 7thに足すときはこっちっぽい
	];
	var tension_ary3 = [
		[null, ""],
		[8, "(-13)"],
		[9, "(13)"],
	];

	var tmp_ary;
	tmp_ary = productArray(root_ary, third_ary);
	tmp_ary = productArray(tmp_ary, seventh_ary);
	tmp_ary = productArray(tmp_ary, fifth_ary);
	tmp_ary = productArray(tmp_ary, tension_ary1);
	tmp_ary = productArray(tmp_ary, tension_ary2);
	tmp_ary = productArray(tmp_ary, tension_ary3);

	var regex1 = /(omit\d)/g;
	tmp_ary = tmp_ary.map(function(e){
		// omit記述は末尾に付け替え
		var moving_targets = e[1].match(regex1);
		if( moving_targets ){
			return [
				e[0],
				e[1].replace(regex1, "") + moving_targets.join("")
			];
		}
		else return e;
	});
	return tmp_ary;
}


// 文字列か文字列の配列で返る
function findChord(chord_str){
	console.log("input: " + chord_str);
	// コメント行
	chord_str = chord_str.replace(/'.*$/g, "");
	// ♪♩♫♬
	chord_str = chord_str.toLowerCase();
	chord_str = chord_str.replace(/[＃♯﹟]/g, "#");
	chord_str = chord_str.replace(/[ドＣｃ]|ﾄﾞ/g, "c");
	chord_str = chord_str.replace(/[レﾚＤｄ]/g, "d");
	chord_str = chord_str.replace(/[ミﾐＥｅ]/g, "e");
	chord_str = chord_str.replace(/[Ｆｆ]|ファ|ﾌｧ/g, "f");
	chord_str = chord_str.replace(/[ソｿＧｇ]/g, "g");
	chord_str = chord_str.replace(/[ラﾗＡａ]/g, "a");
	chord_str = chord_str.replace(/[シｼＢｂ]/g, "b");
	// TODO 異常文字の無視、許可された文字以外は無視
	//chord_str = chord_str.replace(/[ 　\/]+/g, "");
	chord_str = chord_str.replace(/[^cdefgab♭#]+/g, "");
	if(!chord_str) return "";
	console.log("chord_str: " + chord_str);
	var chord_ary = chord_str.match(/.[#♭]?/g);

	var chord2num = {
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
	
	// 音階ソート
	{
		// 数値付与
		var obj_ary = [];
		chord_ary.forEach(function(e){
			obj_ary.push([e,chord2num[e]]);
		});
		// ルート保存
		var root = obj_ary[0];
		// ソート
		obj_ary.sort(function(a,b){
			return a[1] - b[1]
		});
		// ルート先頭へローテート
		var idx = obj_ary.indexOf(root);
		rotateArray(obj_ary, idx);
        // 重複除去: C#とD♭など同音もuniqになる
		var before = null;
		var uniq_obj_ary = [];
		obj_ary.forEach(function(e){
			if(before != null && before[1] == e[1]) return;
			uniq_obj_ary.push(e);
			before = e;
		});
		// 音階だけに戻す
		chord_ary = [];
		uniq_obj_ary.forEach(function(e){
			chord_ary.push(e[0]);
		});
	}
	

	var res = null;
	["standard","generated1","generated2"].forEach(function(map_type){
		// 判定
		if(res == null){
			res = find(chord_ary, map_type);
		}
		else{
			return res;
		}

		root = chord_ary[0];

		// ベース音をとって判定
		function rotate_and_onbase(){
			var tmp_chord_ary = [].concat(chord_ary);
			tmp_chord_ary.shift();
			return find_with_rotate(tmp_chord_ary, root, map_type);
		};
		if(res == null){
			res = rotate_and_onbase();
		}
		else if(map_type == "generated2"){
			res = [].concat(res,rotate_and_onbase());
		}
		else{
			return res;
		}

		// 転回して判定
		if(res == null){
			// 転回でマッチした場合はオンベースとする
			res = find_with_rotate(chord_ary, root, map_type);
		}
		else if(map_type == "generated2"){
			res = [].concat(res, find_with_rotate(chord_ary, root, map_type));
		}
		else{
			return res;
		}
	});

	// 戻り値が複数の場合、コレじゃないものを除去
	if(res instanceof Array){
		var max = -9999;
		var score_ary = res.map(function(e){
			// omit は 3点減点
			var m = e.match(/omit/g);
			var score = 0 - (m ? m.length * 3 : 0);
			// (9)などのテンションは2点減点
			var m2 = e.match(/\(/g);
			score = score - (m2 ? m2.length * 2 : 0);
			// オンコードは1点減点
			var m3 = e.match(/\//g);
			score = score - (m3 ? m3.length : 0);
			if(score > max) max = score;
			return score;
		});
		console.log(res);
		console.log(score_ary);
		res = res.filter(function(e, i){
			return score_ary[i] == max;
		});
		console.log(res);
		console.log("");
	}
		

	return res;

	// 文字列か文字列の配列で返る
	function find(chord_ary, map_type){
		// midiノートにする。左のCを36として計算
		var num_ary = [];
		{
			var base_num = 36;
			var before_num = base_num;
			chord_ary.forEach(function(e){
				num = base_num + chord2num[e];
				if(num < before_num){
					base_num += 12;
					num = base_num + chord2num[e];
				}
				num_ary.push(num);
				before_num = num;
			});
		}

		// 相対値の取得
		var rel_num_ary = [];
		{
			var base_num = num_ary[0];
			num_ary.forEach(function(e){
				rel_num_ary.push(e - base_num);
			});
		}

		// 和音マップにはまるか判定
		{
			var chord_map = {};
			if(map_type == null || map_type == "standard"){
				// 基礎和音
				chord_map = {
					// 三和音
					"0,4,7": "",
					"0,3,7": "m",
					"0,4,6": "-5",
					"0,3,6": "m-5", // dim
					"0,4,8": "aug", // +5
					"0,3,8": "m+5",
					"0,5,7": "sus4",
					"0,2,7": "sus2", // Ysus4/X
					
					// 四和音
					"0,4,7,9": "6",
					"0,3,7,9": "m6",
					"0,4,7,10": "7",
					"0,3,7,10": "m7",
					"0,4,7,11": "M7",
					"0,3,7,11": "mM7",
					"0,4,6,10": "7-5",
					"0,3,6,10": "m7-5",
					"0,4,6,11": "M7-5",
					"0,3,6,11": "mM7-5",
					"0,4,6,9": "6",
					"0,3,6,9": "m6",
					"0,5,7,10": "7sus4",
					"0,3,6,9": "dim7",
					"0,2,4,7": "add9",

					// テンション5
					"0,2,4,7,10": "9",
					"0,3,4,7,10": "+9",
					"0,2,3,7,10": "m9",
					"0,2,4,7,11": "M9",
					"0,2,4,7,9": "69",
					"0,2,3,7,9": "m69",

					// テンション6
					"0,2,4,5,7,10": "11",
					"0,2,4,6,7,10": "+11",
					"0,2,3,5,7,10": "m11",
					"0,2,3,6,7,10": "m+11",

					// テンション7
					"0,2,4,5,7,9,10": "13",
					"0,2,4,5,7,8,10": "-13",
					"0,2,3,5,7,9,10": "m13",
					"0,2,3,5,7,8,10": "m-13",

					// その他
					"0,3,4,10": "+9[omit5] ジミヘンコード",
				};
			}
			else if(map_type == "generated1"){
				// 生成コード(omitなし)で判定
				if(arguments.callee.generated1ChordMap == null){
					var map = {};
					generateChordList().forEach(function(e){
						if(e[1].match(/omit/)) return;
						var key = e[0].sort(function(a,b){return a-b}).join(",");
						var val = map[key];
						if(val){
							map[key] = [].concat(val,e[1]);
						}
						else{
							map[key] = e[1];
						}
					});
					arguments.callee.generated1ChordMap = map;
				}
				chord_map = arguments.callee.generated1ChordMap;
			}
			else if(map_type == "generated2"){
				// 生成コード(omitあり)で判定
				if(arguments.callee.generated2ChordMap == null){
					var map = {};
					generateChordList().forEach(function(e){
						var key = e[0].sort(function(a,b){return a-b}).join(",");
						var val = map[key];
						if(val){
							map[key] = [].concat(val,e[1]);
						}
						else{
							map[key] = e[1];
						}
					});
					arguments.callee.generated2ChordMap = map;
				}
				chord_map = arguments.callee.generated2ChordMap;
			}
			var chords = chord_map[rel_num_ary.join(",")];
			var result;
			if(chords == null){
				result = null;
			}
			else if(chords instanceof Array){
				result = chords.map(function(e){
					return chord_ary[0].toUpperCase() + e;
				});
			}
			else{
				result = chord_ary[0].toUpperCase() + chords;
			}
		}

		return result;
	}

	// 文字列か文字列の配列で返る
	function find_with_rotate(chord_ary, root, map_type){
		var tmp_chord_ary = [].concat(chord_ary);
		for(var i=0; i<tmp_chord_ary.length-1; i++){
			rotateArray(tmp_chord_ary, 1);
			res = find(tmp_chord_ary, map_type);
			if(res == null){
			}
			else if(res instanceof Array){
				return res.map(function(e){
					return e + "/" + root.toUpperCase();
				});
			}
			else{
				return res + "/" + root.toUpperCase();
			}
		}
		return null;
	}


}

// 組み合わせ計算
function k_combinations(set, k) {
	var i, j, combs, head, tailcombs;
	
	// There is no way to take e.g. sets of 5 elements from
	// a set of 4.
	if (k > set.length || k <= 0) {
		return [];
	}
	
	// K-sized set has only one K-sized subset.
	if (k == set.length) {
		return [set];
	}
	
	// There is N 1-sized subsets in a N-sized set.
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	// Assert {1 < k < set.length}
	
	// Algorithm description:
	// To get k-combinations of a set, we want to join each element
	// with all (k-1)-combinations of the other elements. The set of
	// these k-sized sets would be the desired result. However, as we
	// represent sets with lists, we need to take duplicates into
	// account. To avoid producing duplicates and also unnecessary
	// computing, we use the following approach: each element i
	// divides the list into three: the preceding elements, the
	// current element i, and the subsequent elements. For the first
	// element, the list of preceding elements is empty. For element i,
	// we compute the (k-1)-computations of the subsequent elements,
	// join each with the element i, and store the joined to the set of
	// computed k-combinations. We do not need to take the preceding
	// elements into account, because they have already been the i:th
	// element so they are already computed and stored. When the length
	// of the subsequent list drops below (k-1), we cannot find any
	// (k-1)-combs, hence the upper limit for the iteration:
	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		// head is a list that includes only our current element.
		head = set.slice(i, i + 1);
		// We take smaller combinations from the subsequent elements
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		// For each (k-1)-combination we join it with the current
		// and store it to the set of k-combinations.
		for (j = 0; j < tailcombs.length; j++) {
			combs.push(head.concat(tailcombs[j]));
		}
	}
	return combs;
}


var generatePermutation = function(perm, pre, post, n) {
  var elem, i, rest, len;
  if (n > 0)
    for (i = 0, len = post.length; i < len; ++i) {
      rest = post.slice(0);
      elem = rest.splice(i, 1);
      generatePermutation(perm, pre.concat(elem), rest, n - 1);
    }
  else
    perm.push(pre);
};

function permutation(list, num){
	var perm = [];
    generatePermutation(perm, [], list, num);
    return perm;
}

// 渡されたサイズの構成音の全通りを出力
function generateChord(){
	var tones = [
		"c",
		"c#",
		"d",
		"d#",
		"e",
		"f",
		"f#",
		"g",
		"g#",
		"a",
		"a#",
		"b",
	];
	// 組み合わせ
	k_combinations(tones, parseInt(process.argv[2] || "2")).forEach( function(e){
		console.log( e.join("") );
	});

	// 順列
	// permutation(tones, parseInt(process.argv[2] || "2")).forEach( function(e){
	// 	console.log( e.join("") );
	// });
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
		"ドミ♭ファ#ラ",
		"レファ#ラ#",
	];
	ary.forEach(function(e){
		console.log( findChord(e) );
	});
}


function test_stdin(){
	var util = require( 'util' );
	var stream = require( 'stream' );
	var Transform = stream.Transform;

	var LineStream = function ( options ) {
		if (!(this instanceof LineStream))
			return new LineStream(options);
		options = options || {};
		options.decodeStrings = false;
		Transform.call( this, options );
		this.newline = /\r\n|[\r\n]/;
		this._buf = '';
	};
	util.inherits( LineStream, Transform );
	LineStream.prototype._transform = function( chunk, encoding, done ){
		this._buf += chunk;
		if( this.newline.test( this._buf ) ){
			var ary = this._buf.split(this.newline);
			this._buf=ary.pop();
			while( ary.length > 0 ){
				this.push( ary.shift() );
			}
		}
		done();
	};
	LineStream.prototype._flush = function( done ){
		this.push( this._buf );
		this._buf = '';
		done();
	};

	process.stdin.setEncoding( 'utf-8' );
	stream = new LineStream( { decodeStrings : false, encoding: 'utf-8'} );
	process.stdin.pipe( stream )
	stream.on( 'data', function( data ){
		console.log( findChord(data) );
	});
}

//test();
// test_stdin();
// generateChord();
