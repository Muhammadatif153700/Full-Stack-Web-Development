const ApiError = require("./ApiError");
const CrudController = require("./CrudController");
const Repository = require("./Repository");
const Schema = require("./Schema");

const idField = { type: "whole" };

function createEntities() {
  const students = new Repository();
  const teachers = new Repository();
  const attendance = new Repository();
  const marks = new Repository();

  const validateRefs = (attrs) => {
    if (!students.findById(attrs.studentId)) {
      throw ApiError.badRequest("studentId must reference an existing student");
    }
    if (!teachers.findById(attrs.teacherId)) {
      throw ApiError.badRequest("teacherId must reference an existing teacher");
    }
  };

  const validateAttendanceUnique = (attrs, currentId) => {
    const isDuplicate = attendance
      .findWhere({ studentId: attrs.studentId, date: attrs.date })
      .some((item) => item.id !== currentId);

    if (isDuplicate) {
      throw ApiError.conflict("Attendance already exists for this student on this date");
    }
  };

  const validateMarks = (attrs) => {
    validateRefs(attrs);
    if (attrs.obtained > attrs.total) {
      throw ApiError.badRequest("obtained cannot be greater than total");
    }
  };

  const studentController = new CrudController({
    repository: students,
    schema: new Schema({
      name: { type: "text" },
      rollNo: { type: "text" },
      email: { type: "email", required: false },
      age: { type: "whole" },
      className: { type: "text", required: false }
    }),
    beforeCreate(attrs) {
      const exists = students.findWhere({ rollNo: attrs.rollNo }).length > 0;
      if (exists) throw ApiError.conflict("rollNo already exists");
    },
    beforeUpdate(attrs, current) {
      const isRollChanged = attrs.rollNo !== current.rollNo;
      const exists = students.findWhere({ rollNo: attrs.rollNo }).length > 0;
      if (isRollChanged && exists) throw ApiError.conflict("rollNo already exists");
    },
    beforeDelete(student) {
      attendance.findWhere({ studentId: student.id }).forEach((row) => attendance.erase(row.id));
      marks.findWhere({ studentId: student.id }).forEach((row) => marks.erase(row.id));
    }
  });

  const teacherController = new CrudController({
    repository: teachers,
    schema: new Schema({
      name: { type: "text" },
      subject: { type: "text" },
      email: { type: "email" },
      phone: { type: "text", required: false }
    }),
    beforeCreate(attrs) {
      const exists = teachers.findWhere({ email: attrs.email }).length > 0;
      if (exists) throw ApiError.conflict("email already exists");
    },
    beforeUpdate(attrs, current) {
      const isEmailChanged = attrs.email !== current.email;
      const exists = teachers.findWhere({ email: attrs.email }).length > 0;
      if (isEmailChanged && exists) throw ApiError.conflict("email already exists");
    },
    beforeDelete(teacher) {
      const hasAttendance = attendance.findWhere({ teacherId: teacher.id }).length > 0;
      const hasMarks = marks.findWhere({ teacherId: teacher.id }).length > 0;

      if (hasAttendance || hasMarks) {
        throw ApiError.conflict("Teacher is referenced by attendance or marks");
      }
    }
  });

  const attendanceController = new CrudController({
    repository: attendance,
    schema: new Schema({
      studentId: idField,
      teacherId: idField,
      date: { type: "day" },
      status: {
        type: "choice",
        options: ["present", "absent", "late", "leave"]
      },
      remarks: { type: "text", required: false }
    }),
    beforeCreate(attrs) {
      validateRefs(attrs);
      validateAttendanceUnique(attrs);
    },
    beforeUpdate(attrs, current) {
      validateRefs(attrs);
      validateAttendanceUnique(attrs, current.id);
    }
  });

  const marksController = new CrudController({
    repository: marks,
    schema: new Schema({
      studentId: idField,
      teacherId: idField,
      subject: { type: "text" },
      examType: {
        type: "choice",
        options: ["quiz", "assignment", "midterm", "final", "lab"]
      },
      obtained: { type: "decimal" },
      total: { type: "decimal" }
    }),
    beforeCreate: validateMarks,
    beforeUpdate: validateMarks
  });

  return {
    students: studentController,
    teachers: teacherController,
    attendance: attendanceController,
    marks: marksController
  };
}

module.exports = { createEntities };
