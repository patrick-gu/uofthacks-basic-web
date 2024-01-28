import { Expression, Program } from "../../shared/program";

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
    const last = res.onchange;
    res.onchange = function (e) {
      for (const [key, value] of node.bindings.entries()) {
        const v: string = (e.target as any)[key];
        value({
          type: "string",
          value: v,
        });
      }
      if (last !== null) {
        (last as any)(e);
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

// import { voter } from "./programs/voter";
// import { todos } from "./programs/todos";
import prog from "../data/data.json";

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
  execute(prog as Program, ctx);
}

window.addEventListener("DOMContentLoaded", main);
