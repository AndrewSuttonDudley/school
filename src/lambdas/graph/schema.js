import {
  // GraphQLList,
  // GraphQLNonNull,
  // GraphQLObject,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import studentService from '../../services/student/studentService';
// import accountService from '../../services/account/accountService';
import log from '../../lib/log';
import StudentType from './type/studentType';
// import AccountType from './type/accountType';
//
// const resolveAccountByAccountId = (root, { accountId }) => {
//   log.info(`Inside resolve with accountId: ${accountId}`);
//   log.info(`stage: ${process.env.STAGE}`);
//   // log.info(`process: ${JSON.stringify(process, null, 2)}`);
//
//   return accountService.read(accountId)
//   .then((account) => {
//     if (account === undefined) {
//       log.info('account is undefined. What the fuck do I do?');
//       return null;
//     }
//     log.info(`returning from promise then with account: ${JSON.stringify(account, null, 2)}`);
//     return account;
//   });
// };

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      student: {
        type: StudentType,
        description: 'The student specified by studentId',
        args: {
          studentId: {
            description: 'The unique ID of the student',
            type: GraphQLString,
          },
          email: {
            description: 'The student\'s email',
            type: GraphQLString,
          },
        },
        resolve: (root, { studentId }) => {
          log.info(`Inside resolve student by studentId: ${studentId}`);

          return studentService.read(studentId)
          .then((student) => {
            log.info(`returning from promise then with student: ${JSON.stringify(student, null, 2)}`);
            return student;
          });
        },
      },
    },
  }),
});

export default schema;
