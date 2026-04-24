
import { connectDB } from "./config/db.js";
import  app from "./app.js";


//DATABASE CONNECTION

connectDB();

//START SERVER

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})

//ERROR HANDLING
process.on("unhandledRejection", (err) => {
    console.log(`Unhandled Rejection: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});

process.on("uncaughtException", (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});


export default server;