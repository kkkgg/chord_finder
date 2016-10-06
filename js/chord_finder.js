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

function findChord(code_str){
	// TODO 全角半角変換、半角カナ変換
	code_str = code_str.toLowerCase();
	code_str = code_str.replace(/[＃♯]/g, "#");
	code_str = code_str.replace(/ド/g, "c");
	code_str = code_str.replace(/レ/g, "d");
	code_str = code_str.replace(/ミ/g, "e");
	code_str = code_str.replace(/ファ/g, "f");
	code_str = code_str.replace(/ソ/g, "g");
	code_str = code_str.replace(/ラ/g, "a");
	code_str = code_str.replace(/シ/g, "b");
	// TODO 異常文字の無視、許可された文字以外は無視
	//code_str = code_str.replace(/[ 　\/]+/g, "");
	code_str = code_str.replace(/[^cdefgab♭#]+/g, "");
	if(!code_str) return "";
	var code_ary = code_str.match(/.[#♭]?/g);

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
	
	// 音階ソート
	{
		// 数値付与
		var obj_ary = [];
		code_ary.forEach(function(e){
			obj_ary.push([e,code2num[e]]);
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
		code_ary = [];
		uniq_obj_ary.forEach(function(e){
			code_ary.push(e[0]);
		});
	}
	
	// 転回チェック
	var res = find(code_ary);
	var org_code_ary = [].concat(code_ary);
	root = code_ary[0];
	if(res.match(/\?/)){
		// 転回でマッチした場合は音ベースとする
		res = find_with_rotate(code_ary, root);
	}
	
	// ベース音をとって判定
	if(res.match(/\?/)){
		code_ary = [].concat(org_code_ary);
		code_ary.shift();
		res = find_with_rotate(code_ary, root);
	}
	
	// 2音のときどうするか
	// 音が多すぎるときどうするか
	return res;
	

	function find(code_ary){
		// midiノートにする。左のCを36として計算
		var num_ary = [];
		{
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
			var str2chord = {
				// 三和音
				"0,4,7": "",
				"0,3,7": "m",
				"0,4,8": "aug",
				"0,3,6": "m♭5", // dim
				"0,5,7": "sus4",
				"0,2,7": "sus2", // xx sus4/xx
				
				// 四和音
				"0,4,7,10": "7",
				"0,3,7,10": "m7",
				"0,4,7,11": "M7",
				"0,3,7,11": "mM7",
				"0,4,7,9": "6",
				"0,3,7,9": "m6",
				"0,3,6,9": "dim7",
				"0,2,3,7": "add9",
				"0,3,6,10": "m7♭5",
				"0,5,7,10": "7sus4",

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

				// ここへ全組み合わせを記述しておけばよい！？、組み合わせ数は？
			};
			var chord = str2chord[rel_num_ary.join(",")];
			var result = {
				"elements": code_ary,
				"chord": code_ary[0].toUpperCase() + (chord == null ? "?" : chord),
			};
		}
		
		return result["chord"];
	}

	function find_with_rotate(code_ary, root){
		for(var i=0; i<code_ary.length-1; i++){
			rotateArray(code_ary, 1);
			res = find(code_ary);
			if(res.match(/\?/)){
			}
			else{
				return res + "/" + root.toUpperCase();
			}
		}
		return root.toUpperCase() + "?";
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
test_stdin();
// generateChord();
