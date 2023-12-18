import express from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import './mongodb.mjs';
import 'dotenv/config';
import authRouter from './routes/auth.mjs'
import profileRouter from './routes/profile.mjs'
import feedRouter from './routes/feed.mjs'
import postRouter from './routes/post.mjs'

const __dirname = path.resolve();
const app = express();
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1", authRouter)


app.use("/api/v1", (req, res, next) => {
    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log("decoded: ", decoded);
        req.body.decoded = {
            _id: decoded._id,
            isAdmin: decoded.isAdmin,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            email: decoded.email,
        }
        next();
    }
    catch (e) {
        res.status(401).send({ message: "Invalid token" })
    }
})

app.use("/api/v1", postRouter)
app.use("/api/v1", profileRouter)
app.use("/api/v1", feedRouter)

app.use('/', express.static(path.join(__dirname, './web/build')))
app.get('*', (req, res, next) => {
    res.sendFile(path.join(__dirname, './web/build/index.html'))
})


//Server is running on that port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Example server listening on port ${PORT}`)
})