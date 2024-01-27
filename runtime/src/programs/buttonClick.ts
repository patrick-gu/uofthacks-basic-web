export const buttonClick: Program = {
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
