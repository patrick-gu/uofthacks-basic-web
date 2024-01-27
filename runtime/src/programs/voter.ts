export const voter: Program = {
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
