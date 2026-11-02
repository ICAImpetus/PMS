
function testFunction() {
    console.log('This is a test function');
    let count = 0;

    return {
        increment: () => count++,
        getCount: () => count

    };

}

const increment = testFunction();

// console.log("increment", increment.increment()); // Output: 0
// console.log("increment", increment.increment()); // Output: 1
// console.log("increment", increment.increment()); // Output: 2
// console.log("increment", increment.increment()); // Output: 3
// console.log("increment", increment.increment()); // Output: 4
// console.log("getCount", increment.getCount()); // Output: 5 
// console.log(increment());


function debounce(func, delay) {

    let timer = null;

    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {

            console.log("this ", this);

            func(...args);

        }, delay)
    }


}

function search(value) {
    console.log("Searching:", value);
}


const debouncedsearch = debounce(search, 300);

debouncedsearch("H");
debouncedsearch("He");
debouncedsearch("Hell");
debouncedsearch("Hello");


const user = {
    name: "Vishal",

    greet: function () {
        console.log(this.name);
    }
};

const func = user.greet;

// // Normal call
// func();

// Using call
func.call(user);

