import Boom from 'boom';
import log from './log';
import { validateItem } from './validate';

function makeBoomError(error) {
  if (error.isBoom) {
    return error;
  }

  if (error instanceof Error) {
    return Boom.wrap(error);
  }

  return Boom.create(500, error);
}

export default function createHandler({ validate = {}, handler }) {
  return (event, context, callback) => {
    let functionTimeout = process.env.AWS_LAMBDA_FUNCTION_TIMEOUT;
    let timer;

    if (context.getRemainingTimeInMillis) {
      functionTimeout = context.getRemainingTimeInMillis();
    }

    if (functionTimeout) {
      timer = setTimeout(() => {
        // Warn if execution takes longer than half the alloted timeout
        log.warn(`Execution time exceeds ${functionTimeout / 1000 / 2} seconds.`, {
          data: { event, context },
        });
      }, functionTimeout / 2);
    }

    let memoryWatch = setInterval(() => {
      const memoryLimit = context.memoryLimitInMB;
      const memoryUsed = process.memoryUsage().heapUsed / 1048576;
      const percentUsed = memoryUsed / memoryLimit;

      if (percentUsed >= 0.75) {
        // Warn if memory usage is over 75%
        log.warn(`Low memory warning: ${memoryUsed.toFixed(2)} / ${memoryLimit} MB used (${Math.floor(percentUsed * 100)}%)`, {
          data: { memoryLimit, memoryUsed },
        });

        if (memoryWatch) {
          clearInterval(memoryWatch);
          memoryWatch = null;
        }
      }
    }, 250);

    const wrappedCb = cb => (err, data) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      if (memoryWatch) {
        clearInterval(memoryWatch);
        memoryWatch = null;
      }

      if (err) {
        const boomError = makeBoomError(err);
        const statusCode = boomError.output.statusCode;
        let captured = false;

        const captureComplete = () => {
          if (captured) {
            return;
          }

          log.removeListener('logging', captureComplete);
          log.removeListener('error', captureComplete);

          // if (statusCode === 401) {
          //   cb('Unauthorized');
          //   return;
          // }

          captured = true;
          // Transform the boom error into a lambda proxy object
          const response = {
            statusCode: boomError.output.statusCode,
            body: JSON.stringify(boomError.output.payload),
          };

          cb(null, response);
        };

        log.on('logging', captureComplete);
        log.on('error', captureComplete);

        // In case our logging mechanism doesn't emit these events
        // fall back to just completing after 500 ms.
        setTimeout(captureComplete, 500);

        if (statusCode >= 500) {
          log.error(boomError, {
            data: { event, context },
          });
        } else {
          log.info(boomError, {
            data: { event, context },
          });
        }
      } else if (Object.hasOwnProperty.call(data, 'isBoom')) {
        // Transform the boom error into a lambda proxy object
        const response = {
          statusCode: data.output.statusCode,
          body: JSON.stringify(data.output.payload),
        };

        if (data.output.statusCode >= 500) {
          log.error(data, {
            data: { event, context },
          });
        } else {
          log.info(data, {
            data: { event, context },
          });
        }

        cb(null, response);
      } else {
        cb(null, data);
      }
    };

    const wrappedContext = Object.assign({}, context);
    wrappedContext.done = wrappedCb(context.done);
    wrappedContext.error = err => wrappedContext.done(err);
    wrappedContext.success = data => wrappedContext.done(null, data);

    const wrappedCallback = wrappedCb(callback);

    // Validate against schema
    const parsedEvent = event;
    if (event.body) {
      try {
        parsedEvent.body = JSON.parse(event.body);
      } catch (error) {
        log.error('Can\'t parse event.body as JSON', error);
        const response = {
          statusCode: 500,
        };

        return callback(null, response);
      }
    }


    // Create promises for each property (body, pathParameters, queryStringParameters)
    const validationPromises = Object.entries(validate).map(([key, validationSchema]) => {
      log.info('parsedEvent: ', parsedEvent);
      log.info('parsedEvent[key]: ', parsedEvent[key]);
      if (!parsedEvent[key]) {
        log.info('no parsedEvent key');
        return Promise.reject(Boom.badRequest());
      }

      return validateItem(parsedEvent[key], validationSchema);
    });

    return Promise.all(validationPromises)
      .then(() => handler(parsedEvent, wrappedContext, wrappedCallback))
      .catch(wrappedCallback);
  };
}
