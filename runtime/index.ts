function execute(prog: Program, ctx: Context) {
  while (ctx.ip < prog.statements.length) {
    const stmt = prog.statements[ctx.ip];
    let newIp = ctx.ip + 1;
    switch (stmt.type) {
      case "assign": {
        const lvalue = resolveLvalue(ctx, stmt.lvalue);
        const rvalue = evaluate(ctx, stmt.rvalue);
        lvalue(clone(rvalue));
        break;
      }
      case "attribute": {
        const tag = ctx.currentTag;
        if (tag.type === "root") {
          throw new Error("Can only add attributes when inside a tag.");
        }
        tag.attributes.set(stmt.key, evaluate(ctx, stmt.value));
        break;
      }
      case "open": {
        const tag: Tag = {
          type: "tag",
          tag: stmt.tag,
          parent: ctx.currentTag,
          attributes: new Map(),
          bindings: new Map(),
          content: [],
        };
        ctx.currentTag.content.push(tag);
        ctx.currentTag = tag;
        break;
      }
      case "close": {
        if (ctx.currentTag.type === "root") {
          throw new Error("No tag to close.");
        }
        ctx.currentTag = ctx.currentTag.parent;
        break;
      }
      case "end": {
        render(prog, ctx, ctx.root);
      }
      case "clear": {
        ctx.root = {
          type: "root",
          content: [],
        };
        ctx.currentTag = ctx.root;
        break;
      }
      case "goto": {
        newIp = stmt.statement;
        break;
      }
      case "print": {
        const value = evaluate(ctx, stmt.value);
        const text = toString(value);
        ctx.currentTag.content.push({
          type: "text",
          value: text,
        });
        break;
      }
      case "gotoIf": {
        const cond = evaluate(ctx, stmt.cond);
        if (cond.type === "boolean") {
          if (cond.value) {
            newIp = stmt.statement;
          }
        } else {
          throw new Error(`Cannot write condition of type ${stmt.type}.`);
        }
        break;
      }
      case "dim": {
        const lvalue = resolveLvalue(ctx, stmt.lvalue);
        const length = evaluate(ctx, stmt.length);
        if (length.type !== "number") {
          throw new Error("Array length must be a number.");
        }
        const arr: Value[] = Array(length.value).map(() => ({
          type: "number",
          value: 0,
        }));
        const value: Value = {
          type: "array",
          data: arr,
        };
        lvalue(value);
        break;
      }
      case "bind": {
        const lvalue = resolveLvalue(ctx, stmt.lvalue);
        const tag = ctx.currentTag;
        if (tag.type === "root") {
          throw new Error("Can only add bindings when inside a tag.");
        }
        tag.bindings.set(stmt.key, lvalue);
        break;
      }
      default: {
        const _exhaustive: never = stmt;
      }
    }
    ctx.ip = newIp;
  }
}

function resolveLvalue(ctx: Context, expr: Expression): (value: Value) => void {
  if (expr.type === "variable") {
    return (value) => {
      ctx.variables.set(expr.variable, value);
    };
  } else if (expr.type === "arrayAccess") {
    const [array, index] = arrayIndex(ctx, expr.array, expr.index);

    return (value) => {
      array[index] = value;
    };
  } else {
    throw new Error(`Cannot assign to expression.`);
  }
}

function evaluate(ctx: Context, expr: Expression): Value {
  switch (expr.type) {
    case "add": {
      const left = evaluate(ctx, expr.left);
      const right = evaluate(ctx, expr.right);
      if (left.type === "number" && right.type === "number") {
        return {
          type: "number",
          value: left.value + right.value,
        };
      }
      throw new Error(
        `Cannot add variables of type ${left.type} and ${right.type}`,
      );
    }
    case "callback": {
      return {
        type: "callback",
        line: expr.line,
      };
    }
    case "greater": {
      const left = evaluate(ctx, expr.left);
      const right = evaluate(ctx, expr.right);
      if (left.type !== "number" || right.type !== "number") {
        throw new Error(
          `Can only compare numbers. Found ${left.type} > ${right.type}.`,
        );
      }
      const value = left.value > right.value;
      return {
        type: "boolean",
        value,
      };
    }
    case "equals": {
      const left = evaluate(ctx, expr.left);
      const right = evaluate(ctx, expr.right);
      return {
        type: "boolean",
        value: equals(left, right),
      };
    }
    case "literalBoolean": {
      return {
        type: "boolean",
        value: expr.value,
      };
    }
    case "literalInteger": {
      return {
        type: "number",
        value: expr.value,
      };
    }
    case "literalString": {
      return {
        type: "string",
        value: expr.value,
      };
    }
    case "variable": {
      const value = ctx.variables.get(expr.variable);
      if (value === undefined) {
        throw new Error(`Undefined variable ${expr.variable}`);
      }
      return value;
    }
    case "modulo": {
      const left = evaluate(ctx, expr.left);
      const right = evaluate(ctx, expr.right);
      if (left.type === "number" && right.type === "number") {
        if (right.value === 0) {
          throw new Error("Modulo by zero");
        }
        return {
          type: "number",
          value: left.value % right.value,
        };
      }
      throw new Error(
        `Cannot modulo variables of type ${left.type} and ${right.type}`,
      );
    }
    case "arrayAccess": {
      const [array, index] = arrayIndex(ctx, expr.array, expr.index);
      return array[index];
    }
  }
}

function arrayIndex(
  ctx: Context,
  arrayExpr: Expression,
  indexExpr: Expression,
): [Value[], number] {
  const array = evaluate(ctx, arrayExpr);
  const index = evaluate(ctx, indexExpr);
  if (array.type !== "array") {
    throw new Error(`Cannot index non-array of type ${array.type}.`);
  }
  if (index.type !== "number") {
    throw new Error(`Cannot index array with non-number type ${index.type}`);
  }
  if (
    !Number.isInteger(index.value) ||
    !(0 <= index.value) ||
    !(index.value < array.data.length)
  ) {
    throw new Error(`Index out of bounds: ${index.value}`);
  }
  return [array.data, index.value];
}

function equals(left: Value, right: Value): boolean {
  if (left.type !== right.type) {
    return false;
  }
  switch (left.type) {
    case "boolean":
    case "string":
    case "number": {
      return (
        left.value === (right as { value: boolean | string | number }).value
      );
    }
    case "callback": {
      return left.line === (right as { line: number }).line;
    }
    case "array": {
      const lData = left.data;
      const rData = (right as { data: Value[] }).data;
      if (lData.length !== rData.length) {
        return false;
      }
      for (let i = 0; i < lData.length; i++) {
        if (!equals(lData[i], rData[i])) {
          return false;
        }
      }
      return true;
    }
  }
}

function toString(value: Value): string {
  switch (value.type) {
    case "callback":
      return "GOTO" + value.line;
    case "number":
      return value.value.toString();
    case "string":
      return value.value;
    case "boolean": {
      if (value.value) {
        return "TRUE";
      } else {
        return "FALSE";
      }
    }
    case "array": {
      return "(" + value.data.map(toString).join(",") + ")";
    }
  }
}

function clone(value: Value): Value {
  switch (value.type) {
    case "boolean":
    case "number":
    case "string":
    case "callback": {
      return value;
    }
    case "array": {
      return {
        type: "array",
        data: value.data.map(clone),
      };
    }
  }
}

function render(prog: Program, ctx: Context, root: Root) {
  const body = getBody();
  body.replaceChildren(...root.content.map((n) => renderNode(prog, ctx, n)));
}

function renderNode(
  prog: Program,
  ctx: Context,
  node: Tag | RuntimeText,
): Node | string {
  if (node.type === "tag") {
    const res = document.createElement(node.tag);
    for (const [key, value] of node.attributes.entries()) {
      switch (value.type) {
        case "string":
          res.setAttribute(key, value.value);
          break;
        case "number":
        case "boolean":
          res.setAttribute(key, value.value.toString());
          break;
        case "callback":
          (res as any)[key] = () => {
            ctx.ip = value.line;
            execute(prog, ctx);
          };
      }
    }
    res.onchange = (e) => {
      for (const [key, value] of node.bindings.entries()) {
        const v: string = (e.target as any)[key];
        value({
          type: "string",
          value: v,
        });
      }
    };
    res.replaceChildren(...node.content.map((n) => renderNode(prog, ctx, n)));
    return res;
  } else {
    return node.value;
  }
}

function getBody(): HTMLBodyElement {
  const body = document.getElementsByTagName("body")[0];
  return body;
}

const buttonClick: Program = {
  statements: [
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "N",
      },
      rvalue: {
        type: "literalInteger",
        value: 0,
      },
    },
    {
      type: "goto",
      statement: 3,
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "N",
      },
      rvalue: {
        type: "add",
        left: {
          type: "variable",
          variable: "N",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "clear",
    },
    {
      type: "open",
      tag: "p",
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "The button has been clicked ",
      },
    },
    {
      type: "print",
      value: {
        type: "variable",
        variable: "N",
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: " times!\n",
      },
    },
    {
      type: "close",
    },
    {
      type: "open",
      tag: "button",
    },
    {
      type: "attribute",
      key: "onclick",
      value: {
        type: "callback",
        line: 2,
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "Click me!",
      },
    },
    {
      type: "close",
    },
    {
      type: "end",
    },
  ],
};

const fizzBuzz: Program = {
  statements: [
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "N",
      },
      rvalue: {
        type: "literalInteger",
        value: 1,
      },
    },
    {
      type: "gotoIf",
      cond: {
        type: "equals",
        left: {
          type: "variable",
          variable: "N",
        },
        right: {
          type: "literalInteger",
          value: 100,
        },
      },
      statement: 19,
    },
    {
      type: "open",
      tag: "p",
    },
    {
      type: "gotoIf",
      cond: {
        type: "equals",
        left: {
          type: "modulo",
          left: {
            type: "variable",
            variable: "N",
          },
          right: {
            type: "literalInteger",
            value: 15,
          },
        },
        right: {
          type: "literalInteger",
          value: 0,
        },
      },
      statement: 8,
    },
    {
      type: "gotoIf",
      cond: {
        type: "equals",
        left: {
          type: "modulo",
          left: {
            type: "variable",
            variable: "N",
          },
          right: {
            type: "literalInteger",
            value: 3,
          },
        },
        right: {
          type: "literalInteger",
          value: 0,
        },
      },
      statement: 11,
    },
    {
      type: "gotoIf",
      cond: {
        type: "equals",
        left: {
          type: "modulo",
          left: {
            type: "variable",
            variable: "N",
          },
          right: {
            type: "literalInteger",
            value: 5,
          },
        },
        right: {
          type: "literalInteger",
          value: 0,
        },
      },
      statement: 14,
    },
    {
      type: "print",
      value: {
        type: "variable",
        variable: "N",
      },
    },
    {
      type: "goto",
      statement: 16,
    },
    {
      type: "attribute",
      key: "style",
      value: {
        type: "literalString",
        value: "color: purple",
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "fizzbuzz",
      },
    },
    {
      type: "goto",
      statement: 16,
    },
    {
      type: "attribute",
      key: "style",
      value: {
        type: "literalString",
        value: "color: red",
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "fizz",
      },
    },
    {
      type: "goto",
      statement: 16,
    },
    {
      type: "attribute",
      key: "style",
      value: {
        type: "literalString",
        value: "color: blue",
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "buzz",
      },
    },
    {
      type: "close",
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "N",
      },
      rvalue: {
        type: "add",
        left: {
          type: "variable",
          variable: "N",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "goto",
      statement: 1,
    },
    {
      type: "end",
    },
  ],
};

const voter: Program = {
  statements: [
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "left",
      },
      rvalue: {
        type: "literalInteger",
        value: 0,
      },
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "right",
      },
      rvalue: {
        type: "literalInteger",
        value: 0,
      },
    },
    {
      type: "goto",
      statement: 13,
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "left",
      },
      rvalue: {
        type: "add",
        left: {
          type: "variable",
          variable: "left",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "goto",
      statement: 13,
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "right",
      },
      rvalue: {
        type: "add",
        left: {
          type: "variable",
          variable: "right",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "goto",
      statement: 13,
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "result",
      },
      rvalue: {
        type: "literalString",
        value: "Tie",
      },
    },
    {
      type: "goto",
      statement: 16,
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "result",
      },
      rvalue: {
        type: "literalString",
        value: "Left",
      },
    },
    {
      type: "goto",
      statement: 16,
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "result",
      },
      rvalue: {
        type: "literalString",
        value: "Right",
      },
    },
    {
      type: "goto",
      statement: 16,
    },

    //13
    {
      type: "gotoIf",
      cond: {
        type: "equals",
        left: {
          type: "variable",
          variable: "left",
        },
        right: {
          type: "variable",
          variable: "right",
        },
      },
      statement: 7,
    },
    //If left greater than right
    {
      type: "gotoIf",
      cond: {
        type: "greater",
        left: {
          type: "variable",
          variable: "left",
        },
        right: {
          type: "variable",
          variable: "right",
        },
      },
      statement: 9,
    },
    //If right greater than left
    {
      type: "gotoIf",
      cond: {
        type: "greater",
        left: {
          type: "variable",
          variable: "right",
        },
        right: {
          type: "variable",
          variable: "left",
        },
      },
      statement: 11,
    },

    //Actual program
    {
      type: "open",
      tag: "p",
    },
    {
      type: "print",
      value: {
        type: "variable",
        variable: "left",
      },
    },
    {
      type: "open",
      tag: "button",
    },
    {
      type: "attribute",
      key: "onclick",
      value: {
        type: "callback",
        line: 3,
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "Vote left",
      },
    },
    {
      type: "close",
    },
    {
      type: "open",
      tag: "button",
    },
    {
      type: "attribute",
      key: "onclick",
      value: {
        type: "callback",
        line: 5,
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "Vote right",
      },
    },
    {
      type: "close",
    },
    {
      type: "print",
      value: {
        type: "variable",
        variable: "right",
      },
    },
    {
      type: "close",
    },
    {
      type: "open",
      tag: "p",
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "Winner: ",
      },
    },
    {
      type: "print",
      value: {
        type: "variable",
        variable: "result",
      },
    },
    {
      type: "close",
    },
    {
      type: "end",
    },
  ],
};

const todos: Program = {
  statements: [
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "len",
      },
      rvalue: {
        type: "literalInteger",
        value: 0,
      },
    },
    {
      type: "dim",
      lvalue: {
        type: "variable",
        variable: "todos",
      },
      length: {
        type: "literalInteger",
        value: 0,
      },
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "next",
      },
      rvalue: {
        type: "literalString",
        value: "",
      },
    },
    {
      type: "goto",
      statement: 13,
    },
    {
      type: "dim",
      lvalue: {
        type: "variable",
        variable: "cpy",
      },
      length: {
        type: "add",
        left: {
          type: "variable",
          variable: "len",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "i",
      },
      rvalue: {
        type: "literalInteger",
        value: 0,
      },
    },
    {
      type: "gotoIf",
      cond: {
        type: "equals",
        left: {
          type: "variable",
          variable: "i",
        },
        right: {
          type: "variable",
          variable: "len",
        },
      },
      statement: 10,
    },
    {
      type: "assign",
      lvalue: {
        type: "arrayAccess",
        array: {
          type: "variable",
          variable: "cpy",
        },
        index: {
          type: "variable",
          variable: "i",
        },
      },
      rvalue: {
        type: "arrayAccess",
        array: {
          type: "variable",
          variable: "todos",
        },
        index: {
          type: "variable",
          variable: "i",
        },
      },
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "i",
      },
      rvalue: {
        type: "add",
        left: {
          type: "variable",
          variable: "i",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "goto",
      statement: 6,
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "todos",
      },
      rvalue: {
        type: "variable",
        variable: "cpy",
      },
    },
    {
      type: "assign",
      lvalue: {
        type: "arrayAccess",
        array: {
          type: "variable",
          variable: "todos",
        },
        index: {
          type: "variable",
          variable: "len",
        },
      },
      rvalue: {
        type: "variable",
        variable: "next",
      },
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "len",
      },
      rvalue: {
        type: "add",
        left: {
          type: "variable",
          variable: "len",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "i",
      },
      rvalue: {
        type: "literalInteger",
        value: 0,
      },
    },
    {
      type: "gotoIf",
      cond: {
        type: "equals",
        left: {
          type: "variable",
          variable: "i",
        },
        right: {
          type: "variable",
          variable: "len",
        },
      },
      statement: 23,
    },
    {
      type: "open",
      tag: "p",
    },
    {
      type: "open",
      tag: "input",
    },
    {
      type: "attribute",
      key: "type",
      value: {
        type: "literalString",
        value: "checkbox",
      },
    },
    {
      type: "close",
    },
    {
      type: "print",
      value: {
        type: "arrayAccess",
        array: {
          type: "variable",
          variable: "todos",
        },
        index: {
          type: "variable",
          variable: "i",
        },
      },
    },
    {
      type: "close",
    },
    {
      type: "assign",
      lvalue: {
        type: "variable",
        variable: "i",
      },
      rvalue: {
        type: "add",
        left: {
          type: "variable",
          variable: "i",
        },
        right: {
          type: "literalInteger",
          value: 1,
        },
      },
    },
    {
      type: "goto",
      statement: 14,
    },
    {
      type: "open",
      tag: "input",
    },
    {
      type: "bind",
      key: "value",
      lvalue: {
        type: "variable",
        variable: "next",
      },
    },
    {
      type: "close",
    },
    {
      type: "open",
      tag: "button",
    },
    {
      type: "attribute",
      key: "onclick",
      value: {
        type: "callback",
        line: 4,
      },
    },
    {
      type: "print",
      value: {
        type: "literalString",
        value: "Add",
      },
    },
    {
      type: "close",
    },
    { type: "end" },
  ],
};

function main() {
  const root: Root = {
    type: "root",
    content: [],
  };
  const ctx: Context = {
    variables: new Map(),
    ip: 0,
    root,
    currentTag: root,
  };
  execute(voter, ctx);
}

main();
