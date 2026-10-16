import Student from './Student.js';
import { calculateAverage, calculateGrade as gradeForMarks } from './gradeUtils.js'; // aliased named import
import { processTranscriptJSON } from './transcriptService.js';

const rawData = `
[
  {
    "id": 101,
    "name": "Ali",
    "courses": [
      { "code": "CS301", "marks": 81 },
      { "code": "CS302", "marks": 74 }
    ]
  }
]`;

try {
  const report = processTranscriptJSON(rawData);
  console.log('Report object:', report);
  console.log('Report JSON:\n', JSON.stringify(report, null, 2));
  console.log('Example default import:', new Student(999, 'Demo Student', []));
  console.log('Example named imports:', calculateAverage([80, 90]), gradeForMarks(88));
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
} finally {
  console.log('Transcript processing finished.');
}

// To test errors, try: processTranscriptJSON('{bad json}'), duplicate IDs,
// missing IDs, missing course codes, or marks such as 120.
