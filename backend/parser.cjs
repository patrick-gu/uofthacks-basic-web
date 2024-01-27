"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
function convertToData(expression) {
    var expressionStr = expression.trim();
    console.log(expressionStr);
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
    else if (expressionStr[0] == '"') {
        var data = {
            type: "literalString",
            value: expressionStr.slice(1, expressionStr.length - 1),
        };
        return data;
    }
    else if (expressionStr.indexOf('(') !== -1) {
        console.log(expressionStr.slice(expression.indexOf('(') + 1, expression.indexOf(')')));
        var arrAccess = {
            type: "arrayAccess",
            array: createVariableFromString(expressionStr.slice(0, expressionStr.indexOf('(')).trim()),
            index: createVariableFromString(expressionStr.slice(expression.indexOf('('), expression.indexOf(')') - 1)),
        };
        return arrAccess;
    }
    else {
        var data = {
            type: "variable",
            variable: expressionStr,
        };
        return data;
    }
}
function convertToExpression(expressionStr) {
    expressionStr = expressionStr.trim();
    if (expressionStr === "\"\"") {
        var emptyString = {
            type: "literalString",
            value: "",
        };
        return emptyString;
    }
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
function createCallback(lineno) {
    var callbackStatement = {
        type: "callback",
        line: lineno,
    };
    return callbackStatement;
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
        if (currStatement.indexOf('"') !== -1) {
            var printStatement = {
                type: "print",
                value: currStatement.slice(currStatement.indexOf('"') + 1, currStatement.lastIndexOf('"')),
            };
            insns['statements'].push(printStatement);
        }
        else {
            var printStatement = {
                type: "print",
                value: convertToData(currStatement.slice(currStatement.indexOf(' '))),
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
            value: createCallback(Number(keyvalue.slice(keyvalue.lastIndexOf(' ')))),
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
            cond: convertToExpression(currStatement.slice(6, currStatement.lastIndexOf(' '))),
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
    else if (currStatement.startsWith("BIND")) {
        var keyvalue = currStatement.slice(4).trim();
        var bindStatement = {
            type: "bind",
            key: keyvalue.slice(0, keyvalue.indexOf(' ')),
            lvalue: createVariableFromString(keyvalue.slice(keyvalue.lastIndexOf(' ') + 1)),
        };
        insns['statements'].push(bindStatement);
    }
    else if (currStatement.indexOf('=') !== -1) {
        var assignStatement = {
            type: "assign",
            lvalue: convertToData(currStatement.slice(0, currStatement.indexOf("=")).trim()),
            rvalue: convertToExpression(currStatement.slice(currStatement.indexOf('=') + 1)),
        };
        insns['statements'].push(assignStatement);
    }
}
console.log(JSON.stringify(insns.statements, undefined, 2));
