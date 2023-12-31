const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    matchProfile: {type: mongoose.Schema.Types.ObjectId, ref:'Profile'},
    //groomMatchId: {type: mongoose.Schema.Types.ObjectId, ref:'Profile'},
    isProfileVerified :{type: String},
    status:{type: String, required:true}
    // additional feilds
});
const MatchModel = mongoose.model('Match', matchSchema, 'match');

module.exports = MatchModel;