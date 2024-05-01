import { prisma } from "../../database";
import { faker } from "@faker-js/faker";

class StudentBuilder {
  private data: any;

  constructor() {
    this.data = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };
  }

  async build() {
    return prisma.student.create({
      data: this.data,
    });
  }
}

class AssignmentBuilder {
  private data: any;

  constructor() {
    this.data = {
      title: faker.lorem.word(),
    };
  }

  build(classId: string) {
    return prisma.assignment.create({
      data: {
        ...this.data,
        classId,
      },
    });
  }
}

const studentAssignmentSubmissionBuilder = async (
  studentAssignmentId: string
) => {
  const studentAssignmentUpdated = await prisma.studentAssignment.update({
    where: {
      id: studentAssignmentId,
    },
    data: {
      status: "submitted",
    },
  });

  return studentAssignmentUpdated;
};

class ClassBuilder {
  private studentsBuilders: StudentBuilder[];
  private assignmentsBuilders: AssignmentBuilder[];

  private clazz: any;
  private students: any[];
  private assignments: any[];
  private enrolledStudents: any[];
  private studentAssignments: any[];
  private shouldAssignAssignments: boolean;

  constructor() {
    this.studentsBuilders = [];
    this.assignmentsBuilders = [];
    this.clazz = null;
    this.students = [];
    this.assignments = [];
    this.enrolledStudents = [];
    this.studentAssignments = [];
    this.shouldAssignAssignments = false;
  }

  withStudent(studentBuilder: StudentBuilder) {
    this.studentsBuilders.push(studentBuilder);
    return this;
  }

  withAssignment(assignmentBuilder: AssignmentBuilder) {
    this.assignmentsBuilders.push(assignmentBuilder);
    return this;
  }

  async enrollStudent(studentBuilder: StudentBuilder) {
    if (this.clazz) {
      const student = await studentBuilder.build();
      await prisma.classEnrollment.create({
        data: {
          classId: this.clazz.id,
          studentId: student.id,
        },
      });

      return student;
    }
  }

  withAssignedAssignments() {
    this.shouldAssignAssignments = true;
    return this;
  }

  async build() {
    await this.createClass()
    await this.createStudents()
    await this.createAssignments()
    await this.enrollStudents()
    await this.assignAssignments()

    return {
      clazz: this.clazz,
      students: this.students,
      assignments: this.assignments,
      classEnrollment: this.enrolledStudents,
      studentAssignments: this.studentAssignments,
    };
  }

  private async createClass() {
    this.clazz = await prisma.class.create({
      data: {
        name: faker.lorem.word(),
      },
    });
  }

  private async createStudents() {
    this.students = await Promise.all(
      this.studentsBuilders.map((builder) => builder.build())
    );
  }

  private async createAssignments() {
    this.assignments = await Promise.all(
      this.assignmentsBuilders.map((builder) => builder.build(this.clazz.id))
    );
  }

  private async enrollStudents() {
    const studentPromises = this.students.map((student) => {
      return prisma.classEnrollment.create({
        data: {
          classId: this.clazz.id,
          studentId: student.id,
        },
      });
    });

    this.enrolledStudents = await Promise.all(studentPromises);
  }

  private async assignAssignments() {
    if (!this.shouldAssignAssignments) {
      return;
    }

    const allPromises = this.students
      .map((student) => {
        return this.assignments.map((assignment) => {
          return prisma.studentAssignment.create({
            data: {
              studentId: student.id,
              assignmentId: assignment.id,
            },
          });
        });
      })
      .flat();

    this.studentAssignments = await Promise.all(allPromises);
  }
}

const studentBuilder = async () => {
  const student = await prisma.student.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
  });

  return student;
};

const classEnrollmentBuilder = async (classId: string, studentId: string) => {
  const classEnrollment = await prisma.classEnrollment.create({
    data: {
      classId,
      studentId,
    },
  });

  return classEnrollment;
};

const classBuilder = async () => {
  const class_ = await prisma.class.create({
    data: {
      name: faker.lorem.word(),
    },
  });

  return class_;
};

const assignmentBuilder = async (classId: string) => {
  const assignment = await prisma.assignment.create({
    data: {
      title: faker.lorem.word(),
      classId,
    },
  });

  return assignment;
};

const studentAssignmentBuilder = async (
  studentId: string,
  assignmentId: string
) => {
  const studentAssignment = await prisma.studentAssignment.create({
    data: {
      studentId,
      assignmentId,
    },
  });

  return studentAssignment;
};

const gradedAssignmentBuilder = async (studentAssignmentId: string) => {
  const gradedAssignment = await prisma.studentAssignment.update({
    where: {
      id: studentAssignmentId,
    },
    data: {
      grade: "A",
    },
  });

  return gradedAssignment;
};

export {
  studentBuilder,
  classBuilder,
  assignmentBuilder,
  classEnrollmentBuilder,
  studentAssignmentBuilder,
  studentAssignmentSubmissionBuilder,
  gradedAssignmentBuilder,
  ClassBuilder,
  StudentBuilder,
  AssignmentBuilder,
};
