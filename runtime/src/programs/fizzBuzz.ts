export const fizzBuzz: Program = {
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
