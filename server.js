/**
 * Created by zhangyuxi on 2017/3/7.
 */
var express=require('express'),
    app=express(),
    mongoose = require('mongoose'),
    bodyParser=require("body-parser"),
    session = require('express-session'),
    MongoDBStore = require('connect-mongodb-session')(session);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/MEANtest");
var schema=mongoose.Schema;
var userDataSchema=new schema({
    username:String,
    password:String},{collection:"userdata"});
var userDataModel=mongoose.model("userDataModel",userDataSchema);
var studentSchema=new schema({
    class:String,
    name:String,
    subject1:Number,
    subject2:Number,
    subject3:Number
},{collection:"studentData"});
var studentDataModel=mongoose.model("studentDataModel",studentSchema);

//express-session
var store=new MongoDBStore({
    uri:"mongodb://localhost:27017/MEANtest",
    collection:"MEANtest_session"
});
var session_obj="";
app.use(
    session({
        secret:'marlabs_sess_secret_key',
        resave: true,
        saveUninitialized: true,
        store: store
    })
);
// RESTfulAPI
app.post("/api/register",function(req,res){
    var newUser={
        username:req.body.username,
        password:req.body.password
    };
    userDataModel.create(newUser,function(err,data){
        if(err){
            res.send(err);
        }else{
            req.session.isloggedIn=true;
            req.session.currentUser=data;
            res.json(data);
        }
    })
});
app.post("/api/login",function(req,res){
    var loginUser={
        username:req.body.username,
        password:req.body.password
    };
    userDataModel.findOne({username:loginUser.username, password: loginUser.password},function(err,data){
        if(err){
            res.send("error has occured!");
        } else {
            if (data === null) {
                res.send("404");
            } else if (data !== null) {
                req.session.isloggedIn=true;
                req.session.currentUser=data;
                res.json(data);
            }
        }
    });
});
app.post("/api/addStudent",function(req,res){
    var newStudent=req.body;
    studentDataModel.create(newStudent,function(err,data){
        if(err){
            res.send(err);
        }else{
            res.json(data);
        }
    })
});
app.post("/api/studentsInClass",function(req,res){
    var classname=req.body.classname;
    studentDataModel.find({class:classname},function(err,data){
        if(err){
            res.send("error has occured!");
        } else {
            if (data === null) {
                res.send("404");
            } else if (data !== null) {
                res.json(data);
            }
        }
    });
});
app.post("/api/findStudentByNameAndClass",function(req,res){
    var student=req.body;
    studentDataModel.findOne({class:student.classname,name:student.studentname},function(err,data){
        if(err){
            res.send("error has occured!");
        } else {
            if (data === null) {
                res.send("404");
            } else if (data !== null) {
                res.json(data);
            }
        }
    });
});
app.use("/",express.static(__dirname+"/public"));

store.on('error', function(error) {
    console.log(error)
});

app.listen(3000);
