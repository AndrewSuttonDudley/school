import Joi from 'joi';
import createHandler from '../../lib/createHandler';
import studentService from '../../services/student/studentService';
import log from '../../lib/log';

const schema = {
  studentId: Joi.string(),
  email: Joi.string(),
  name: Joi.string(),
};

// Begin createStudent
export const createStudent = createHandler({
  validate: {
    body: Joi.object().keys({
      email: schema.email.required(),
      name: schema.name.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In studentHandler.createStudent with event.body: ${event.body}`);

    return studentService.create(event.body)
    .then(student => callback(null, { statusCode: 200, body: JSON.stringify(student) }));
  },
});
// End createStudent

// Begin readStudent
export const readStudent = createHandler({
  validate: {
    pathParameters: Joi.object().keys({
      studentId: schema.studentId.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In studentHandler.readStudent with studentId: ${event.pathParameters.studentId}`);

    return studentService.read(event.pathParameters.studentId)
    .then((student) => {
      if (student === undefined) {
        return callback(null, { statusCode: 404 });
      }
      return callback(null, { statusCode: 200, body: JSON.stringify(student) });
    });
  },
});
// End readStudent

// Begin updateStudent
export const updateStudent = createHandler({
  validate: {
    pathParameters: Joi.object().keys({
      studentId: schema.studentId.required(),
    }),
    body: Joi.object().keys({
      email: schema.email.required(),
      name: schema.name.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In studentHandler.updateStudent with event.body: ${event.body}`);

    return studentService.update(event.pathParameters.studentId, event.body)
    .then((student) => {
      if (student === undefined) {
        return callback(null, { statusCode: 404 });
      }
      return callback(null, { statusCode: 200, body: JSON.stringify(student) });
    });
  },
});
// End updateStudent

// Begin deleteStudent
export const deleteStudent = createHandler({
  validate: {
    pathParameters: Joi.object().keys({
      studentId: schema.studentId.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In studentHandler.deleteStudent with studentId: ${event.pathParameters.studentId}`);

    return studentService.delete(event.pathParameters.studentId)
    .then((student) => {
      if (student === undefined) {
        return callback(null, { statusCode: 404 });
      }
      return callback(null, { statusCode: 200, body: JSON.stringify(student) });
    });
  },
});
// End deleteStudent
