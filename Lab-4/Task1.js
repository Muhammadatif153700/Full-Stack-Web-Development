var fullName = "Muhammad Atif ";
var age = 22;
var isStudent = true;

var biography = {
    name: fullName,
    age: age,
    isStudent: isStudent,
    address: {
        city: "Islamabad",
        country: "Pakistan"
    },
    degreeProgram: {
        title: "BS Computer Science",
        semester: 5
    }
};

console.log("Name: " + biography.name);
console.log("Age: " + biography.age);
console.log("City: " + biography.address.city);
console.log("Country: " + biography.address.country);
console.log("Degree: " + biography.degreeProgram.title);
console.log("Semester: " + biography.degreeProgram.semester);
