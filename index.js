const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose');
const {authUserMiddleware} = require('./middlewareA/authUserMiddleware')
const userRouter = require('./routes/userRoute')
const profileRouter = require('./routes/profileRoute')
const PORT = process.env.MATRIMONIAL_APP_PORT || 3000
var cors = require('cors');
//const bodyParser = require('body-parser')
//const authUserFilter = require('./middleware/authUserMIddleware')

const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};
mongoose.connect("mongodb://localhost:27017/matrimonial", options).
        catch(error => console.log(error));
console.log('Mongo connected');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/user', userRouter);
app.use('/profile', authUserMiddleware , profileRouter);


//app.use('/updateProfile', authUserFilter);
app.get('/test', (req, resp) => {
    resp.status(200).send({"status":"Running"});
})

app.listen(PORT, () => {
    console.log(`Express Server is up and running on port ${PORT}`);
})
