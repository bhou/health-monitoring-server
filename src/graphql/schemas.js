module.exports = `
scalar Date

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
  timestamp: Date
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
}

type Query {
  patients(n: Int): [Patient],
  patientData(id: ID, startTime: Date, endTime: Date, offset: Int, count: Int): [Record]
}

type Mutation {
  # update record by id, 
  updateRecord(
    recordId: ID, 
    bodyTemperature: Float, 
    systolicPressure: Float, 
    diastolicPressure: Float): Record
  
  # delete a record by id
  deleteRecord(recordId: ID): Record
}

schema {
  query: Query,
  mutation: Mutation
}
`;
