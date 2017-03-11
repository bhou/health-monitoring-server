const { buildSchema } = require('graphql');

const schema = `
type BodyTemperature {
  value: Float
  unit: String
}

type SystolicBloodPressure {
  value: Float
  unit: String
}

type DiastolicBloodPressure {
  value: Float
  unit: String
}

type BloodPressure {
  systolic: SystolicBloodPressure
  diastolic: DiastolicBloodPressure
}

type Record {
  id: ID
  patientId: ID
  timestamp: Int
  bodyTemperature: BodyTemperature
  bloodPressure: BloodPressure
}

# patient information
type Patient {
  id: ID
  name: String
  gender: String
  photo: String
  age: Int
  bloodType: String
  data: [Record]
}

type Query {
  patients(n: Int): [Patient],
  patientData(id: ID, startTime: Int, endTime: Int, offset: Int, count: Int): [Record]
}

type Mutation {
  updateRecord(patientId: ID, recordId: ID, bodyTemperature: Float, systolicPressure: Float, diastolicPressure: Float): Record
  deleteRecord(patientId: ID, recordId: ID): Record
}
`;


module.exports = buildSchema(schema);
