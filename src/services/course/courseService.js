import uuid from 'node-uuid';
import AWS from 'aws-sdk';
import Boom from 'boom';
import log from '../../lib/log';

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'courses';

const courseService = {

// Begin create
  create: data => new Promise((resolve, reject) => {
    log.info(`In courseService.create with data: ${JSON.stringify(data, null, 2)}`);
    const now = (new Date()).toISOString();

    const item = {
      courseId: uuid.v1(),
      createdAt: now,
      updatedAt: now,
      name: data.name,
    };
    const params = {
      TableName: tableName,
      Item: item,
    };
    log.info(`courseService.create: item: ${JSON.stringify(item, null, 2)}`);

    docClient.put(params, (error) => {
      if (error) {
        reject(Boom.badImplementation('Unable to create course item.', error));
      }
      resolve(item);
    });
  }),
// End create

// Begin read
  read: courseId => new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        courseId,
      },
    };

    docClient.get(params, (error, result) => {
      if (error) {
        return reject(Boom.badImplementation('Unable to read course item.', error));
      }
      return resolve(result.Item);
    });
  }),
// End read

// Begin update
  update: (courseId, data) => new Promise((resolve, reject) => {
    log.info(`In courseService.update with courseId: ${courseId} and data: ${JSON.stringify(data, null, 2)}`);
    const now = (new Date()).toISOString();

    const updates = {
      updatedAt: {
        Action: 'PUT',
        Value: now,
      },
    };
    Object.keys(data).forEach((key) => {
      updates[key] = {
        Action: 'PUT',
        Value: data[key],
      };
    });
    const params = {
      TableName: tableName,
      Key: {
        courseId,
      },
      AttributeUpdates: updates,
      ReturnValues: 'ALL_NEW',
    };

    log.info(`Calling docClient.update with params: ${JSON.stringify(params, null, 2)}`);
    docClient.update(params, (error, result) => {
      log.info(`In callback from docClient.update with error: ${JSON.stringify(error, null, 2)} and result: ${JSON.stringify(result, null, 2)}`);
      if (error) {
        log.info('Error');
        return reject(Boom.badImplementation('Unable to update course item.', error));
      } else if (!result.Attributes) {
        log.info('Not Attributes');
        return resolve(undefined);
      }
      log.info('Returning resolve attrs');
      return resolve(result.Attributes);
    });
  }),
// End update

// Begin delete
  delete: courseId => new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        courseId,
      },
      ReturnValues: 'ALL_OLD',
    };

    docClient.delete(params, (error, result) => {
      if (error) {
        return reject(Boom.badImplementation('Unable to delete course item.', error));
      }
      return resolve(result.Attributes);
    });
  }),
};
// End delete

export { courseService as default };
