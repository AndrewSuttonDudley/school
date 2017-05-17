/**
 * "fatal" (60): The service/app is going to stop or become unusable now.
 *               An operator should definitely look into this soon.
 * "error" (50): Fatal for a particular request, but the service/app continues
 *               servicing other requests. An operator should look at this soon(ish).
 * "warn" (40): A note on something that should probably be looked at by an operator eventually.
 * "info" (30): Detail on regular operation.
 * "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
 * "trace" (10): Logging from external libraries used by your app or very
 *               detailed application logging.
 */

import bunyan from 'bunyan';
import {
  consoleStreamFactory,
  logglyStreamFactory,
  sentryStreamFactory,
} from './logStreams';

const env = process.env.STAGE || 'local';

const streams = {
  local: () => [
    consoleStreamFactory({ level: 'debug' }),
  ],
  dev: () => {
    const devStreams = [
      logglyStreamFactory({ level: 'debug' }),
    ];

    // For personal acounts log to cloudwatch
    if (process.env.TRUTH_ACCOUNT_NAME === 'truth') {
      devStreams.push(sentryStreamFactory({ level: 'warn' }));
    } else {
      devStreams.push(consoleStreamFactory({ level: 'debug' }));
    }

    return devStreams;
  },
  beta: () => [
    logglyStreamFactory({ level: 'info' }),
    sentryStreamFactory({ level: 'warn' }),
  ],
  prod: () => [
    logglyStreamFactory({ level: 'info' }),
    sentryStreamFactory({ level: 'warn' }),
  ],
};

export default bunyan.createLogger({
  name: 'bunyan',
  streams: streams[env](),
});
