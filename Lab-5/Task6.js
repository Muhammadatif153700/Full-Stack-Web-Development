'use strict';


const students = [{ id: 101, name: 'Atif', completedCourses: ['CS301'] }];
const courses = [{ code: 'CS401', prerequisite: 'CS301', seats: 2, registeredIds: [] }];

function loadStudent(studentId, callback) {
  setTimeout(() => {
    const student = students.find(item => item.id === studentId);
    if (!student) return callback(new Error('Student does not exist'));
    callback(null, student);
  }, 100);
}

function checkPrerequisites(student, course, callback) {
  setTimeout(() => {
    if (!student.completedCourses.includes(course.prerequisite)) {
      return callback(new Error('Prerequisite not completed'));
    }
    callback(null, { student, course });
  }, 100);
}

function checkAvailableSeats(data, callback) {
  setTimeout(() => {
    if (data.course.seats <= 0) return callback(new Error('Course is full'));
    if (data.course.registeredIds.includes(data.student.id)) {
      return callback(new Error('Student already registered'));
    }
    callback(null, data);
  }, 100);
}

function registerCourse(data, callback) {
  setTimeout(() => {

    data.course.seats -= 1;
    data.course.registeredIds.push(data.student.id);
    callback(null, { studentId: data.student.id, course: data.course.code, status: 'REGISTERED' });
  }, 100);
}

function registerStudent(studentId, courseCode, finalCallback) {
  const course = courses.find(item => item.code === courseCode);
  if (!course) return setTimeout(() => finalCallback(new Error('Course does not exist')), 0);

  loadStudent(studentId, (error, student) => {
    if (error) return finalCallback(error);
    checkPrerequisites(student, course, (error, data) => {
      if (error) return finalCallback(error);
      checkAvailableSeats(data, (error, checkedData) => {
        if (error) return finalCallback(error);
        registerCourse(checkedData, (error, confirmation) => {
          if (error) return finalCallback(error);
          finalCallback(null, confirmation);
        });
      });
    });
  });
}

registerStudent(101, 'CS401', (error, confirmation) => {
  if (error) console.error('Registration failed:', error.message);
  else console.log('Registration successful:', confirmation);
});

