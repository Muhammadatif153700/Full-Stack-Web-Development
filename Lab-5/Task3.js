'use strict';

const student = {
  id: 101,
  name: 'Ali',
  marks: 0,
  scholarship: false,
  address: { city: 'Islamabad', sector: 'F-10' },
  contact: { email: 'ali@university.edu' }
};

const update = {
  name: 'Ali Khan',
  address: { city: 'Rawalpindi' },
  contact: { phone: '03001234567' },
  marks: 0,
  scholarship: false
};

function updateProfile(original, changes, ...extraNotes) {

  const { name: oldName = 'Unnamed', address: oldAddress = {}, contact: oldContact = {}, ...otherFields } = original;
  const { name: newName = oldName, address: addressUpdate = {}, contact: contactUpdate = {}, ...otherUpdates } = changes;


  const { city: oldCity = 'Unknown city', sector: oldSector = 'Unknown sector' } = oldAddress;
  const { email: oldEmail = '' } = oldContact;
  const city = addressUpdate.city ?? oldCity;
  const sector = addressUpdate.sector ?? oldSector;
  const email = contactUpdate.email ?? oldEmail;

  const updated = {
    ...otherFields,
    ...otherUpdates,
    name: newName ?? oldName,
    address: { ...oldAddress, ...addressUpdate, city, sector },
    contact: { ...oldContact, ...contactUpdate, email },
    notes: extraNotes
  };
  return updated;
}

const [firstCourse = 'No course supplied', secondCourse = 'No second course'] = ['FSWD'];
const { contact: maybeContact } = student;
const safeEmail = maybeContact?.email ?? 'No email';

const updatedStudent = updateProfile(student, update, 'Profile updated', 'Checked fields');
console.log('Updated student:', updatedStudent);
console.log('Array destructuring:', { firstCourse, secondCourse });
console.log('Optional chaining + nullish coalescing:', safeEmail);


console.log('Original === updated:', student === updatedStudent); 
console.log('Original address === updated address:', student.address === updatedStudent.address); 
console.log('Original contact === updated contact:', student.contact === updatedStudent.contact); 
console.log('Original remains unchanged:', student);
