import { log } from 'console';
import express from  'express' ;
import path from "path";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt  from 'jsonwebtoken';
import bcrypt from "bcrypt";


const app = express();
const users =[];

const isAuthenticated = async (req,res ,next) =>{
   const {token }= req.cookies
 if(token){
   const decoded = jwt.verify(token, "njdjnnjdui");
   req.user = await User.findById(decoded._id) 
   next()
 }
 else{
   res.render("login");
 }
}
mongoose.connect("mongodb://127.0.0.1:27017/", {
   dbName: "Backend",
}).then(() => console.log("database is connected"))
.catch((e)=> console.log("e")
)
const Userschema = new mongoose.Schema({
   name : "string",
   email: "string",
   password:"string",
})
const User = mongoose.model("User", Userschema)

// using middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());

// Setting up View Engine
app.set("view engine", "ejs");

app.get("/", isAuthenticated, (req, res)=>{
   console.log(req.user); 
 res.render("logout.ejs", {name: req.user.name})
})

app.get("/login", (req,res)=>{
   res.render("login.ejs")
})

app.get("/register.ejs", (req,res)=>{
    res.render("register.ejs")
})

//
app.post("/register.ejs",  async(req,res) => {
     
    const { name , email , password} = req.body;

     let user =  await User.findOne({email}) 
      if(user){
         return res.redirect("/login")
      } 
      const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });
    const token = jwt.sign({_id:user._id},"njdjnnjdui");
   
   res.cookie("token" , token);
   res.redirect("/");
});

app.post("/login.ejs",  async (req,res)=>{
   const { name , email , password} = req.body;
   let user =  await User.findOne({email}) 
    if(!user){
       return res.redirect("/register.ejs")
    } 
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.render("login",{ email, message :" password is incorrect"})
    }
    const token = jwt.sign({_id: user._id},"njdjnnjdui");
   
    res.cookie("token" , token,{
      httpOnly: true,
      
    });
    res.redirect("/");
    
})


//
app.get("/logout.ejs", (req,res) => {
   res.cookie("token",null , {
      expires:  new Date(Date.now()),
   })
   res.redirect("/");
});
//
app.listen(5000, ()=>{
   console.log("server is running");
})