import { exists, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { Callback, Expression, Program, Statement } from "../../shared/program";
import { resolve } from "path";

const readFileLines = (filename) =>
  readFileSync(filename).toString("utf-8").replace("\r", "").split("\n");

const prog: Program = {
  statements: [],
};

let lastLine = -1;
const lineMap: Map<number, number> = new Map();

type Token =
  | { type: "ident"; text: string }
  | { type: "string"; inner: string }
  | { type: "number"; value: number }
  | { type: "plus" }
  | { type: "minus" }
  | { type: "percent" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "equal" }
  | { type: "greater" };

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "01234566789";
const ws = " \r";
const singleTokens = {
  "+": "plus",
  "-": "minus",
  "%": "percent",
  "(": "lparen",
  ")": "rparen",
  "=": "equal",
  ">": "greater",
};

function parseLine(line: string): void {
  let i = 0;
  const tokens: Token[] = [];
  while (i < line.length) {
    if (letters.includes(line.charAt(i))) {
      const start = i;
      while (
        i < line.length &&
        (letters.includes(line.charAt(i)) || numbers.includes(line.charAt(i)))
      ) {
        i++;
      }
      const text = line.substring(start, i).toLowerCase();
      tokens.push({ type: "ident", text });
    } else if (numbers.includes(line.charAt(i))) {
      const start = i;
      while (i < line.length && numbers.includes(line.charAt(i))) {
        i++;
      }
      const number = parseInt(line.substring(start, i));
      tokens.push({ type: "number", value: number });
    } else if (ws.includes(line.charAt(i))) {
      i++;
    } else if (line.charAt(i) == '"') {
      const start = i;
      i++;
      let text = "";
      while (i < line.length) {
        if (line.charAt(i) === '"') {
          break;
        }
        if (line.charAt(i) === "\\") {
          i++;
          if (i == line.length) {
            throw new Error("Unclosed string");
          }
          if (line.charAt(i) === '"' || line.charAt(i) === "\\") {
            text += line.charAt(i);
            i++;
          } else if (line.charAt(i) === "n") {
            text += "\n";
            i++;
          } else {
            throw new Error("Unknown escape");
          }
        } else {
          text += line.charAt(i);
          i++;
        }
      }
      if (i == line.length) {
        throw new Error("Unclosed string");
      }
      i++;
      tokens.push({ type: "string", inner: text });
    } else if (line.charAt(i) in singleTokens) {
      tokens.push({ type: singleTokens[line.charAt(i)] });
      i++;
    } else {
      throw new Error(`Unexpected character ${line.charAt(i)}`);
    }
  }
  parse(tokens);
}

function parse(tokens: Token[]): void {
  if (tokens.length === 0) {
    return;
  }
  let i = 0;
  if (tokens[0].type == "number") {
    i++;
    let line = tokens[0].value;
    if (line <= lastLine) {
      throw new Error(`Line number must be increasing`);
    }
    lineMap.set(line, prog.statements.length);
    lastLine = line;
  }
  if (i >= tokens.length) {
    throw new Error("Expect command");
  }
  const token = tokens[i];
  if (token.type !== "ident") {
    console.log(token);
    throw new Error("Expect command");
  }
  i++;
  let stmt: Statement;
  switch (token.text) {
    case "assign": {
      const [lvalue, i1] = expr(tokens, i);
      i = i1;
      const [_, i3] = expect(tokens, i, "equal");
      i = i3;
      const [rvalue, i2] = expr(tokens, i);
      i = i2;
      stmt = {
        type: "assign",
        lvalue,
        rvalue,
      };
      break;
    }
    case "print": {
      const [value, i1] = expr(tokens, i);
      i = i1;
      stmt = {
        type: "print",
        value,
      };
      break;
    }
    case "clear": {
      stmt = {
        type: "clear",
      };
      break;
    }
    case "open": {
      const [token, i1] = expect(tokens, i, "ident");
      i = i1;
      stmt = {
        type: "open",
        tag: token.text,
      };
      break;
    }
    case "close": {
      stmt = {
        type: "close",
      };
      break;
    }
    case "attribute": {
      const [token, i1] = expect(tokens, i, "ident");
      i = i1;
      const [exp, i2] = expr(tokens, i);
      i = i2;
      stmt = {
        type: "attribute",
        key: token.text,
        value: exp,
      };
      break;
    }
    case "end": {
      stmt = {
        type: "end",
      };
      break;
    }
    case "goto": {
      const [token, i1] = expect(tokens, i, "number");
      i = i1;
      stmt = {
        type: "goto",
        statement: token.value,
      };
      break;
    }
    case "if": {
      const [cond, i1] = expr(tokens, i);
      i = i1;
      const [token, i2] = expect(tokens, i, "ident");
      i = i2;
      if (token.text !== "then") {
        throw new Error("expected then after if");
      }
      const [line, i3] = expect(tokens, i, "number");
      i = i3;
      stmt = {
        type: "gotoIf",
        cond,
        statement: line.value,
      };
      break;
    }
    case "dim": {
      const [v, i1] = expr(tokens, i);
      i = i1;
      if (v.type !== "arrayAccess") {
        throw new Error("dim must have a length");
      }
      stmt = {
        type: "dim",
        lvalue: v.array,
        length: v.index,
      };
      break;
    }
    case "bind": {
      const [key, i1] = expect(tokens, i, "ident");
      i = i1;
      const [lvalue, i2] = expr(tokens, i);
      i = i2;
      stmt = {
        type: "bind",
        key: key.text,
        lvalue,
      };
      break;
    }
    default: {
      i--;
      const [exp, i1] = expr(tokens, i);
      i = i1;
      if (exp.type === "equals") {
        stmt = {
          type: "assign",
          lvalue: exp.left,
          rvalue: exp.right,
        };
      } else {
        throw new Error(`unknown statement type ${token.text}`);
      }
    }
  }
  expectEof(tokens, i);
  prog.statements.push(stmt);
}

function expr(tokens: Token[], i: number): [Expression, number] {
  return equals(tokens, i);
}

function equals(tokens: Token[], i: number): [Expression, number] {
  let [left, i1] = add(tokens, i);
  i = i1;
  while (true) {
    const [s, i2] = eat(tokens, i, "equal");
    i = i2;
    if (s) {
      const [right, i3] = add(tokens, i);
      i = i3;
      left = {
        type: "equals",
        left,
        right,
      };
    } else {
      const [s1, i3] = eat(tokens, i, "greater");
      i = i3;
      if (!s1) break;
      const [right, i4] = add(tokens, i);
      i = i4;
      left = {
        type: "greater",
        left,
        right,
      };
    }
  }
  return [left, i];
}

function add(tokens: Token[], i: number): [Expression, number] {
  let [left, i1] = mod(tokens, i);
  i = i1;
  while (true) {
    const [s, i2] = eat(tokens, i, "plus");
    i = i2;
    if (!s) break;
    const [right, i3] = mod(tokens, i);
    i = i3;
    left = {
      type: "add",
      left,
      right,
    };
  }
  return [left, i];
}

function mod(tokens: Token[], i: number): [Expression, number] {
  let [left, i1] = arrayAccess(tokens, i);
  i = i1;
  while (true) {
    const [s, i2] = eat(tokens, i, "percent");
    i = i2;
    if (!s) break;
    const [right, i3] = arrayAccess(tokens, i);
    i = i3;
    left = {
      type: "modulo",
      left,
      right,
    };
  }
  return [left, i];
}

function arrayAccess(tokens: Token[], i: number): [Expression, number] {
  let [left, i1] = base(tokens, i);
  i = i1;
  while (true) {
    const [s, i2] = eat(tokens, i, "lparen");
    i = i2;
    if (!s) break;
    const [right, i3] = expr(tokens, i);
    i = i3;
    const [_, i4] = expect(tokens, i, "rparen");
    i = i4;
    left = {
      type: "arrayAccess",
      array: left,
      index: right,
    };
  }
  return [left, i];
}

const callbacks: Callback[] = [];

function base(tokens: Token[], i: number): [Expression, number] {
  if (i >= tokens.length) {
    throw new Error("unexpected eof for expression");
  }
  const t = tokens[i];
  i++;
  switch (t.type) {
    case "string": {
      return [{ type: "literalString", value: t.inner }, i];
    }
    case "number": {
      return [{ type: "literalInteger", value: t.value }, i];
    }
    case "lparen": {
      const [exp, i1] = expr(tokens, i);
      i = i1;
      i = expect(tokens, i, "rparen")[1];
      return [exp, i];
    }
    case "ident": {
      if (t.text === "goto") {
        const [line, i1] = expect(tokens, i, "number");
        i = i1;
        const obj: Callback = {
          type: "callback",
          line: line.value,
        };
        callbacks.push(obj);
        return [obj, i];
      }
      return [{ type: "variable", variable: t.text }, i];
    }
    default: {
      throw new Error(`unknown expression ${JSON.stringify(t)}`);
    }
  }
}

function eat(tokens: Token[], i: number, type: string): [boolean, number] {
  if (i < tokens.length && tokens[i].type === type) {
    return [true, i + 1];
  } else {
    return [false, i];
  }
}

function expect<type extends string>(
  tokens: Token[],
  i: number,
  typeVal: type
): [Token & { type: type }, number] {
  if (i >= tokens.length) {
    throw new Error(`Expected token type ${typeVal}, got eof`);
  }
  const token = tokens[i];
  if (token.type !== typeVal) {
    console.log(tokens, i, typeVal);
    throw new Error(`Expected token type ${typeVal}, got ${token.type}`);
  }
  return [token as any, i + 1];
}

function expectEof(tokens: Token[], i: number) {
  if (i != tokens.length) {
    console.log(tokens, i);
    throw new Error(`Expected EOF`);
  }
}

if (process.argv.length == 2) {
  throw new Error("give an input file");
}

const f = process.argv[2];

for (const line of readFileLines(f)) {
  parseLine(line);
}

for (const stmt of prog.statements) {
  if (stmt.type === "goto" || stmt.type === "gotoIf") {
    const realLine = lineMap.get(stmt.statement);
    if (realLine === undefined) {
      throw new Error(`not found line ${stmt.statement}`);
    }
    stmt.statement = realLine;
  }
}

for (const callback of callbacks) {
  const realLine = lineMap.get(callback.line);
  if (realLine === undefined) {
    throw new Error(`not found line ${callback.line} callback`);
  }
  callback.line = realLine;
}

const dir = resolve(__dirname, "../../../../runtime/data");
if (!existsSync(dir)) {
  mkdirSync(dir);
}
writeFileSync(
  resolve(__dirname, "../../../../runtime/data/data.json"),
  JSON.stringify(prog)
);
