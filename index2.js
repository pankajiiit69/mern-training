const http = require('http');
const mongoose = require('mongoose');
const UserModel = require('./schema/user');

const mongoURI = "mongodb://localhost:27017/matrimonial";
const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

const connectToMongo = ()=>{
    mongoose.connect("mongodb://localhost:27017/matrimonial", options).
        catch(error => console.log(error));
    console.log('Mongo connected');
}

connectToMongo();

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Set the response HTTP header with HTTP status and Content type

    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Enter</title></head>')
        res.write('<body>Hello Inventics</body>')
        res.write('</html>');
        return res.end();
    }else if (req.url === '/add') {
        const user = {usrename:"user1", password:'abc12345'}
        UserModel.create(user).then((result) => {
            console.log('User Created');
        })
        res.write(JSON.stringify(user));
        return res.end();
    }

    if (url === '/message' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        })

        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            fs.writeFile('message.txt', message, (err) => {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end();
            });
        });
    }
    //res.writeHead(200, {'Content-Type': 'text/plain'});

    // Send the response body "Hello, World! Mongoose connected to MongoDB."
    //res.end('Hello, World! Mongoose connected to MongoDB.\n');
});

// Listen for requests on port 3000 and print a message to the console
server.listen(3000, 'localhost', () => {
    console.log('Server is running on port 3000');
});