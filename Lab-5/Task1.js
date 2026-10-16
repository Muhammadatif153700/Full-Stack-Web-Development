'use strict';

const applicants = [
  { id: 'A101', name: 'Sara Khan', age: '19', matricMarks: '91', intermediateMarks: '87', entryTest: '78', program: 'BSCS', feePaid: 'true' },
  { id: 'A102', name: 'Ahmed Ali', age: 'twenty', matricMarks: '88', intermediateMarks: '', entryTest: '72', program: 'BSSE', feePaid: 'false' },
  { id: 'A103', name: 'Hassan', age: '18', matricMarks: '76', intermediateMarks: '83', entryTest: '91', program: 'BSAI', feePaid: 'true' }
];

const supportedPrograms = ['BSCS', 'BSSE', 'BSAI'];
const MARKS_WEIGHT = { matricMarks: 0.20, intermediateMarks: 0.30, entryTest: 0.50 };

function toNumber(value, field, errors, min, max) {
  if (value === null || value === undefined || String(value).trim() === '') {
    errors.push(`${field} is missing`);
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    errors.push(`${field} is not a valid number`);
    return null;
  }
  if (number < min || number > max) {
    errors.push(`${field} must be between ${min} and ${max}`);
    return null;
  }
  return number;
}

function processApplicant(applicant) {
  const errors = [];
  if (!applicant.id || !String(applicant.name ?? '').trim()) {
    errors.push('ID and name are required');
  }

  const age = toNumber(applicant.age, 'Age', errors, 17, 30);
  const matricMarks = toNumber(applicant.matricMarks, 'Matric marks', errors, 0, 100);
  const intermediateMarks = toNumber(applicant.intermediateMarks, 'Intermediate marks', errors, 0, 100);
  const entryTest = toNumber(applicant.entryTest, 'Entry test marks', errors, 0, 100);

  if (!supportedPrograms.includes(applicant.program)) errors.push('Unsupported program');
  if (!['true', 'false', true, false].includes(applicant.feePaid)) errors.push('Fee status must be true or false');


  if (errors.length) {
    return { id: applicant.id ?? 'UNKNOWN', name: applicant.name ?? 'Unknown', status: 'INVALID DATA', errors, merit: null };
  }

  const merit = Number((
    matricMarks * MARKS_WEIGHT.matricMarks +
    intermediateMarks * MARKS_WEIGHT.intermediateMarks +
    entryTest * MARKS_WEIGHT.entryTest
  ).toFixed(2));

  const eligible = merit >= 70 && entryTest >= 60 && intermediateMarks >= 60;
  const feePaid = applicant.feePaid === true || applicant.feePaid === 'true';


 
  let status;
  if (!eligible) status = 'REJECTED';
  else if (feePaid) status = 'SELECTED';
  else status = 'WAITING';

  return { id: applicant.id, name: applicant.name, age, program: applicant.program, merit, status, errors: [] };
}

const processed = applicants.map(processApplicant);
console.log('Applicant results:');
console.table(processed.map(({ id, name, program, merit, status }) => ({ id, name, program, merit, status })));

const valid = processed.filter(a => a.status !== 'INVALID DATA');
const invalid = processed.filter(a => a.status === 'INVALID DATA');
const withMerit = valid.filter(a => typeof a.merit === 'number');
const highest = withMerit.length ? withMerit.reduce((best, a) => a.merit > best.merit ? a : best) : null;
const lowestMerit = withMerit.length ? Math.min(...withMerit.map(a => a.merit)) : null;
const averageMerit = withMerit.length
  ? Number((withMerit.reduce((sum, a) => sum + a.merit, 0) / withMerit.length).toFixed(2))
  : null;
const programCounts = Object.fromEntries(supportedPrograms.map(program => [
  program, processed.filter(a => a.program === program && a.status !== 'INVALID DATA').length
]));

console.log('\nSummary:');
console.log({
  validApplicants: valid.length,
  invalidApplicants: invalid.length,
  highestMeritApplicant: highest ? { name: highest.name, merit: highest.merit } : null,
  lowestMeritAmongValid: lowestMerit,
  averageMerit,
  applicantsPerProgram: programCounts
});
console.log('\nInvalid-data details:', invalid.map(a => ({ id: a.id, errors: a.errors })));
