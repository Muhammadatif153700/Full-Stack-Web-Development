'use strict';

const mockData = {
  '/users': [{ id: 1, name: 'Atif', department: 'CS' }, { id: 2, name: 'Haniya', department: 'CS' }, { id: 3, name: 'Usman', department: 'SE' }],
  '/courses': [{ code: 'CS301' }, { code: 'CS401' }],
  '/results': [{ studentId: 1, name: 'Atif', department: 'CS', marks: 82 }, { studentId: 2, name: 'Haniya', department: 'CS', marks: 91 }, { studentId: 3, name: 'Usman', department: 'SE', marks: 47 }]
};


function fakeFetch(url, options = {}) {
  const delay = url === '/slow' ? 500 : 50;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (url === '/network-error') return reject(new TypeError('Network connection failed'));
      if (url === '/404') return resolve({ ok: false, status: 404, json: async () => ({}) });
      if (url === '/500') return resolve({ ok: false, status: 500, json: async () => ({}) });
      if (url === '/invalid-json') return resolve({ ok: true, status: 200, json: async () => { throw new SyntaxError('Invalid JSON'); } });
      if (options.signal?.aborted) return reject(new DOMException('The operation was aborted', 'AbortError'));
      const data = mockData[url];
      if (!data) return resolve({ ok: false, status: 404, json: async () => ({}) });
      resolve({ ok: true, status: 200, json: async () => data });
    }, delay);
    options.signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('The operation was aborted', 'AbortError'));
    }, { once: true });
  });
}

async function getJSON(url, fetchImplementation = fetch) {
  const response = await fetchImplementation(url);
  if (!response.ok) throw new Error(`HTTP error ${response.status} for ${url}`);
  return response.json(); 
}

function makeDashboard(users, courses, results) {
  const average = results.length ? results.reduce((sum, r) => sum + r.marks, 0) / results.length : 0;
  const highest = results.length ? results.reduce((best, r) => r.marks > best.marks ? r : best) : null;
  const departments = results.reduce((stats, result) => {
    if (!stats[result.department]) stats[result.department] = { students: 0, totalMarks: 0, passed: 0, failed: 0 };
    const item = stats[result.department];
    item.students++;
    item.totalMarks += result.marks;
    if (result.marks >= 50) item.passed++;
    else item.failed++;
    return stats;
  }, {});
  Object.values(departments).forEach(item => {
    item.average = Number((item.totalMarks / item.students).toFixed(2));
    delete item.totalMarks;
  });
  return {
    totalStudents: users.length,
    totalCourses: courses.length,
    overallAverageMarks: Number(average.toFixed(2)),
    highestPerformingStudent: highest,
    failedStudents: results.filter(r => r.marks < 50).length,
    departmentStatistics: departments
  };
}

async function loadDashboard() {

  const [users, courses, results] = await Promise.all([
    getJSON('/users', fakeFetch),
    getJSON('/courses', fakeFetch),
    getJSON('/results', fakeFetch)
  ]);
  return makeDashboard(users, courses, results);
}


async function fetchWithTimeout(url, milliseconds, fetchImplementation = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  try {
    const response = await fetchImplementation(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP error ${response.status} for ${url}`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`Request timed out after ${milliseconds} ms: ${url}`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

loadDashboard()
  .then(report => console.log('Dashboard report:', report))
  .catch(error => console.error('Dashboard failed:', error.name, error.message));

(async () => {
  for (const url of ['/404', '/500', '/network-error', '/invalid-json']) {
    try { await getJSON(url, fakeFetch); }
    catch (error) { console.log(`Test ${url}:`, error.name, error.message); }
  }
  try {
    await fetchWithTimeout('/slow', 100, fakeFetch);
  } catch (error) {
    console.log('Timeout test:', error.name, error.message);
  }
})();
