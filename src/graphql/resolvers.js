const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const ObjectId = require('mongoose').Types.ObjectId; 

const Patient = require('../db/schema/Patient');
const Record = require('../db/schema/Record');

const resolveFunctions = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return value;  // value from the client
    },
    serialize(value) {
      return value; // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
  
  Query: {
    patients: (obj, args, ctx, info) => {
      return new Promise((resolve, reject) => {
        Patient.find({}).exec((err, patients) => {
          if (err) return reject(err);
          return resolve(patients);
        });
      });
    },

    patientData: (obj, args, ctx, info) => {
      return new Promise((resolve, reject) => {
        let patientId = args.id;
        let startTime = args.startTime || 0;
        let endTime = args.endTime || Date.now();
        let offset = args.offset || 0;
        let count = args.count || 10;

        Record
          .find({patientId: new ObjectId(patientId)})
          .where('timestamp').gt(startTime).lt(endTime)
          .skip(offset)
          .limit(count)
          .sort('-timestamp')
          .exec((err, records) => {
            if (err) return reject(err);
            return resolve(records);
          });
      });
    },

  },
  
  Mutation: {
    updateRecord(obj, args, ctx, info) {
      return new Promise((resolve, reject) => {
        let recordId = args.recordId;

        Record.findOne({ _id:  new ObjectId(recordId)})
          .exec((err, record) => {
            if (err) return reject(err);
            
            if (Object.prototype.hasOwnProperty.call(args, 'bodyTemperature')) {
              record.bodyTemperature.value = args.bodyTemperature;
            }

            if (Object.prototype.hasOwnProperty.call(args, 'systolicPressure')) {
              record.bloodPressure.systolic.value = args.systolicPressure;
            }

            if (Object.prototype.hasOwnProperty.call(args, 'diastolicPressure')) {
              record.bloodPressure.diastolic.value = args.diastolicPressure;
            }

            record.save((err) => {
              if (err) return reject(err);
              return resolve(record);
            });
          });
      });
    },

    deleteRecord(obj, args, ctx, info) {
      return new Promise((resolve, reject) => {
        let recordId = args.recordId;
        
        Record.findOne({ _id:  new ObjectId(recordId)})
          .remove((err, result) => {
            if (err) return reject(err);

            if (result.result.n === 0) return reject(new Error(`record not found (id: ${recordId})`))

            return resolve({
              id: recordId
            });
          });
      })
    }
  }
}

module.exports = resolveFunctions; 
