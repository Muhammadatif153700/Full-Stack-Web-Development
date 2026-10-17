'use strict';


const student = { id: 101, name: 'Ali', completedCourses: ['CS301'] };
const course = { code: 'CS401', prerequisite: 'CS301', seats: 2, registeredIds: [] };

function getStudent(id) {
  return new Promise((resolve, reject) => setTimeout(() => id === student.id ? resolve(student) : reject(new Error('Student not found')), 80));
}
function getCourse(code) {
  return new Promise((resolve, reject) => setTimeout(() => code === course.code ? resolve(course) : reject(new Error('Course not found')), 80));
}
function checkPrerequisites(s, c) {
  return new Promise((resolve, reject) => setTimeout(() => s.completedCourses.includes(c.prerequisite) ? resolve({ student: s, course: c }) : reject(new Error('Prerequisite not completed')), 80));
}
function checkSeats(data) {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (data.course.seats <= 0) return reject(new Error('Course is full'));
    if (data.course.registeredIds.includes(data.student.id)) return reject(new Error('Already registered'));
    resolve(data);
  }, 80));
}
function registerStudent(data) {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (data.course.registeredIds.includes(data.student.id)) return reject(new Error('Already registered'));
    data.course.seats--;
    data.course.registeredIds.push(data.student.id);
    resolve({ studentId: data.student.id, course: data.course.code, status: 'REGISTERED' });
  }, 80));
}
function sendEmail() { return Promise.resolve('Email sent'); }
function sendSMS() { return Promise.reject(new Error('SMS provider unavailable')); }
function writeAuditLog() { return Promise.resolve('Audit saved'); }

function serviceStatus(name, promise) {
  return promise.then(
    () => ({ service: name, status: 'fulfilled' }),
    () => ({ service: name, status: 'rejected' })
  );
}

getStudent(101)
  .then(s => getCourse('CS401').then(c => ({ student: s, course: c })))
  .then(data => checkPrerequisites(data.student, data.course))
  .then(checkSeats)
  .then(registerStudent)
  .then(confirmation => {
    console.log('Registration:', confirmation);

    return Promise.all([
      serviceStatus('Email', sendEmail()),
      serviceStatus('SMS', sendSMS()),
      serviceStatus('Audit', writeAuditLog())
    ]);
  })
  .then(report => console.log('Post-registration report:', report))
  .catch(error => console.error('Workflow failed:', error.message))
  .finally(() => console.log('Registration workflow finished.'));


function serverA() { return new Promise((resolve, reject) => setTimeout(() => reject(new Error('Server A down')), 40)); }
function serverB() { return new Promise(resolve => setTimeout(() => resolve({ code: 'CS401', source: 'Server B' }), 70)); }
Promise.any([serverA(), serverB()]).then(result => console.log('First successful server result:', result));
