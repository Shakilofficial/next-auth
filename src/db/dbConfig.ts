import mongoose from 'mongoose';

export async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const connection = mongoose.connection;
    connection.on('connected', () => {
      console.log('Connected to MongoDB Successfully');
    });
    connection.on('error', (error) => {
      console.log('Error connecting to MongoDB. Please make sure MongoDB is running.' + error);
      process.exit();
    });
  } catch (error) {
    console.log('Error connecting to MongoDB');
    console.log(error);
  }
}
