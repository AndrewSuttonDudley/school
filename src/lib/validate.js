import Joi from 'joi';
import Boom from 'boom';

export function validateItem(item, itemSchema) {
  return new Promise((resolve, reject) => {
    Joi.validate(item, itemSchema, (err, validatedItem) => {
      if (err) {
        const error = Boom.create(400, err.message.replace(/"/g, '\''));
        return reject(error);
      }

      return resolve(validatedItem);
    });
  });
}

export function validateArrayOfItems(items, itemSchema) {
  return new Promise((resolve, reject) => {
    const schema = Joi.array().items(Joi.object().keys(itemSchema));
    Joi.validate(items, schema, (err, validatedItems) => {
      if (err) {
        const error = Boom.create(400, err.message.replace(/"/g, '\''));
        return reject(error);
      }

      return resolve(validatedItems);
    });
  });
}

// export function stripEmptyStringsFromEvent(event) {
//   const strippedEvent = {};
//   for (const prop in event) {
//     if (event.hasOwnProperty(prop) && event[prop] !== '') {
//       strippedEvent[prop] = event[prop];
//     }
//   }
//
//   return strippedEvent;
// }
