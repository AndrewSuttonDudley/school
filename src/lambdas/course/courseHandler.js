import Joi from 'joi';
import createHandler from '../../lib/createHandler';
import courseService from '../../services/course/courseService';
import log from '../../lib/log';

const schema = {
  courseId: Joi.string(),
  name: Joi.string(),
};

// Begin createCourse
export const createCourse = createHandler({
  validate: {
    body: Joi.object().keys({
      name: schema.name.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In courseHandler.createCourse with typeof event.body: ${typeof event.body}`);

    return courseService.create(event.body)
    .then(course => callback(null, { statusCode: 200, body: JSON.stringify(course) }));
  },
});
// End createCourse

// Begin readCourse
export const readCourse = createHandler({
  validate: {
    pathParameters: Joi.object().keys({
      courseId: schema.courseId.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In courseHandler.readCourse with courseId: ${event.pathParameters.courseId}`);

    return courseService.read(event.pathParameters.courseId)
    .then((course) => {
      if (course === undefined) {
        return callback(null, { statusCode: 404 });
      }
      return callback(null, { statusCode: 200, body: JSON.stringify(course) });
    });
  },
});
// End readCourse

// Begin updateCourse
export const updateCourse = createHandler({
  validate: {
    pathParameters: Joi.object().keys({
      courseId: schema.courseId.required(),
    }),
    body: Joi.object().keys({
      name: schema.name.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In courseHandler.updateCourse with event.body: ${JSON.stringify(event.body, null, 2)}`);

    return courseService.update(event.pathParameters.courseId, event.body)
    .then((course) => {
      log.info(`Returned from courseService.update with course: ${JSON.stringify(course, null, 2)}`);
      if (course === undefined) {
        return callback(null, { statusCode: 404 });
      }
      return callback(null, { statusCode: 200, body: JSON.stringify(course) });
    });
  },
});
// End updateCourse

// Begin deleteCourse
export const deleteCourse = createHandler({
  validate: {
    pathParameters: Joi.object().keys({
      courseId: schema.courseId.required(),
    }),
  },
  handler: (event, context, callback) => {
    log.info(`In courseHandler.deleteCourse with courseId: ${event.pathParameters.courseId}`);

    return courseService.delete(event.pathParameters.courseId)
    .then((course) => {
      if (course === undefined) {
        return callback(null, { statusCode: 404 });
      }
      return callback(null, { statusCode: 200, body: JSON.stringify(course) });
    });
  },
});
// End deleteCourse
