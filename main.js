"use strict";
var UI = /** @class */ (function () {
    function UI() {
    }
    UI.updateLog = function (value) {
        this.logElement.value += "\n" + value;
    };
    UI.updateAnswer = function (value) {
        this.answerElement.innerText = value;
    };
    UI.removeLog = function () {
        this.logElement.value = "";
        this.answerElement.innerText = "";
    };
    UI.clearInput = function () {
        this.numberInput.value = "123";
        this.currentInput.value = "0";
        this.existInput.value = "0";
    };
    UI.numberInput = document.querySelector("#number");
    UI.currentInput = document.querySelector("#current");
    UI.existInput = document.querySelector("#exist");
    UI.culcButton = document.querySelector("#culculate");
    UI.resetButton = document.querySelector("#reset");
    UI.logElement = document.querySelector("#log");
    UI.answerElement = document.querySelector("#expected-number");
    return UI;
}());
var Judge = /** @class */ (function () {
    function Judge(current, exist) {
        if (current === void 0) { current = 0; }
        if (exist === void 0) { exist = 0; }
        this.current = 0;
        this.exist = 0;
        this.current = current;
        this.exist = exist;
    }
    Judge.prototype.isEqual = function (judge) {
        return this.current === judge.current &&
            this.exist === judge.exist;
    };
    return Judge;
}());
var NumeronCommon = /** @class */ (function () {
    function NumeronCommon() {
    }
    NumeronCommon.getJudge = function (answer, currentAnswer) {
        var judge = new Judge();
        answer.forEach(function (num, i) {
            if (num === currentAnswer[i]) {
                judge.current++;
            }
            else if (currentAnswer.some(function (current) { return current === num; })) {
                judge.exist++;
            }
        });
        return judge;
    };
    NumeronCommon.calcEntropy = function (answer, candicateNumbers) {
        var _this = this;
        var judgeList = candicateNumbers.map(function (candicateNums) {
            return _this.getJudge(answer, candicateNums);
        });
        var uniques = [];
        var _loop_1 = function (judge) {
            var unique = uniques.find(function (u) { return u.judge.isEqual(judge); });
            if (unique !== undefined) {
                unique.count++;
            }
            else {
                uniques.push({
                    judge: judge,
                    count: 1
                });
            }
        };
        for (var _i = 0, judgeList_1 = judgeList; _i < judgeList_1.length; _i++) {
            var judge = judgeList_1[_i];
            _loop_1(judge);
        }
        var counters = uniques.map(function (u) { return u.count; });
        var pr = counters.map(function (count) { return count / candicateNumbers.length; });
        var entropies = pr.map(function (p) { return p * -Math.log2(p); });
        return entropies.reduce(function (prev, current) {
            return prev + current;
        });
    };
    NumeronCommon.createCandicate = function (numbers, length) {
        var _this = this;
        var result = [];
        if (numbers.length < length) {
            throw new Error();
        }
        else if (length === 1) {
            for (var i = 0; i < numbers.length; i++) {
                result[i] = [numbers[i]];
            }
        }
        else {
            numbers.forEach(function (number, i) {
                var removedNumbers = Array.from(numbers);
                removedNumbers.splice(i, 1);
                var childResult = _this.createCandicate(removedNumbers, length - 1);
                for (var _i = 0, childResult_1 = childResult; _i < childResult_1.length; _i++) {
                    var child = childResult_1[_i];
                    result.push([number].concat(child));
                }
            });
        }
        return result;
    };
    NumeronCommon.choice = function (array) {
        return array[Math.floor(Math.random() * array.length)];
    };
    return NumeronCommon;
}());
var NumeronAI = /** @class */ (function () {
    function NumeronAI() {
        this._turn = 0;
        this.candicate = NumeronCommon.createCandicate([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
        this.allCandicate = Array.from(this.candicate);
    }
    Object.defineProperty(NumeronAI.prototype, "turn", {
        get: function () {
            return this._turn;
        },
        enumerable: true,
        configurable: true
    });
    NumeronAI.prototype.updateCandicate = function (judge, callNumber) {
        this._turn++;
        this.candicate = this.candicate.filter(function (candicateNumber) {
            var tmpJugde = NumeronCommon.getJudge(callNumber, candicateNumber);
            return tmpJugde.isEqual(judge);
        });
    };
    /**
     * CANDICATE→正解候補から、エントロピーが一番大きいものを選ぶ
     * ALL_CANDICATE→全候補から、エントロピーが一番大きいものを選ぶ
     */
    NumeronAI.prototype.decideCallNumber = function (sampleMode) {
        if (sampleMode === void 0) { sampleMode = "ALL_CANDICATE"; }
        var candicate;
        if (sampleMode === "CANDICATE") {
            candicate = this.candicate;
        }
        else {
            // 情報量高いものを取得したいため、候補じゃないものも混ぜる。
            candicate = this.candicate.concat(this.allCandicate);
        }
        if (this.candicate.length === 0) {
            return undefined;
        }
        var map = new Map();
        for (var _i = 0, candicate_1 = candicate; _i < candicate_1.length; _i++) {
            var numbers = candicate_1[_i];
            var entropy = NumeronCommon.calcEntropy(numbers, this.candicate);
            if (!map.has(entropy)) {
                map.set(entropy, numbers);
            }
        }
        var maxEntropy = Math.max.apply(Math, Array.from(map.keys()));
        return map.get(maxEntropy);
    };
    return NumeronAI;
}());
(function () {
    var ai = new NumeronAI();
    UI.culcButton.addEventListener("click", function () {
        var numbers = UI.numberInput.value;
        var numberArray = numbers.split("").map(function (str) { return Number(str); });
        if (numberArray.length !== 3) {
            UI.updateLog("3\u6841\u306E\u6570\u5B57\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");
            return;
        }
        var current = +UI.currentInput.value;
        var exist = +UI.existInput.value;
        var judge = new Judge(current, exist);
        ai.updateCandicate(judge, numberArray);
        var answer = ai.decideCallNumber();
        if (answer === undefined) {
            UI.updateLog("\u7B54\u3048\u304C\u5B58\u5728\u3057\u307E\u305B\u3093\u3002\u5165\u529B\u304C\u9593\u9055\u3048\u305F\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002");
            return;
        }
        UI.updateLog(ai.turn + "\u30BF\u30FC\u30F3\u76EE: \u6570\u5B57:" + numbers + ", \u3007: " + current + ", \u25B3: " + exist);
        UI.updateAnswer("" + answer);
        UI.clearInput();
        UI.numberInput.value = answer.join("");
    });
    UI.resetButton.addEventListener("click", function () {
        ai = new NumeronAI();
        UI.clearInput();
        UI.removeLog();
    });
})();
