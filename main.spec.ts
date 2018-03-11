/// <reference path="./main.ts"/>

const targets = NumeronCommon.createCandicate([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);

let sumTurn = 0;
for (let i = 0; i < 500; i++) {
    const current = NumeronCommon.choice(targets);
    const ai = new NumeronAI();
    let answer = [1, 2, 3];
    let judge = NumeronCommon.getJudge(answer, current);
    while (judge.current !== 3) {
        ai.updateCandicate(judge, answer);
        answer = ai.decideCallNumber()!;
        judge = NumeronCommon.getJudge(answer, current);
        if (ai.turn > 10) {
            throw new Error();
        }
    }
    sumTurn += (ai.turn + 1);
};
console.log(sumTurn / 500);
