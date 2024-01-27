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

  interface ArrayAccess {
    type: "arrayAccess"; 
    array: Variable; 
    index: Variable;
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
    LiteralString
    | LiteralInteger
    | LiteralBoolean
    | ArrayAccess
    | Variable
    | Add
    | Equals
    | Callback;

  interface Assign {
    type: "assign";
    lvalue: Expression;
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
    value: Expression;
  }
  
  interface End {
    type: "end";
  }
  
  interface Goto {
    type: "goto";
    statement: number;
  }

  interface Gotoif {
    type: "gotoIf";
    cond: Expression;
    statement: number;
  }

  interface Dimension {
    type: "dim";
    lvalue: Variable;
    length: Expression;
  }

  interface Bind {
    type: "bind";
    key: string;
    lvalue: Variable;
  }
  
  type Statement = Assign | Print | Clear | Open | Close | Attribute | End | Goto | Gotoif | Dimension | Bind;
  
  interface Program {
    statements: Statement[];
  }

function convertToData(expression: string) {
    var expressionStr = expression.trim();
    if(expressionStr === "true" || expressionStr === "false")
    {
        let data: LiteralBoolean = {
            type: "literalBoolean",
            value: expression[0] === "true",
        };
        return data;
    }
    else if(!isNaN(Number(expressionStr)) && expressionStr !== "")
    {
        let data: LiteralInteger = {
            type: "literalInteger",
            value: Number(expressionStr),
        };
        return data;
    }
    else if(expressionStr[0] == '"')
    {
        let data: LiteralString = {
            type: "literalString", 
            value: expressionStr.slice(1, expressionStr.length - 1),
        };
        return data;
    }
    else if(expressionStr.indexOf('(') !== -1)
    {
        let arrAccess: ArrayAccess = {
            type: "arrayAccess", 
            array: createVariableFromString(expressionStr.slice(0, expressionStr.indexOf('(')).trim()),
            index: createVariableFromString(expressionStr.slice(expression.indexOf('('), expression.indexOf(')') - 1)),
        };
        return arrAccess
    }
    else 
    {
        let data: Variable = {
            type: "variable",
            variable: expressionStr,
        }
        return data;
    }
}

function convertToExpression(expressionStr: string)
{
    expressionStr = expressionStr.trim();
    if(expressionStr === "\"\"")
    {
        let emptyString: LiteralString = {
            type: "literalString", 
            value: "",
        };
        return emptyString
    }
    if(expressionStr.indexOf("+") !== -1)
    {
        let addStatement: Add = {
            type: "add",
            left: convertToExpression(expressionStr.slice(0, expressionStr.indexOf("+"))),
            right: convertToExpression(expressionStr.slice(expressionStr.indexOf("+") + 1)),
        };
        return addStatement;
    }
    else if(expressionStr.indexOf("=") !== -1)
    {
        let equalStatement: Equals = {
            type: "equals",
            left: convertToExpression(expressionStr.slice(0, expressionStr.indexOf("="))),
            right: convertToExpression(expressionStr.slice(expressionStr.indexOf("=") + 1)),
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

function createVariableFromString(varname: string)
{
    let varFromString: Variable = {
        type: "variable",
        variable: varname,
    };
    return varFromString;
}

function createCallback(lineno: number)
{
    let callbackStatement: Callback = {
        type: "callback",
        line: lineno,
    };
    return callbackStatement;
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
    if(currStatement.startsWith("PRINT"))
    {
        if(currStatement.indexOf('"') !== -1)
        {
            let printStatement: Print = {
                type: "print",
                value: currStatement.slice(currStatement.indexOf('"') + 1,currStatement.lastIndexOf('"')),
            };
            insns['statements'].push(printStatement);
        }
        else
        {
            let printStatement: Print = {
                type: "print", 
                value: convertToData(currStatement.slice(currStatement.indexOf(' '))),
            }
            insns['statements'].push(printStatement)    
        }
    }
    else if(currStatement.startsWith("CLEAR"))
    { 
        let clearStatement: Clear = {
            type: "clear",
        };
        insns['statements'].push(clearStatement);
    }
    else if(currStatement.startsWith("DIM"))
    {
        let dimStatement: Dimension = {
            type: "dim", 
            lvalue: createVariableFromString(currStatement.slice(3, currStatement.indexOf('(')).trim()),
            length: convertToExpression(currStatement.slice(currStatement.indexOf('(') + 1, currStatement.indexOf(')')).trim())
        };
        insns['statements'].push(dimStatement);
    }
    else if(currStatement.startsWith("OPEN"))
    {
        let openTag: Open = {
            type: "open",
            tag: currStatement.slice(5).trim(),
        };
        insns['statements'].push(openTag);
    }
    else if(currStatement.startsWith("CLOSE"))
    {
        let closeTag: Close = {
            type: "close",
        };
        insns['statements'].push(closeTag);
    }
    else if(currStatement.startsWith("ATTRIBUTE"))
    {
        if(currStatement.indexOf("GOTO") !== -1)
        {
            var keyvalue = currStatement.slice(9).trim();
            let attributeStatement: Attribute = {
                type: "attribute",
                key: keyvalue.slice(0,keyvalue.indexOf(' ')),
                value: createCallback(Number(keyvalue.slice(keyvalue.lastIndexOf(' ')))),
            };
            insns['statements'].push(attributeStatement);
        }
        else 
        {
            var keyvalue = currStatement.slice(9).trim();
            let attributeStatement: Attribute = {
                type: "attribute",
                key: keyvalue.slice(0,keyvalue.indexOf(' ')),
                value: convertToData(keyvalue.slice(keyvalue.lastIndexOf(' '))),
            };
            insns['statements'].push(attributeStatement);
        }
    }
    else if(currStatement.startsWith("CLOSE"))
    {
        let closeTag: Close = {
            type: "close",
        };
        insns['statements'].push(closeTag);
    }
    else if(currStatement.startsWith("GOTOIF"))
    {
        let goToIfLine: Gotoif = {
            type: "gotoIf",
            cond: convertToExpression(currStatement.slice(6, currStatement.lastIndexOf(' '))),
            statement: Number(currStatement.slice(currStatement.lastIndexOf(' '))),
        }
        insns['statements'].push(goToIfLine);
    }
    else if(currStatement.startsWith("GOTO"))
    {
        let goToLine: Goto = {
            type: "goto",
            statement: Number(currStatement.slice(4).trim()),
        };
        insns['statements'].push(goToLine);
    }
    else if(currStatement.startsWith("BIND"))
    {
        var keyvalue = currStatement.slice(4).trim();
        let bindStatement: Bind = {
            type: "bind", 
            key: keyvalue.slice(0, keyvalue.indexOf(' ')),
            lvalue: createVariableFromString(keyvalue.slice(keyvalue.lastIndexOf(' ') + 1)),
        };
        insns['statements'].push(bindStatement);
    }
    else if(currStatement.indexOf('=') !== -1)
    {
        let assignStatement: Assign = {
            type: "assign",
            lvalue: convertToData(currStatement.slice(0, currStatement.indexOf("=")).trim()),
            rvalue: convertToExpression(currStatement.slice(currStatement.indexOf('=') + 1)),
        };
        insns['statements'].push(assignStatement);
    }
}
// return insns['statements']