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

interface VariableExpression {
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
  | Add
  | Equals
  | VariableExpression
  | Callback;

interface Assign {
  type: "assign";
  variable: string;
  value: Expression;
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

type Statement = Assign | Print | Clear | Open | Close | Attribute | End | Goto;

interface Program {
  statements: Statement[];
}
