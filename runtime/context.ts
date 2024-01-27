interface Context {
  variables: Map<string, Value>;
  ip: number;
  root: Root;
  currentTag: Tag | Root;
}

type Value =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "callback"; line: number }
  | { type: "array"; data: Value[] };

interface Root {
  type: "root";
  content: (Tag | RuntimeText)[];
}

interface Tag {
  type: "tag";
  tag: string;
  attributes: Map<string, Value>;
  content: (Tag | RuntimeText)[];
  parent: Tag | Root;
}

interface RuntimeText {
  type: "text";
  value: string;
}

type RuntimeNode = Root | RuntimeText | Text;
