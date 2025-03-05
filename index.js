require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { z } = require("zod");
const app = express();
app.use(express.json());
app.use(cors());
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb+srv://jhakritagya45:Kritagya123Jha@cluster0.ackty.mongodb.net/sample_mflix', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB successfully!"))
.catch(err => console.error("❌ MongoDB connection error:", err));

  
const database=new mongoose.Schema({
    username:String,
    password:String
})

const data=mongoose.model("data",database);

const JWT_SECRET = process.env.JWT_SECRET || "KP72";

const userSchema=z.object({
    username:z.string().nonempty().email(),
    password:z.string().min(6).nonempty()
})
app.get("/", (req, res) => {
    res.send("Server is Running!");
});


app.post("/register",async(req,res)=>{
    const {username,password} = req.body;
    const validate=userSchema.safeParse({username,password});
    if(!validate.success){
        return res.status(400).json({message:"Invalid Input"});
    }else{
        const newuser=new data({
            username:username,
            password:password
        })
        await newuser.save();
        return res.status(200).json({message:"Successfully Registered"});
    }
})
app.post("/login",async(req,res)=>{
    const {username,password}=req.body;
    const validate=userSchema.safeParse({username,password});
    if(!validate.success){
        return res.status(400).json({message:"Invalid Input"});
    }else{
        const userexist=await data.findOne({username})
        if(!userexist){
            return res.status(400).json({error:"User does not exist"});
        }else{
            if(password===userexist.password){
                const token=jwt.sign({username:username},JWT_SECRET);
                return res.json({
                    message:"Successfully Logged In",
                    token:token
                });
        }else{
            return res.status(400).json({error:"Invalid Password"});
        }
    }
}
})

app.listen(5000,()=>{
    console.log("Server is running on port 5000");
})