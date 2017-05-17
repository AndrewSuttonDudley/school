import uuid from 'node-uuid';
import AWS from 'aws-sdk';
import Boom from 'boom';
import log from '../../lib/log';

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'students';

const studentService = {

  create: data => new Promise((resolve, reject) => {
    log.info(`In studentService.create with data: ${data}`);
    const now = (new Date()).toISOString();

    log.info(`In studentService.create with data.email: ${data.email}`);
    log.info(`In studentService.create with data.name: ${data.name}`);
    const item = {
      studentId: uuid.v1(),
      createdAt: now,
      updatedAt: now,
      email: data.email,
      name: data.name,
    };
    log.info(`About to put item: ${item}`);
    log.info(`About to put item stringified: ${JSON.stringify(item, null, 2)}`);
    const params = {
      TableName: tableName,
      Item: item,
    };

    docClient.put(params, (error) => {
      if (error) {
        return reject(Boom.badImplementation('Unable to create student item.', error));
      }
      log.info(`Returning from studentService.create with item: ${JSON.stringify(item, null, 2)}`);
      return resolve(item);
    });
  }),

  read: studentId => new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        studentId,
      },
    };

    docClient.get(params, (error, result) => {
      if (error) {
        return reject(Boom.badImplementation('Unable to read student item.', error));
      }
      return resolve(result.Item);
    });
  }),

  update: (studentId, data) => new Promise((resolve, reject) => {
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
        studentId,
      },
      AttributeUpdates: updates,
      ReturnValues: 'ALL_NEW',
    };

    docClient.update(params, (error, result) => {
      if (error) {
        return reject(Boom.badImplementation('Unable to update student item.', error));
      } else if (!result.Attributes) {
        return resolve(undefined);
      }
      return resolve(result.Attributes);
    });
  }),

  delete: studentId => new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        studentId,
      },
      ReturnValues: 'ALL_OLD',
    };

    docClient.delete(params, (error, result) => {
      if (error) {
        return reject(Boom.badImplementation('Unable to delete student item.', error));
      } else if (!result.Attributes) {
        return resolve(undefined);
      }
      return resolve(result.Attributes);
    });
  }),
};

export { studentService as default };
