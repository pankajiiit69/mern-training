const express = require('express')
const multer = require('multer')
const UserModel = require('../schema/user')
const ProfileModel = require('../schema/profile')
const MatchModel = require('../schema/match')
const profileRouter = express.Router();

const { validationResult } = require('express-validator')
const { createProfileValidator } = require('../validator/ProfileValidator')

const processValidation = (req) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        console.error(`Validation Error ${JSON.stringify(result)}`);
        return `Validation Error ${JSON.stringify(result)}!`;
    }
}

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

profileRouter.post('/saveprofile', createProfileValidator, (req, resp) => {
    const validationError = processValidation(req);
    if(validationError){
        return resp.status(401).send(validationError);
    }
    const profile = req.body;
    console.log(`Email:${profile.email}`);
    UserModel.findOne({ "_id": req.loggedInUser })
        .then(async data => {
            console.log(data);
            if (data) {
                try {
                    profile.user = data;
                    const profileModel = new ProfileModel(profile);
                    await profileModel.save();
                    console.log('profilesaved');
                    resp.status(200).send({ "staus": "Profile Saved" });
                } catch (err) {
                    resp.status(500).send({ staus: "Invalid Profile data", message: err.message });
                }
            } else {
                resp.status(400).send({ "staus": "User Account Not found" });
            }
        }).catch(error => {
            console.log(error);
            resp.status(500).send({ "staus": "Something went wrong while creating profile", "message": error });
        });
    //resp.status(500).send({ "staus": "Something went Wrong" });
    //const user = UserModel.find({"email":profile.email});
    //if(!user){
    //    resp.status(500).send({ "staus": "User Account Not found" });
    //}
})


profileRouter.get('/getProfileByEmail', async (req, resp) => {
    const profiles = await ProfileModel.find({ "email": req.query.email }).select('fullname gender');//.populate('user').exec();
    if (profiles && profiles[0]) {
        resp.json(profiles[0]);
    } else {
        resp.status(400).send({ "staus": "Profile Not found" });
    }
})

profileRouter.get('/getMyProfile', async (req, resp) => {
    const profile = await ProfileModel.findOne({ "user": req.loggedInUser }).populate('matchSent matchRcvd');
    if (profile) {
        resp.json(profile);
    } else {
        resp.status(400).send({ "staus": "Profile Not found" });
    }
})


profileRouter.post('/updateProfile', async (req, resp) => {
    const reqProfile = req.body;
    try {
        let dbProfile = await ProfileModel.findOne({ "user": req.loggedInUser });
        Object.keys(reqProfile).forEach(key => dbProfile[key] = reqProfile[key]);
        /* if (reqProfile.fullname) {
            dbProfile.fullname = reqProfile.fullname;
        }
        if (reqProfile.address) {
            dbProfile.address = reqProfile.address;
        } */
        //dbProfile = {...dbProfile, ...updatedProfile};
        await dbProfile.save();
        console.log('profile updated');
        resp.status(200).send({ "staus": "Profile updated" });
    } catch (error) {
        console.error(error);
        resp.status(400).send({ "staus": "Profile update failed" });
    }

})

profileRouter.get('/getAllProfiles', async (req, resp) => {
    console.log('Calling getAllProfiles');
    const allProfile = await ProfileModel.find().select('-_id -matches');
    console.log('Finishing getAllProfile');
    resp.json(allProfile);
});

profileRouter.get('/searchProfiles', async (req, resp) => {
    console.log('Calling searchProfiles');
    let loggedInProfile = await ProfileModel.findOne({ "user": req.loggedInUser });
    const searchProfiles = loggedInProfile?.gender ? await ProfileModel.find({...(req.query), gender:loggedInProfile.gender==='M'?'F':'M'}).select(' -matches') : [];
    console.log('Finishing searchProfiles');
    resp.json(searchProfiles);
});

profileRouter.get('/getMatchProfiles', async (req, resp) => {
    console.log('Calling getMatchProfiles');
    const myProfile = await ProfileModel.findOne({ "user": req.loggedInUser }).populate('matchSent matchRcvd');
    const matchSentProfiles = myProfile?.matchSent ? await ProfileModel.find({_id: {$in : myProfile.matchSent.map(m => m.matchProfile)}}).select('-_id -matches'):[];
    const matchRcvdProfiles = myProfile?.matchRcvd ? await ProfileModel.find({_id: {$in : myProfile.matchRcvd.map(m => m.matchProfile)}}).select('-_id -matches'):[];
    console.log('Finishing getMatchProfiles');
    resp.json({matchSent: matchSentProfiles,matchRcvd:matchRcvdProfiles});
});


profileRouter.post('/matchRequest', async (req, resp) => {

    let requesterProfile = await ProfileModel.findOne({ "user": req.loggedInUser });
    if(requesterProfile.matches && requesterProfile.matchSent.filter(m => m.matchProfile ===req.body.matchProfileId).length>0){
        resp.status(400).send({ "staus": "Match Already Sent" });
    }
    if(requesterProfile.matches && requesterProfile.matcheRcvd.filter(m => m.matchProfile ===req.body.matchProfileId).length>0){
        resp.status(400).send({ "staus": "Match Already Recieved" });
    }
    let matchProfile = await ProfileModel.findOne({ "_id": req.body.matchProfileId });
    if (matchProfile) {
        //const matchJson = {};
        const match = await MatchModel.create({matchProfile:matchProfile._id, isProfileVerified:req.body.isProfileVerified, status:req.body.status});
        //await match.save(); 
        if(!requesterProfile.matchSent) {
            requesterProfile.matchSent = [];
        }
        requesterProfile.matchSent.push(match);
        if(!matchProfile.matcheRcvd) {
            matchProfile.matcheRcvd = [];
        }
        matchProfile.matcheRcvd.push(match);
        await requesterProfile.save();
        await matchProfile.save();
        resp.status(200).send({ "staus": "Match Requested" });
    } else {
        resp.status(400).send({ "staus": "Match Profile Not found" });
    }
})

profileRouter.post('/uploadFile', upload.single('file'), async (req, resp) => {
    console.log('File Uploaded');
    console.log(`Logged in User Email:${req.loggedInUser}`);
    let dbProfile = await ProfileModel.findOne({ "user": req.loggedInUser });
    dbProfile.profilePhotoId = req.uploadedFileName;
    await dbProfile.save();
    resp.json({ "fileStatus": 'File uploaded' });
})

module.exports = profileRouter;