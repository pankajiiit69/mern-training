const express = require('express')
const multer  = require('multer')
const UserModel = require('../schema/user')
const ProfileModel = require('../schema/profile')
const MatchModel = require('../schema/match')
const profileRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'D:/Codes/mern-training/uploads')
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const uploadedFileName = uniquePrefix + '-' + file.originalname;
        cb(null, uploadedFileName)
        req.uploadedFileName = uploadedFileName;
    }
})
const upload = multer({ storage: storage })

profileRouter.post('/saveprofile', (req, resp) => {
    const profile= req.body;
    console.log(`Email:${profile.email}`);
    UserModel.findOne({"email":profile.email})
    .then(async data =>{
        console.log(data);
        if(data){
            const profileModel = new ProfileModel (profile);
            profileModel.user = data;
            profileModel.save();
            console.log('profilesaved');
            resp.status(200).send({ "staus": "Profile Saved" });
        }else{
            resp.status(400).send({ "staus": "User Account Not found" });
        }
    }).catch(error => {
        console.log(error);
        resp.status(500).send({ "staus": "Something went wrong while creating profile" });
    });
    //resp.status(500).send({ "staus": "Something went Wrong" });
    //const user = UserModel.find({"email":profile.email});
    //if(!user){
    //    resp.status(500).send({ "staus": "User Account Not found" });
    //}
})


profileRouter.get('/getProfileByEmail',  async (req, resp)=>{
    const profile = await ProfileModel.findOne({"email":req.query.email});//.populate('user').exec();
    resp.json(profile);
})


profileRouter.post('/updateProfile', async (req, resp) => {
    const reqProfile= req.body;
    console.log(`Email:${req.loggedInUserEmail}`);
    let dbProfile = await ProfileModel.findOne({"email":req.loggedInUserEmail});
    if(reqProfile.fullname){
        dbProfile.fullname = reqProfile.fullname;
    }
    if(reqProfile.address){
        dbProfile.address = reqProfile.address;
    }
    //dbProfile = {...dbProfile, ...updatedProfile};
    await dbProfile.save();
    console.log('profile updated');
    resp.status(200).send({ "staus": "Profile updated" }); 
    
})

profileRouter.get('/getAllProfile',  async (req, resp)=>{
    console.log('Calling getAllProfile');
    const allProfile = await ProfileModel.find();
    console.log('Finishing getAllProfile');
    resp.json(allProfile);
});


profileRouter.post('/matchRequest', async(req, resp)=>{
    
    console.log(`Email:${req.loggedInUserEmail}`);
    let requesterProfile = await ProfileModel.findOne({"email":req.loggedInUserEmail});
    
    let matchProfile = await ProfileModel.findOne({"_id":brideMatchId});
    if(matchProfile){
        const matchJson = req.body;
        const match = new MatchModel(matchJson);
        await match.save();
        
/*        if(!requesterProfile.matches){
            requesterProfile.matches=[];
        } */
        requesterProfile.matches.push(match);
        await requesterProfile.save();
        resp.status(200).send({ "staus": "Match Requested" }); 
    }else{
        resp.status(400).send({ "staus": "Match Profile Not found" });
    }
})

profileRouter.post('/uploadFile', upload.single('file'), async(req, resp)=>{
    console.log('File Uploaded');
    console.log(`Logged in User Email:${req.loggedInUserEmail}`);
    let dbProfile = await ProfileModel.findOne({"email":req.loggedInUserEmail});
    dbProfile.profilePhotoId = req.uploadedFileName;
    await dbProfile.save();
    resp.json({"fileStatus" :'File uploaded'});
})

module.exports = profileRouter;