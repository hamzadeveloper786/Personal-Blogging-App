import express from 'express';
import { ObjectId } from 'mongodb';
import {client} from './../mongodb.mjs';
const db = client.db("personal-blogging-app");
const users = db.collection("users");
const col = db.collection("posts");
let router = express.Router();

const profileMiddlewear = async (req, res, next) =>{
    const userId = req.params.userId || req.body.decoded._id;
    if(!ObjectId.isValid(userId)){
        res.status(403).send({message: "Invalid User Id!"});
        return;
    }
    try{
    let profile = await users.findOne({_id : new ObjectId(userId)})
    res.status(200).send({
        message: "Profile fetched successfully!",
        data:{
            _id: profile._id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            createdAt: profile.createdAt,
        }
    });
}catch(e){
    console.log("Server Error!", e)
    res.status(500).send({message:("Server Error!")});
}
}
router.get('/profile', profileMiddlewear);
router.get('/profile/:userId', profileMiddlewear);

router.get('/user/posts', async(req, res, next) => {
    console.log('Finding a user Posts!', new Date());

    const userId = req.query._id || req.body.decoded._id

    if(!ObjectId.isValid(userId)){
        res.status(403).send({message: "User id must be a valid number!!"});
        return;
    }

    const cursor = col.find({author_id: new ObjectId(userId)})
        .sort({_id:-1})
        .limit(100);
     try{
            let results = await cursor.toArray();
            console.log("results: ", results);
            res.send(results);
        }catch(e){
            console.log("Error in Mongodb ", e);
            res.status(500).send({message: "Server Error. Try again later!"})
        }
})

export default router;