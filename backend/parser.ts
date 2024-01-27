import exp = require('constants');
import { readFileSync } from 'fs';

interface LiteralString {
    type: "literalString";
    value: string;
  }
  
  interface LiteralInteger {
    type: "literalInteger";
    value: number;
  }
  
  interface LiteralBoolean {
    type: "literalBoolean";
    value: boolean;
  }
  
  interface Add {
    type: "add";
    left: Expression;
    right: Expression;
  }
  
  interface Equals {
    type: "equals";
    left: Expression;
    right: Expression;
  }
  
  interface Variable {
    type: "variable";
    variable: string;
  }
  
  interface Callback {
    type: "callback";
    line: number;
  }
  
  type Expression =
    | LiteralString
    | LiteralInteger
    | LiteralBoolean
    | Variable
    | Add
    | Equals
    | Callback;

type variable = LiteralString | LiteralInteger | LiteralBoolean
  
  interface Assign {
    type: "assign";
    lvalue: string;
    rvalue: Expression;
  }
  
  interface Print {
    type: "print";
    value: Expression | string;
  }
  
  interface Clear {
    type: "clear";
  }
  
  interface Open {
    type: "open";
    tag: string;
  }
  
  interface Close {
    type: "close";
  }
  
  interface Attribute {
    type: "attribute";
    key: string;
    value: string;
  }
  
  interface End {
    type: "end";
  }
  
  interface Goto {
    type: "goto";
    statement: number;
  }
  
  type Statement = Assign | Print | Clear | Open | Close | Attribute | End | Goto;
  
  interface Program {
    statements: Statement[];
  }

function mergeIntoOneString(expression: string[]) {
    var resultString = expression[0];
    for(var i = 1; i < expression.length; i++)
    {
        resultString = resultString.concat(" ");
        resultString = resultString.concat(expression[i]);
    }
    return resultString;
}

console.log(mergeIntoOneString(["PRINT", "hello", "world"]))

function convertToData(expression: string) {
    var expressionStr = expression;
    if(expressionStr === "true" || expressionStr === "false")
    {
        let data: LiteralBoolean = {
            type: "literalBoolean",
            value: expression[0] === "true",
        };
        return data;
    }
    else if(!isNaN(Number(expressionStr)))
    {
        let data: LiteralInteger = {
            type: "literalInteger",
            value: Number(expressionStr),
        };
        return data;
    }
    else if(expressionStr[0] == '"' && expressionStr[-1] == '"')
    {
        let data: LiteralString = {
            type: "literalString", 
            value: expressionStr,
        };
        return data;
    }
    else 
    {
        let data: Variable = {
            type: "variable",
            variable: expressionStr,
        }
    }
}

function convertToExpression(expressionStr: string)
{
    expressionStr = expressionStr.trim();
    if(expressionStr.indexOf("+") !== -1)
    {
        let addStatement: Add = {
            type: "add",
            left: convertToExpression(expressionStr.slice(0, expressionStr.indexOf("+"))),
            right: convertToExpression(expressionStr.slice(expressionStr.indexOf("+") + 1)),
        };
        return addStatement;
    }
    else if(expressionStr.indexOf("==") !== -1)
    {
        let equalStatement: Equals = {
            type: "equals",
            left: convertToExpression(expressionStr.slice(0, expressionStr.indexOf("=="))),
            right: convertToExpression(expressionStr.slice(expressionStr.indexOf("==") + 1)),
        }
        return equalStatement;
    }
    else if(expressionStr.slice(0,8) === "CALLBACK")
    {
        let callbackStatement: Callback = {
            type: "callback",
            line: Number(expressionStr.slice(8).trim()),
        }
        return callbackStatement;
    }
    else 
    {
        return convertToData(expressionStr);
    }
}

let insns: Program = {
    statements: [],
};
const readFileLines = filename =>
  readFileSync(filename).toString('utf-8').split('\r\n');

let arr = readFileLines('example-code/example1.txt');
for(let i = 0; i < arr.length; i++) {
    var currStatement = arr[i];
    currStatement = currStatement.trim();
    if(currStatement.indexOf('=') !== currStatement.indexOf("=="))
    {
    let assignStatement: Assign = {
        type: "assign",
        lvalue: currStatement.slice(0, currStatement.indexOf("=")).trim(),
        rvalue: convertToExpression(currStatement.slice(currStatement.indexOf('=') + 1)),
    };
    insns['statements'].push(assignStatement);
    }
    if(currStatement.slice(0,5) === "PRINT")
    {
        if(currStatement[1][0] !== '"')
        {
            let printStatement: Print = {
                type: "print",
                value: currStatement.slice(5),
            };
            insns['statements'].push(printStatement);
        }
        else
        {
            let printStatement: Print = {
                type: "print", 
                value: convertToData(currStatement.slice(1)),
            }
            insns['statements'].push(printStatement)    
        }
    }
    else if(currStatement.slice(0,5) === "CLEAR")
    { 
        let clearStatement: Clear = {
            type: "clear",
        };
        insns['statements'].push(clearStatement);
    }
    else if(currStatement.slice(0,4) === "OPEN")
    {
        let openTag: Open = {
            type: "open",
            tag: currStatement.slice(5).trim(),
        };
        insns['statements'].push(openTag);
    }
    else if(currStatement.slice(0,5) === "CLOSE")
    {
        let closeTag: Close = {
            type: "close",
        };
        insns['statements'].push(closeTag);
    }
    else if(currStatement.slice(9) === "ATTRIBUTE")
    {
        var keyvalue = currStatement.slice(9).trim();
        let attributeStatement: Attribute = {
            type: "attribute",
            key: keyvalue.slice(0,keyvalue.indexOf(' ')),
            value: keyvalue.slice(keyvalue.indexOf(' ')),
        };
        insns['statements'].push(attributeStatement);
    }
    else if(currStatement.slice(0,5) === "CLOSE")
    {
        let closeTag: Close = {
            type: "close",
        };
        insns['statements'].push(closeTag);
    }
    else if(currStatement.slice(0,4) === "GOTO")
    {
        let goToLine: Goto = {
            type: "goto",
            statement: Number(currStatement.slice(4).trim()),
        };
        insns['statements'].push(goToLine);
    }
    
}
console.log(insns.statements);