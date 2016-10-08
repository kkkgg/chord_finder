#!/bin/sh
aaa(){
	cat test/3.txt | node chord_finder.js > test_20161006/3.txt


    # 集計
    for F in test*/result_score.txt; do cat $F | perl -lanE 'BEGIN{$ok=0;$all=0}/(\d+)\/(\d+)/;$ok+=$1;$all+=$2;$all++;END{say "$ok/$all"}'; done

	# finding

	# 
	for I in {1..12}; do echo -n "$I\t";cat test_20161006/$I.txt | perl -lanE 'BEGIN{$ok=0;$all=0}$ok++ unless(/\?/);$all++;END{say "$ok/$all"}'; done


}

generate_all(){
	for I in {1..12}; do node chord_finder.js $I > test/$I.txt; done
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

eval $@
