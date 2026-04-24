import mongoose from "mongoose";

export const connectDB =  () => {
    mongoose.connect(process.env.MONGO_URL, {
        dbName: "Educational_Management_System",
    })
    .then(() => {
        console.log('Database connected successfully');     
    })
    .catch((err) => {
        console.log('Error connecting to database');     
    });
};