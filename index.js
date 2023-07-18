import fs from "fs"
import path from "path"
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"




const app= express();

// Write down following as it is 
// Setting up view engine
//---> agr set na kro to file ke sath extension dena padega 

app.set("view engine", "ejs"); 



// * >> we have set our static folder permanently
// no need rto write extension
express.static(path.join(path.resolve(),"public"));  //! >> It is a middleware and can not be used directly , to use this , use 'app.use;'

//connection mongoDb 
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"Backend"
}).then(
    ()=>{
        console.log("Database connected ! ");
    }
).catch((e)=>{
    console.log(e);
})


// Creating database schema !! 
const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

// creating collection/modal
const User = mongoose.model("User",userSchema); 





//# >> Using Middlewares
app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// declaring an user array to store user data :






 


// use of req,res and next 
const isAuthenticated= async (req,res,next)=>{
    const {token}= req.cookies;
    if(token)
    {
       const decoded= jwt.verify(token, "sdbhjlcndcskjdfn")
       console.log(decoded);

    //    If user is loged in save his data in an variable
            req.user= await User.findById(decoded._id);
        next()  
     }

     else{
        console.log("Redirect to login page !!");
        res.redirect("/login")
     }
}


app.get("/",isAuthenticated, (req,res)=>{   
  console.log(req.user);
   res.render("logout",{name:req.user.name})
});

app.get("/login",(req,res)=>{
    console.log("Come into login page");
     res.render("login")
})



// register new user 
app.get("/register", (req,res)=>{   
    console.log(req.user);
     res.render("register")
  });


app.get("/logout", (req,res)=>{
    res.cookie("token", null,{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.redirect("/")

})


app.post("/login", async (req,res)=>{
    console.log("form submitted and post method of login is called ! ");
    const {email,password} = req.body;
    console.log(email,password);
   let user= await User.findOne({email})

   if(!user)
   {
    console.log("New email , so redirection to register page !!");
    res.redirect("/register")
   }
        console.log("Password matching !!");
   const isMatch= user.password === password; 
   console.log("Printing ismatch: ", isMatch);

   if(!isMatch) return res.render("login",{message:"Incorrect Password !!"})

   const token= jwt.sign({_id:user._id},"sdbhjlcndcskjdfn")
   console.log(token);

   res.cookie("token",token,{
       httpOnly:true,
       expires:new Date(Date.now()+ 60*1000) 
   });
   console.log("Redirecting to home ");

   res.redirect("/login");

})

app.post("/register", async (req,res)=>{
    const {name,email,password}= req.body;
    console.log(req.body); 
  
    // search thet email is already exist or not
    let user= await User.findOne({email});
    if(user)
    { 
        console.log("Entered ");
        // agr user wxist krta hai to login page pr redirect kr di
        return res.redirect("/login")
    }

    // creating new user by login data 
   user= await User.create({
        name,
        email,
        password,
   
   })


    const token= jwt.sign({_id:user._id},"sdbhjlcndcskjdfn")
    console.log(token);

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+ 60*1000)
    });

    res.redirect("/");
})


 



app.listen(5000,()=>{
    console.log("Server is working ");
})