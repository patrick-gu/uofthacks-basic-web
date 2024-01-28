### Devpost: [BASIC Web](https://devpost.com/software/basic-web?ref_content=my-projects-tab&ref_feature=my_projects)

### Inspiration
Nowadays, we have been using all sorts of development tools for web development, from the simplest of HTML, to all sorts of high-level libraries, such as Bootstrap and React. However, what if we turned back time, and relived the nostalgic, good old times of programming in the 60s? A world where the programming language BASIC was prevalent. A world where coding on paper and on office memo pads were so popular. It is time, for you all to re-experience the programming of the past.

### What it does
It's a programming language compiler and runtime for the BASIC programming language. It allows users to write interactive programs for the web with the simple syntax and features of the BASIC language. Users can read our sample the BASIC code to understand what's happening, and write their own programs to deploy on the web. We're transforming code from paper to the internet.

### How we built it
The major part of the code is written in TypeScript, which includes the parser, compiler, and runtime, designed by us from scratch. After we parse and resolve the code, we generate an intermediate representation. This abstract syntax tree is parsed by the runtime library, which generates HTML code.

Using GitHub actions and GitHub Pages, we are able to implement a CI/CD pipeline to deploy the webpage, which is entirely written in BASIC! We also have GitHub Dependabot scanning for npm vulnerabilities.

We use Webpack to bundle code into one HTML file for easy deployment.

### Challenges we ran into
Creating a compiler from scratch within the 36-hour time frame was no easy feat, as most of us did not have prior experience in compiler concepts or building a compiler. Constructing and deciding on the syntactical features was quite confusing since BASIC was such a foreign language to all of us. Parsing the string took us the longest time due to the tedious procedure in processing strings and tokens, as well as understanding recursive descent parsing. Last but definitely not least, building the runtime library and constructing code samples caused us issues as minor errors can be difficult to detect.

### Accomplishments that we're proud of
We are very proud to have successfully "summoned" the nostalgic old times of programming and deployed all the syntactical features that we desired to create interactive features using just the BASIC language. We are delighted to come up with this innovative idea to fit with the theme nostalgia, and to retell the tales of programming.

### What we learned
We learned the basics of making a compiler and what is actually happening underneath the hood while compiling our code, through the painstaking process of writing compiler code and manually writing code samples as if we were the compiler.

### What's next for BASIC Web
This project can be integrated with a lot of modern features that is popular today. One of future directions can be to merge this project with generative AI, where we can feed the AI models with some of the syntactical features of the BASIC language and it will output code that is translated from the modern programming languages. Moreover, this can be a revamp of Bootstrap and React in creating interactive and eye-catching web pages.

### Built With
basic, compiler, html, javascript, node.js, typescript, webpack

### Try it out
[patrick-gu.github.io](patrick-gu.github.io)
