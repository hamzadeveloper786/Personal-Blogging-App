import express from 'express';
import { client } from '../mongodb.mjs';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { stringToHash, verifyHash } from "bcrypt-inzi";
const userCollection = client.db("personal-blogging-app").collection("users");
let router = express.Router();

//login api
router.post('/login', async (req, res, next) => {
    //check all parameters are given or not
    if (!req.body?.email || !req.body?.password) {
        res.status(403).send({message: (`Required Parameter Missing!
        Example request body:{
            email:"abc@gmail.com",
            password:"********",
        }`)});
        return;
    };
    //convert email into lower case
    req.body.email = req.body.email.toLowerCase();
    try {
        //finding this user are exist or not
        let result = await userCollection.findOne({ email: req.body.email });
        if (!result) {
            res.status(401).send({ message: ("Email or Password Incorrect!") })
            return;
        } else {
            //verifying a password is correct or not
            const isMatch = await verifyHash(req.body.password, result.password);
            if (isMatch == true) {
                //create a token
                const token = jwt.sign({
                    _id: result._id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: req.body.email,
                },
                    process.env.SECRET, {
                    expiresIn: '24h',
                });

                res.cookie('token', token,
                    {
                        httpOnly: true,
                        secure: true,
                        expires: new Date(Date.now() + 86400000)
                    });
                res.status(200).send({
                    message: "Login Successful!",
                    data: {
                        _id: result._id,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        email: req.body.email,
                    }
                })
                return;
            } else {
                res.status(401).send({ message: ("Email or Password Incorrect!") })
                return;
            }
        }
    }
    catch (e) {
        console.log("Error in Mongodb ", e);
        res.status(500).send({message: ("Server Error. Try again later!")})
    }
})
//logout api
router.post('/logout', async (req, res, next) => {
    res.clearCookie('token');
    res.status(200).send({ message: "Logout Successfully!" });
    return;
})
//signup api
router.post('/signup', async (req, res, next) => {
    //check all parameters are given or not
    if (!req.body?.firstName || !req.body?.lastName || !req.body?.email || !req.body?.password) {
        res.status(403).send({message: (`Required Parameter Missing!
        Example request body:{
            firstName:"First Name",
            lastName:"Last Name",
            email:"abc@gmail.com",
            password:"********",
        }`)});
        return;
    };
    //convert email to lower case
    req.body.email = req.body.email.toLowerCase();

    try {
        //finding a user is already exist or not
        let results = await userCollection.findOne({ email: req.body.email });
        console.log("results ", results);
        if (!results) {
            //convert password to hash
            const passwordHash = await stringToHash(req.body.password);
            //Insert response in database
            const insertResponse = await userCollection.insertOne({
                isAdmin: false,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: passwordHash,
                createdAt: moment().format('llll'),
            });
            console.log("Insert Response  ", insertResponse);
            res.status(200).send({ message: ('User created successfully!') });
        } else {
            res.status(403).send({ message: ("User already exists with email!") });
        }
    } catch (e) {
        console.log("Error in Mongodb ", e);
        res.status(500).send({message: ("Server Error. Try again later!")})
    }
})

export default router