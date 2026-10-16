'use strict';

class Person {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  introduce() {
    return `Hi, I am ${this.name}. Email: ${this.email}.`;
  }
}

class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email);
    this.rollNo = rollNo;
    this.marks = marks;
  }

  introduce() {
    return `${super.introduce()} Roll number: ${this.rollNo}.`;
  }

  getResult() {
    return this.marks >= 50 ? 'PASS' : 'FAIL';
  }
}

class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    this.employeeId = employeeId;
    this.department = department;
  }

  introduce() {
    return `${super.introduce()} I teach in ${this.department}; employee ID: ${this.employeeId}.`;
  }
}

const student1 = new Student(
  'Atif',
  'Atif@student.au.edu.pk',
  241929,
  85
);

const student2 = new Student(
  'Haniya',
  'Haniya@student.au.edu.pk',
  24863,
  78
);

const faculty1 = new FacultyMember(
  'Obaid',
  'obaid@faculty.au.edu.pk',
  'F-12',
  'Computer Science'
);

const users = [student1, faculty1, student2];

console.log('- User Introductions -');

users.forEach(user => {
  console.log(user.introduce());
});

console.log('\n--- Student Results ---');
console.log(`${student1.name}: ${student1.getResult()}`);
console.log(`${student2.name}: ${student2.getResult()}`);

console.log('\n--- instanceof Checks ---');
console.log('student1 instanceof Student:', student1 instanceof Student);
console.log('student1 instanceof Person:', student1 instanceof Person);
console.log('faculty1 instanceof FacultyMember:', faculty1 instanceof FacultyMember);
console.log('faculty1 instanceof Person:', faculty1 instanceof Person);

const guest = {
  name: 'Dr. Ahmed',
  email: 'ahmed@example.com'
};

console.log('\n- Using call() -');
console.log(Person.prototype.introduce.call(guest));

console.log('\n-Detached Method -');

const fn = student1.introduce;

try {
  console.log(fn());
} catch (error) {
  console.log(
    'Detached method error:',
    error.name,
    '- this is not automatically the student object.'
  );
}

console.log('\n- Using bind() -');

const safelyBound = student1.introduce.bind(student1);
console.log(safelyBound());
