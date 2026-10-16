import Student from './Student.js';
import { calculateAverage, calculateGPA, calculateGrade as gradeForMarks } from './gradeUtils.js';

export function processTranscriptJSON(rawData) {
  let data;
  try {
    data = JSON.parse(rawData);
  } catch {
    throw new SyntaxError('Transcript contains malformed JSON');
  }
  if (!Array.isArray(data)) throw new TypeError('Transcript JSON must be an array');

  const seenIds = new Set();
  const report = data.map(record => {
    if (record?.id === undefined || record?.id === null || record.id === '') throw new TypeError('Student ID is required');
    if (seenIds.has(record.id)) throw new Error(`Duplicate student ID: ${record.id}`);
    seenIds.add(record.id);
    if (typeof record.name !== 'string' || !record.name.trim()) throw new TypeError('Student name is required');
    if (!Array.isArray(record.courses) || record.courses.length === 0) throw new TypeError(`Courses are required for ${record.name}`);

    const courses = record.courses.map(course => {
      if (typeof course?.code !== 'string' || !course.code.trim()) throw new TypeError('Course code is required');
      if (!Number.isFinite(course.marks)) throw new TypeError(`Marks must be numeric for ${course.code}`);
      if (course.marks < 0 || course.marks > 100) throw new RangeError(`Marks for ${course.code} must be 0-100`);
      return { code: course.code, marks: course.marks, grade: gradeForMarks(course.marks) };
    });
    const marks = courses.map(course => course.marks);
    const student = new Student(record.id, record.name, courses);
    return { ...student, average: calculateAverage(marks), gpa: calculateGPA(marks) };
  });
  return { generatedAt: new Date().toISOString(), studentCount: report.length, students: report };
}
