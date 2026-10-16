'use strict';
const results = [
  { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
  { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
  { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
  { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
  { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
  { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
];

function getGrade(marks) {
  if (!Number.isFinite(marks) || marks < 0 || marks > 100) return { grade: 'Invalid', status: 'INVALID', gradePoints: 0 };
  if (marks >= 85) return { grade: 'A', status: 'PASS', gradePoints: 4.0 };
  if (marks >= 80) return { grade: 'A-', status: 'PASS', gradePoints: 3.7 };
  if (marks >= 75) return { grade: 'B+', status: 'PASS', gradePoints: 3.3 };
  if (marks >= 70) return { grade: 'B', status: 'PASS', gradePoints: 3.0 };
  if (marks >= 65) return { grade: 'B-', status: 'PASS', gradePoints: 2.7 };
  if (marks >= 60) return { grade: 'C+', status: 'PASS', gradePoints: 2.3 };
  if (marks >= 50) return { grade: 'C', status: 'PASS', gradePoints: 2.0 };
  return { grade: 'F', status: 'FAIL', gradePoints: 0.0 };
}

const processedResults = results.map(student => ({ ...student, ...getGrade(student.marks) }));
console.log('A. Processed results:');
console.table(processedResults);
const ranked = [...processedResults].sort((a, b) => b.marks - a.marks || a.name.localeCompare(b.name));
console.log('\nB. Ranked list:');
console.table(ranked);

const departmentStats = processedResults.reduce((stats, student) => {
  const key = student.department;
  if (!stats[key]) stats[key] = { students: 0, total: 0, highest: -Infinity, passed: 0 };
  stats[key].students++;
  stats[key].total += student.marks;
  stats[key].highest = Math.max(stats[key].highest, student.marks);
  if (student.status === 'PASS') stats[key].passed++;
  return stats;
}, {});
Object.values(departmentStats).forEach(dept => {
  dept.average = Number((dept.total / dept.students).toFixed(2));
  delete dept.total;
});
console.log('\nC. Department statistics:', departmentStats);

const overallAverage = processedResults.reduce((sum, s) => sum + s.marks, 0) / processedResults.length;
console.log('\nD. Academic queries:');
console.log({
  firstStudentAbove85: processedResults.find(s => s.marks > 85) ?? null,
  firstFailedIndex: processedResults.findIndex(s => s.status === 'FAIL'),
  atLeastOneFailed: processedResults.some(s => s.status === 'FAIL'),
  allMarksValid: processedResults.every(s => Number.isFinite(s.marks) && s.marks >= 0 && s.marks <= 100),
  aboveOverallAverage: processedResults.filter(s => s.marks > overallAverage).map(s => s.name),
  topThreeNames: ranked.slice(0, 3).map(s => s.name),
  overallAverage: Number(overallAverage.toFixed(2))
});
