export const todos: Program = {
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
