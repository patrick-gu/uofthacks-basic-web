export interface LiteralString {
  type: "literalString";
  value: string;
}

export interface LiteralInteger {
  type: "literalInteger";
  value: number;
}

export interface LiteralBoolean {
  type: "literalBoolean";
  value: boolean;
}

export interface Add {
  type: "add";
  left: Expression;
  right: Expression;
}

export interface Modulo {
  type: "modulo";
  left: Expression;
  right: Expression;
}

export interface Equals {
  type: "equals";
  left: Expression;
  right: Expression;
}

export interface Greater {
  type: "greater";
  left: Expression;
  right: Expression;
}

export interface VariableExpression {
  type: "variable";
  variable: string;
}

export interface Callback {
  type: "callback";
  line: number;
}

export interface ArrayAccess {
  type: "arrayAccess";
  array: Expression;
  index: Expression;
}

export type Expression =
  | LiteralString
  | LiteralInteger
  | LiteralBoolean
  | Add
  | Modulo
  | Equals
  | Greater
  | VariableExpression
  | Callback
  | ArrayAccess;

export interface Assign {
  type: "assign";
  lvalue: Expression;
  rvalue: Expression;
}

export interface Print {
  type: "print";
  value: Expression;
}

export interface Clear {
  type: "clear";
}

export interface Open {
  type: "open";
  tag: string;
}

export interface Close {
  type: "close";
}

export interface Attribute {
  type: "attribute";
  key: string;
  value: Expression;
}

export interface End {
  type: "end";
}

export interface Goto {
  type: "goto";
  statement: number;
}

export interface GotoIf {
  type: "gotoIf";
  cond: Expression;
  statement: number;
}

export interface Dim {
  type: "dim";
  lvalue: Expression;
  length: Expression;
}

export interface Bind {
  type: "bind";
  key: string;
  // for flexibility, we will evaluate this lvalue as eagerly as possible
  // i.e., if it is an array access, we evalue array and index eagerly,
  // then perform the assignment as needed
  lvalue: Expression;
}

export type Statement =
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

export interface Program {
  statements: Statement[];
}
