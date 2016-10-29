#!/bin/sh
aaa(){
	cat test/3.txt | node chord_finder.js > test_20161006/3.txt


    # 集計
    for F in test*/result_score.txt; do cat $F | perl -lanE 'BEGIN{$ok=0;$all=0}/(\d+)\/(\d+)/;$ok+=$1;$all+=$2;$all++;END{say "$ok/$all"}'; done

	# finding

	# 
	for I in {1..12}; do echo -n "$I\t";cat test_20161006/$I.txt | perl -lanE 'BEGIN{$ok=0;$all=0}$ok++ unless(/\?/);$all++;END{say "$ok/$all"}'; done


}

# 例
# ./test.sh generate_all ♭ en
# ./test.sh generate_all '\#' kana
generate_all(){
	local SIGN="$1"
	local CHAR_LANG="$2"
	# for I in {1..12}; do node chord_finder.js $I > test/$I.txt; done
	for I in {1..12}; do
		node -e "require('./chord_finder.js').ChordFinder.generateChord($I,'$SIGN', '$CHAR_LANG')" > variation/$I.txt;
	done
}

# ./test.sh score 20161006_2
score(){
	NAME=$1
	DIR=test_$NAME
	mkdir -p $DIR
	# execute
	for I in {1..12}; do cat test/$I.txt | node chord_finder.js > $DIR/$I.txt; done
	# score
	for I in {1..12}; do echo -n $I$'\t';cat $DIR/$I.txt | perl -lanE 'BEGIN{$ok=0;$all=0}$ok++ unless(/\?/);$all++;END{say "$ok/$all"}'; done > $DIR/result_score.txt
}

# ./test.sh generateSiteMap kana > sitemap_kana.xml
generateSiteMap(){
	local CHAR_LANG="$1"
	echo '<?xml version="1.0" encoding="UTF-8"?>'
	echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
	cat chords_*$CHAR_LANG/* | sort -u | perl -mCGI -lnE "say CGI::escape(\$_)" | awk '{print "<url><loc>https://kkkgg.github.io/chord_finder/index.html?text=" $0 "</loc></url>"}'
	echo '</urlset>'
}

eval $@
