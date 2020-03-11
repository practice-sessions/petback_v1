const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
   await mongoose.connect(db, {
    //debug: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
    //useFindOneAndUpdate: true,
    //useFindOneAndReplace: true,
    //useFindOneAndDelete: true
   });

   console.log('MongoDB Connected...');
  } catch(err) {
    console.error(err.message);
    // Catch error exits the process with a failure message
    process.exit(1);
  }
}

module.exports = connectDB;