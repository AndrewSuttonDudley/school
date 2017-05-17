import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import log from '../../../lib/log';
import StudentType from './studentType';

const CourseType = new GraphQLObjectType({
  name: 'Course',
  description: 'Represents the student\'s course in school',
  fields: () => ({
    courseId: {
      type: GraphQLString,
      description: 'The course object\'s unique ID',
    },
    createdAt: {
      type: GraphQLString,
      description: 'The readable datetime string representation of when the course record was created',
    },
    updatedAt: {
      type: GraphQLString,
      description: 'The readable datetime string representation of when the course record was last modified',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the course',
    },
    students: {
      type: new GraphQLList(StudentType),
      description: 'The course\'s students',
      resolve: (course/* , args, context, info */) => {
        log.info(`Made it to students resolver in course: ${course}`);
      },
    },
  }),
});

export default CourseType;
