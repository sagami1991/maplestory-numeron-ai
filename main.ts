
class UI {
    public static numberInput = document.querySelector("#number") as HTMLInputElement;
    public static currentInput = document.querySelector("#current") as HTMLInputElement;
    public static existInput = document.querySelector("#exist") as HTMLInputElement;
    public static culcButton = document.querySelector("#culculate") as HTMLButtonElement;
    public static resetButton = document.querySelector("#reset") as HTMLButtonElement;
    public static logElement = document.querySelector("#log") as HTMLTextAreaElement;
    public static answerElement = document.querySelector("#expected-number") as HTMLElement;

    public static updateLog(value: string) {
        this.logElement.value += "\n" + value;
    }

    public static updateAnswer(value: string) {
        this.answerElement.innerText = value;
    }

    public static removeLog() {
        this.logElement.value = "";
        this.answerElement.innerText = "";
    }

    public static clearInput() {
        this.numberInput.value = "123";
        this.currentInput.value = "0";
        this.existInput.value = "0";
    }
}

class Judge {
    public current: number = 0;
    public exist: number = 0;
    public constructor(current = 0, exist = 0) {
        this.current = current;
        this.exist = exist;
    }
    public isEqual(judge: Judge) {
        return this.current === judge.current &&
            this.exist === judge.exist;
    }
}

class NumeronCommon {

    public static getJudge(answer: number[], currentAnswer: number[]) {
        const judge = new Judge();
        answer.forEach((num, i) => {
            if (num === currentAnswer[i]) {
                judge.current++;
            } else if (currentAnswer.some((current) => current === num)) {
                judge.exist++;
            }
        });
        return judge;
    }

    public static calcEntropy(answer: number[], candicateNumbers: number[][]) {
        const judgeList = candicateNumbers.map((candicateNums) => {
            return this.getJudge(answer, candicateNums);
        });
        const uniques: Array<{
            judge: Judge;
            count: number;
        }> = [];
        for (const judge of judgeList) {
            const unique = uniques.find((u) => u.judge.isEqual(judge));
            if (unique !== undefined) {
                unique.count++;
            } else {
                uniques.push({
                    judge: judge,
                    count: 1
                });
            }
        }
        const counters = uniques.map((u) => u.count);
        const pr = counters.map((count) => count / candicateNumbers.length);
        const entropies = pr.map((p) => p * -Math.log2(p));
        return entropies.reduce((prev, current) => {
            return prev + current;
        });
    }

    public static createCandicate(numbers: number[], length: number) {
        const result: number[][] = [];
        if (numbers.length < length) {
            throw new Error();
        } else if (length === 1) {
            for (let i = 0; i < numbers.length; i++) {
                result[i] = [numbers[i]];
            }
        } else {
            numbers.forEach((number, i) => {
                const removedNumbers = Array.from(numbers);
                removedNumbers.splice(i, 1);
                const childResult = this.createCandicate(removedNumbers, length - 1);
                for (const child of childResult) {
                    result.push([number, ...child]);
                }
            });
        }
        return result;
    }

    public static choice(array: any[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

class NumeronAI {
    private allCandicate: number[][];
    private candicate: number[][];
    private _turn: number = 0;
    public get turn() {
        return this._turn;
    }
    constructor() {
        this.candicate = NumeronCommon.createCandicate([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
        this.allCandicate = Array.from(this.candicate);
    }

    public updateCandicate(judge: Judge, callNumber: number[]) {
        this._turn ++;
        this.candicate = this.candicate.filter((candicateNumber) => {
            const tmpJugde = NumeronCommon.getJudge(callNumber, candicateNumber);
            return tmpJugde.isEqual(judge);
        });
    }

    /**
     * CANDICATE→正解候補から、エントロピーが一番大きいものを選ぶ
     * ALL_CANDICATE→全候補から、エントロピーが一番大きいものを選ぶ
     */
    public decideCallNumber(sampleMode: "ALL_CANDICATE" | "CANDICATE" = "ALL_CANDICATE") {
        let candicate: number[][];
        if (sampleMode === "CANDICATE") {
            candicate = this.candicate;
        } else {
            // 情報量高いものを取得したいため、候補じゃないものも混ぜる。
            candicate = [...this.candicate, ...this.allCandicate];
        }
        if (this.candicate.length === 0) {
            return undefined;
        }
        const map: Map<number, number[]> = new Map();
        for (const numbers of candicate) {
            const entropy = NumeronCommon.calcEntropy(numbers, this.candicate);
            if (!map.has(entropy)) {
                map.set(entropy, numbers);
            }
        }
        const maxEntropy = Math.max(...Array.from(map.keys()));
        return map.get(maxEntropy);
    }

}

(() => {
    let ai = new NumeronAI();
    UI.culcButton.addEventListener("click", () => {
        const numbers = UI.numberInput.value;
        const numberArray = numbers.split("").map((str) => Number(str));
        if (numberArray.length !== 3) {
            UI.updateLog(`3桁の数字を入力してください`);
            return;
        }
        const current = +UI.currentInput.value;
        const exist = +UI.existInput.value;
        const judge = new Judge(current, exist);
        ai.updateCandicate(judge, numberArray);
        const answer = ai.decideCallNumber();
        if (answer === undefined) {
            UI.updateLog(`答えが存在しません。入力が間違えた可能性があります。`);
            return;
        }
        UI.updateLog(`${ai.turn}ターン目: 数字:${numbers}, 〇: ${current}, △: ${exist}`);
        UI.updateAnswer(`${answer}`);
        UI.clearInput();
        UI.numberInput.value = answer.join("");
    });
    UI.resetButton.addEventListener("click", () => {
        ai = new NumeronAI();
        UI.clearInput();
        UI.removeLog();
    });
})();
