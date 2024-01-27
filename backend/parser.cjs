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
function convertToData(expression) {
    var expressionStr = expression.trim();
    if (expressionStr === "true" || expressionStr === "false") {
        var data = {
            type: "literalBoolean",
            value: expression[0] === "true",
        };
        return data;
    }
    else if (!isNaN(Number(expressionStr)) && expressionStr !== "") {
        var data = {
            type: "literalInteger",
            value: Number(expressionStr),
        };
        return data;
    }
    else if (expressionStr[0] == '"' && expressionStr[-1] == '"') {
        var data = {
            type: "literalString",
            value: expressionStr.slice(1, expressionStr.length - 1),
        };
        return data;
    }
    else {
        var data = {
            type: "variable",
            variable: expressionStr,
        };
        return data;
    }
}
console.log(convertToData("len"));
function convertToExpression(expressionStr) {
    expressionStr = expressionStr.trim();
    if (expressionStr.indexOf("+") !== -1) {
        console.log(expressionStr.slice(0, expressionStr.indexOf("+")));
        console.log(expressionStr.slice(expressionStr.indexOf("+") + 1));
        var addStatement = {
            type: "add",
            left: convertToExpression(expressionStr.slice(0, expressionStr.indexOf("+"))),
            right: convertToExpression(expressionStr.slice(expressionStr.indexOf("+") + 1)),
        };
        return addStatement;
    }
    else if (expressionStr.indexOf("=") !== -1) {
        var equalStatement = {
            type: "equals",
            left: convertToExpression(expressionStr.slice(0, expressionStr.indexOf("="))),
            right: convertToExpression(expressionStr.slice(expressionStr.indexOf("=") + 1)),
        };
        return equalStatement;
    }
    else if (expressionStr.slice(0, 8) === "CALLBACK") {
        var callbackStatement = {
            type: "callback",
            line: Number(expressionStr.slice(8).trim()),
        };
        return callbackStatement;
    }
    else {
        return convertToData(expressionStr);
    }
}
function createVariableFromString(varname) {
    var varFromString = {
        type: "variable",
        variable: varname,
    };
    return varFromString;
}
var insns = {
    statements: [],
};
var readFileLines = function (filename) {
    return (0, fs_1.readFileSync)(filename).toString('utf-8').split('\r\n');
};
var arr = readFileLines('example-code/example1.txt');
for (var i = 0; i < arr.length; i++) {
    var currStatement = arr[i];
    currStatement = currStatement.trim();
    if (currStatement.startsWith("PRINT")) {
        if (currStatement[1][0] !== '"') {
            var printStatement = {
                type: "print",
                value: currStatement.slice(5),
            };
            insns['statements'].push(printStatement);
        }
        else {
            var printStatement = {
                type: "print",
                value: convertToData(currStatement.slice(1)),
            };
            insns['statements'].push(printStatement);
        }
    }
    else if (currStatement.startsWith("CLEAR")) {
        var clearStatement = {
            type: "clear",
        };
        insns['statements'].push(clearStatement);
    }
    else if (currStatement.startsWith("DIM")) {
        console.log(currStatement.slice(currStatement.indexOf('(') + 1, currStatement.indexOf(')')));
        var dimStatement = {
            type: "dim",
            lvalue: createVariableFromString(currStatement.slice(3, currStatement.indexOf('(')).trim()),
            length: convertToExpression(currStatement.slice(currStatement.indexOf('(') + 1, currStatement.indexOf(')')).trim())
        };
        insns['statements'].push(dimStatement);
    }
    else if (currStatement.startsWith("OPEN")) {
        var openTag = {
            type: "open",
            tag: currStatement.slice(5).trim(),
        };
        insns['statements'].push(openTag);
    }
    else if (currStatement.startsWith("CLOSE")) {
        var closeTag = {
            type: "close",
        };
        insns['statements'].push(closeTag);
    }
    else if (currStatement.startsWith("ATTRIBUTE")) {
        var keyvalue = currStatement.slice(9).trim();
        var attributeStatement = {
            type: "attribute",
            key: keyvalue.slice(0, keyvalue.indexOf(' ')),
            value: keyvalue.slice(keyvalue.indexOf(' ')),
        };
        insns['statements'].push(attributeStatement);
    }
    else if (currStatement.startsWith("CLOSE")) {
        var closeTag = {
            type: "close",
        };
        insns['statements'].push(closeTag);
    }
    else if (currStatement.startsWith("GOTOIF")) {
        var goToIfLine = {
            type: "gotoIf",
            cond: convertToExpression(currStatement.slice(4, currStatement.lastIndexOf(' '))),
            statement: Number(currStatement.slice(currStatement.lastIndexOf(' '))),
        };
        insns['statements'].push(goToIfLine);
    }
    else if (currStatement.startsWith("GOTO")) {
        var goToLine = {
            type: "goto",
            statement: Number(currStatement.slice(4).trim()),
        };
        insns['statements'].push(goToLine);
    }
    else if (currStatement.indexOf('=') !== -1) {
        var assignStatement = {
            type: "assign",
            lvalue: currStatement.slice(0, currStatement.indexOf("=")).trim(),
            rvalue: convertToExpression(currStatement.slice(currStatement.indexOf('=') + 1)),
        };
        insns['statements'].push(assignStatement);
    }
}
console.log(insns.statements);
