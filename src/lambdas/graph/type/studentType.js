import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import log from '../../../lib/log';
import CourseType from './courseType';

const StudentType = new GraphQLObjectType({
  name: 'Student',
  description: 'Student object that represents the student\'s enrollment in school',
  fields: () => ({
    studentId: {
      type: GraphQLString,
      description: 'The student\'s unique ID',
    },
    createdAt: {
      type: GraphQLString,
      description: 'The readable datetime string representation of when the student record was created',
    },
    updatedAt: {
      type: GraphQLString,
      description: 'The readable datetime string representation of when the student record was last modified',
    },
    courses: {
      type: new GraphQLList(CourseType),
      description: 'The student\'s courses',
      resolve: (student/* , args, context, info */) => {
        log.info(`Made it to courses resolver in student: ${student}`);
      },
    },
    email: {
      type: GraphQLString,
      description: 'The student\'s email',
    },
    name: {
      type: GraphQLString,
      description: 'The student\'s name',
    },
  }),
});

export default StudentType;
