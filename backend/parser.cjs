"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
function mergeIntoOneString(expression) {
    var resultString = expression[0];
    for (var i = 1; i < expression.length; i++) {
        resultString = resultString.concat(" ");
        resultString = resultString.concat(expression[i]);
    }
    return resultString;
}
console.log(mergeIntoOneString(["PRINT", "hello", "world"]));
function convertToData(expression) {
    var expressionStr = mergeIntoOneString(expression);
    if (expressionStr === "true" || expressionStr === "false") {
        var data = {
            type: "literalBoolean",
            value: expression[0] === "true",
        };
        return data;
    }
    else if (!isNaN(Number(expressionStr))) {
        var data = {
            type: "literalInteger",
            value: Number(expressionStr),
        };
        return data;
    }
    else {
        var data = {
            type: "literalString",
            value: expressionStr,
        };
        return data;
    }
}
var insns = {
    statements: [],
};
var readFileLines = function (filename) {
    return (0, fs_1.readFileSync)(filename).toString('utf-8').split('\r\n');
};
var arr = readFileLines('example-code/example1.txt');
for (var i = 0; i < arr.length; i++) {
    var currStatement = arr[i].split(" ");
    console.log(JSON.stringify(currStatement));
    if (currStatement.length >= 2) {
        if (currStatement[1] === "=") {
            var assignStatement = {
                type: "assign",
                variable: currStatement[0],
                value: convertToData(currStatement.slice(2)),
            };
            insns['statements'].push(assignStatement);
        }
    }
    if (currStatement.length >= 1) {
        if (currStatement[0] === "PRINT") {
            var printStatement = {
                type: "print",
                value: convertToData(currStatement.slice(1)),
            };
            insns['statements'].push(printStatement);
        }
        else if (currStatement[0] === "CLEAR") {
            var clearStatement = {
                type: "clear",
            };
            insns['statements'].push(clearStatement);
        }
        else if (currStatement[0] === "OPEN") {
            var openTag = {
                type: "open",
                tag: currStatement[1],
            };
            insns['statements'].push(openTag);
        }
        else if (currStatement[0] === "CLOSE") {
            var closeTag = {
                type: "close",
            };
            insns['statements'].push(closeTag);
        }
        else if (currStatement[0] === "ATTRIBUTE") {
            var attributeStatement = {
                type: "attribute",
                value: convertToData(currStatement.slice(1)),
            };
            insns['statements'].push(attributeStatement);
        }
        else if (currStatement[0] === "CLOSE") {
            var closeTag = {
                type: "close",
            };
            insns['statements'].push(closeTag);
        }
        else if (currStatement[0] === "GOTO") {
            var goToLine = {
                type: "goto",
                statement: Number(currStatement[1]),
            };
            insns['statements'].push(goToLine);
        }
    }
}
console.log(insns.statements);
