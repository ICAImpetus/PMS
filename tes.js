// 1. Function Hoisting (Pura function hoisting hota hai)
sayHello(); // Output: "Hello World!" (Call pehle kiya, define baad me, phir bhi chal gaya)

function sayHello() {
    console.log("Hello World!");
}

// 2. 'var' Hoisting (Var initialisation hoisted nahi hoti, undefined milti hai)
console.log(myVar); // Output: undefined
var myVar = 10;

// 3. 'let' / 'const' (Temporal Dead Zone me rehte hain, error aata hai)
console.log(myLet); // ReferenceError: Cannot access 'myLet' before initialization
let myLet = 20;