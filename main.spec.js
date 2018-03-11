"use strict";
/// <reference path="./main.ts"/>
var targets = NumeronCommon.createCandicate([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
var sumTurn = 0;
for (var i = 0; i < 500; i++) {
    var current = NumeronCommon.choice(targets);
    var ai = new NumeronAI();
    var answer = [1, 2, 3];
    var judge = NumeronCommon.getJudge(answer, current);
    while (judge.current !== 3) {
        ai.updateCandicate(judge, answer);
        answer = ai.decideCallNumber();
        judge = NumeronCommon.getJudge(answer, current);
        if (ai.turn > 10) {
            throw new Error();
        }
    }
    sumTurn += (ai.turn + 1);
}
;
console.log(sumTurn / 500);
