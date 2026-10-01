function isPrime(num) {
    if (num < 2) 
        return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) 
            return false;
    }
    return true;
}

function getNextPrime(givenPrime) {
    let next = givenPrime + 1;
    while (!isPrime(next)) {
        next++;
    }
    return next;
}

let givenPrime = 11;
console.log("Next prime after " + givenPrime + " is: " + getNextPrime(givenPrime));
