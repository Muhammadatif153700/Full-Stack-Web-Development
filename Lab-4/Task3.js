function createPhoneNumber(numbers) {
    var str = numbers.join("");
    var part1 = str.substring(0, 3);
    var part2 = str.substring(3, 6);
    var part3 = str.substring(6, 11);

    return "(" + part1 + ") " + part2 + "-" + part3;
}

console.log(createPhoneNumber([0, 3, 1, 6, 1, 5, 1, 5, 6, 0, 7]));
