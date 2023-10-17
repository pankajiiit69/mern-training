const {JWT_KEY} = require('../constants')
const jwt = require('jsonwebtoken')
const UserModel = require('../schema/user')

const authUserMiddleware = async (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    console.log('Middle called');
    const token = req.header('Authorization');
    if (!token) {
        console.error(`Unauthenticated request !!!`);
        res.status(401).send("Unauthenticated request !!!")
    } else {
        try {
            const payloadObj = jwt.verify(token, JWT_KEY);
            console.log('Token User Info: ' + payloadObj.username);
            const dbUser = await UserModel.findOne({"username":payloadObj.username});
            if(dbUser){
                req.loggedInUserEmail = dbUser.email;
                next();
            }else{
                res.status(400).send({ "staus": "User Not found" });
            }
            
            //const user = await validateJwtToken(token);
        } catch (error) {
            console.debug(error);
            console.error(`Request Authentication failed !!!`);
            res.status(500).send("Error occured while Request Authentication")
        }
    }

}

module.exports = {authUserMiddleware};