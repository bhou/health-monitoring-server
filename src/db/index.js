const mongoose = require('mongoose');

module.exports = {
  connect: (done) => {
    mongoose.connect('mongodb://test:test@ds115110.mlab.com:15110/health-monitoring-app', done);
  },

  disconnect: (done) => {
    mongoose.disconnect(done);
  }
}
