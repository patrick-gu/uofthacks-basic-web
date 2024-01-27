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

interface Modulo {
  type: "modulo";
  left: Expression;
  right: Expression;
}

interface Equals {
  type: "equals";
  left: Expression;
  right: Expression;
}

interface VariableExpression {
  type: "variable";
  variable: string;
}

interface Callback {
  type: "callback";
  line: number;
}

interface ArrayAccess {
  type: "arrayAccess";
  array: Expression;
  index: Expression;
}

type Expression =
  | LiteralString
  | LiteralInteger
  | LiteralBoolean
  | Add
  | Modulo
  | Equals
  | VariableExpression
  | Callback
  | ArrayAccess;

interface Assign {
  type: "assign";
  lvalue: Expression;
  rvalue: Expression;
}

interface Print {
  type: "print";
  value: Expression;
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

interface GotoIf {
  type: "gotoIf";
  cond: Expression;
  statement: number;
}

interface Dim {
  type: "dim";
  lvalue: Expression;
  length: Expression;
}

interface Bind {
  type: "bind";
  key: string;
  // for flexibility, we will evaluate this lvalue as eagerly as possible
  // i.e., if it is an array access, we evalue array and index eagerly,
  // then perform the assignment as needed
  lvalue: Expression;
}

type Statement =
  | Assign
  | Print
  | Clear
  | Open
  | Close
  | Attribute
  | End
  | Goto
  | GotoIf
  | Dim
  | Bind;

interface Program {
  statements: Statement[];
}
