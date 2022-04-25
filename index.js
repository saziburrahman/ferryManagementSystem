const express = require('express');
let ejs = require('ejs');
const app = express();
var bodyParser = require('body-parser')
const database = require('./modals/database');
const employeeSchema = require("./modals/employeeSchema")
const ferryNameSchema = require("./modals/ferryNameSchema");
const routeNameSchema = require("./modals/routeNameSchema");
const timeSchedule = require("./modals/timeSchema");
const scheduleSchema = require("./modals/scheduleSchema");
const ticketSchema = require("./modals/ticketSellingSchema");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
PORT = 8000;

app.set('views','./views');
app.set("view engine", "ejs");
const path = require('path');
const { redirect } = require('express/lib/response');

app.use(express.static('public'));
let x=0;

app.get('/',(req,res)=>{
    res.render('index',{title: x});
});

app.get('/ticketinfo',(req,res)=>{
    ticketSchema.find((err,ticketsInfo)=>{
        if (!err) 
        {
            res.render('ticketInfo',{ticketsInfo:ticketsInfo});
        }
    })
});

app.get("/employeeEdit/:id",(req,res)=>{

    employeeSchema.findById(req.params.id,(err,employee)=>{
        if (!err) {
            res.render("editEmployeeInfo",{employee:employee});
        }
    })

})


app.post("/employeeEdit/:id",(req,res)=>{
    var employeeUpdateInfo = {
        nameInput:req.body.nameInput ,
        address:req.body.address ,
        email:req.body.email ,
        password:req.body.password ,
        confirmPass:req.body.confirmPass,
        joinDate:req.body.joinDate,
        contactNumber:req.body.contactNumber ,
        gender:req.body.gender
    }

    employeeSchema.findByIdAndUpdate(req.params.id,employeeUpdateInfo,(err)=>{
        if (!err) 
        {
            console.log("Updated Employee Info Sucessfully");
            res.redirect("/employeelist");
            return;
        }
    })
})

app.get("/emplyeeDelete/:id",(req,res)=>{
    employeeSchema.findByIdAndDelete(req.params.id,(err)=>{
        if (!err) {
            console.log("deleted Employee Info SucessFully");
            res.redirect("/employeelist");
            return;
        }
    })
})

app.post("/ticket",(req,res)=>{

    scheduleSchema.find({
        timeSchedule:req.body.timeSchedule,
        ferryName:req.body.ferryName
    },(err,schedulInfo)=>{
        if(!err)
        {
            let ticketFor =req.body.tickeFor;
            var avSpace =0;
            var weight =0;
            if (ticketFor == 'Bus' || ticketFor == 'Truck') {
                weight = 10000 * parseInt(req.body.vehicleQuantity)
                avSpace = parseInt(schedulInfo[0].space)-parseInt(weight);
            }
            if (ticketFor == 'Microbus') {
                weight= 5000 * parseInt(req.body.vehicleQuantity);
                avSpace = parseInt(schedulInfo[0].space)-parseInt(weight);
            }
            if (ticketFor == 'Motorbike') {
                weight= 100 * parseInt(req.body.vehicleQuantity);
                avSpace = parseInt(schedulInfo[0].space)-parseInt(weight);
            }
            if (ticketFor == 'Passanger') {
                weight= 65 * parseInt(req.body.passangerQuantity);
                avSpace = parseInt(schedulInfo[0].space)-parseInt(weight);
            }
            scheduleSchema.findByIdAndUpdate(schedulInfo[0].id,{space:avSpace},(err)=>{
                if (!err) {
                    console.log("SucessFully Updated Available Space");
                }
            })
            console.log(avSpace);
        }
    })

    var ticketData;
    var vehiclePrice = parseInt(req.body.vehicleQuantity)*500
    var passangerPrice = parseInt(req.body.passangerQuantity)*50
    var date_format = new Date();
    var ticket_id = "BDF"+ date_format.getDate() + date_format.getMonth() + date_format.getFullYear() + date_format.getHours() + date_format.getMinutes() + date_format.getSeconds()


    console.log(passangerPrice);
    console.log(vehiclePrice);
    if (req.body.tickeFor == 'Passanger') {
        ticketData = {
            tickeFor:req.body.tickeFor ,
            routeName:req.body.routeName ,
            passangerName:req.body.passangerName ,
            passangerNumber:req.body.passangerNumber ,
            passangerQuantity:req.body.passangerQuantity ,
            passangerDate:req.body.passangerDate ,
            timeSchedule:req.body.timeSchedule ,
            ferryName:req.body.ferryName,
            price:passangerPrice,
            ticketId:ticket_id,
        }
    }
    if (req.body.tickeFor != 'Passanger') {
        ticketData = {
            tickeFor:req.body.tickeFor ,
            routeName:req.body.routeName ,
            vehicleName:req.body.vehicleName ,
            vehicleNumber:req.body.vehicleNumber ,
            vehicleQuantity:req.body.vehicleQuantity ,
            dateForVehicle:req.body.dateForVehicle ,
            timeSchedule:req.body.timeSchedule ,
            ferryName:req.body.ferryName,
            price:vehiclePrice,
            ticketId:ticket_id
        }
    }



    let saveData = ticketSchema(ticketData);

    saveData.save()
    .then(()=>{
        console.log("Successfully Save Ticket Info");
        res.redirect("/ticketSelling")
    })
    .catch((err)=>{
        console.log(err);
    })

})

app.get('/ferrylist',(req,res)=>{
    scheduleSchema.find((err,ferrySchema)=>{
        if (!err) {
            res.render('ferrylist',{ferrySchema:ferrySchema});
        }
    })
});

app.get('/employeelist',(req,res)=>{

    employeeSchema.find((err,employee)=>{
        if (!err) {
            res.render("employeelist",{employee:employee});
        }
    })
});



app.post('/login',(req,res)=>{
    const {useName,passord} = req.body;
    if(useName=="admin@gmail.com" && passord==1234){
        res.redirect("/admin/index.html");
    
        x=0;
    }
    
    else if(useName=="user@gmail.com" && passord==12345){
        res.redirect("/ticketSelling");
        x=0;
    }
    else{
        
        res.redirect('/');
        x=1;
    }
});


app.get('/admin/index.html',(req,res)=>{
    res.render('adminindex');
});


app.get('/ticketSelling',(req,res)=>{
    routeNameSchema.find((err,routeName)=>{
        if (!err) {
            timeSchedule.find((err,times)=>{
                if (!err) 
                {
                    res.render('newFerry',{routeName:routeName,times:times});
                }
            })
        }
    })
});



app.get("/profileIndex/:id",(req,res)=>{
    employeeSchema.findById(req.params.id,(err,employee)=>{
        if (!err) {
            res.render("profileIndex",{employee:employee});
        }
    })
})


app.get("/employeeRegistration",(req,res)=>{
    res.render('employeeRegistration')
});


app.post("/employeeRegistration",(req,res)=>{

    var date_format = new Date();
    var employee_id = "EMBDF"+ date_format.getDate() + date_format.getMonth() + date_format.getFullYear() + date_format.getHours() + date_format.getMinutes() + date_format.getSeconds()

    var employeeRegInfo = {
        nameInput:req.body.nameInput ,
        address:req.body.address ,
        email:req.body.email ,
        password:req.body.password ,
        confirmPass:req.body.confirmPass,
        joinDate:req.body.joinDate,
        contactNumber:req.body.contactNumber ,
        gender:req.body.gender,
        emplyeeid:employee_id
    }


    let saveInfo = employeeSchema(employeeRegInfo);

    saveInfo.save()
    .then(()=>
    {
        console.log("Saved Successfully");
        res.redirect("/employeelist");
    })
    .catch((err)=>
    {
        console.log(err);
    })
});


app.get("/ferryRegistration",(req,res)=>{
    ferryNameSchema.find((err,ferryName)=>{
        if(!err)
        {
            routeNameSchema.find((err,routeName)=>{
                if (!err) {
                    timeSchedule.find((err,times)=>{
                        if (!err) 
                        {
                            res.render("ferryRegistration",{ferryName:ferryName,routeName:routeName,times:times});
                        }
                    })
                }
            })
        }
    })
});


app.post("/ferryName",async (req,res)=>{
    let ferryName = req.body.data;
    console.log(ferryName);
    let values = await scheduleSchema.find({ferryTime:ferryName});
    res.send({data:values});
    
});


app.post("/ferryRegistration",(req,res)=>{
    var scheduleInfoValue = {
        ferryName:req.body.ferryName,
        ferryRoute:req.body.ferryRoute,
        ferryTime:req.body.ferryTime,
        dateInput:req.body.dateInput,
        space:10000000
    }


    let saveInfo = scheduleSchema(scheduleInfoValue);

    saveInfo.save()
    .then(()=>{
        console.log("Sucessfully Save");
        res.redirect("/ferrylist")
    })
    .catch((err)=>{
        if (err) {
            console.log(err);
        }
    })
})


app.post("/addRouteName",(req,res)=>{
    const data = {
        routeName:req.body.routeName
    }

    let saveName = routeNameSchema(data);
    saveName.save()
    .then(()=>{
        console.log("Route Name Added");
    })
    .catch((err)=>{
        console.log(err);
    })
    res.redirect("/addFerryRoute")
})


app.get("/addFerryRoute",(req,res)=>{
    routeNameSchema.find((err,routeName)=>{
        if(!err)
        {
            res.render("addFerryRoute",{routeName:routeName});
        }
    })
})

app.get("/deleteRoute/:id",(req,res)=>{
    routeNameSchema.findByIdAndDelete(req.params.id,(err)=>{
        if (!err) {
            console.log("deleted Succesfully");
            res.redirect("/addFerryRoute");
        }
    })
})


app.get("/ferryEdit/:id",(req,res)=>{
    ferryNameSchema.find((err,ferryName)=>{
        if(!err)
        {
            routeNameSchema.find((err,routeName)=>{
                if (!err) {
                    timeSchedule.find((err,times)=>{
                        if (!err) 
                        {
                            res.render("editFerrySchedule",{ferryName:ferryName,routeName:routeName,times:times});
                        }
                    })
                }
            })
        }
    })
    
})



app.post("/ferryEdit/:id",(req,res)=>{
    var scheduleInfoValue = {
        ferryName:req.body.ferryName,
        ferryRoute:req.body.ferryRoute,
        ferryTime:req.body.ferryTime,
        dateInput:req.body.dateInput,
    }

    scheduleSchema.findByIdAndUpdate(req.params.id,scheduleInfoValue,(err)=>{
        if (!err) {
            console.log("Sucessfully Uodated Schedule Info");
            res.redirect("/ferrylist");
        }
    })
    
})

app.get("/ferryDelete/:id",(req,res)=>{
    scheduleSchema.findByIdAndDelete(req.params.id,(err)=>{
        if (!err) {
            console.log("successfully Deleted");
            res.redirect("/ferrylist");
        }
    })
})


app.get("/ferryNameDelete/:id",(req,res)=>{
    ferryNameSchema.findByIdAndDelete(req.params.id,(err)=>{
        if (!err) {
            console.log("deleted Succesfully");
            res.redirect("/addFerryName");
        }
    })
})

app.post("/addFerryName",(req,res)=>{
    const data = {
        ferryName:req.body.ferryName
    }

    let saveName = ferryNameSchema(data);
    saveName.save()
    .then(()=>{
        console.log("Ferry Name Added");
    })
    .catch((err)=>{
        console.log(err);
    })
    res.redirect("/addFerryName")
})


app.get("/addFerryName",(req,res)=>{
    ferryNameSchema.find((err,ferryName)=>{
        if (!err) {
            res.render("addFerryName",{ferryName:ferryName});
        }
    })

    
})



app.get("/addTimeSchedule",(req,res)=>{
    timeSchedule.find((err,times)=>{
        if (!err) {
            res.render("addTimeSchedule",{times:times})
        }
    })
})

app.get("/deleteTime/:id",(req,res)=>{
    timeSchedule.findByIdAndDelete(req.params.id,(err)=>{
        if (!err) {
            console.log("successfully Delete Time");
            res.redirect("/addTimeSchedule");
        }
    })
})

app.post("/addTimeSchedule",(req,res)=>{
    var time = {
        timeSchedule:req.body.timeSchedule,
    }

    let saveTime = timeSchedule(time);

    saveTime.save()
    .then(()=>{
        console.log("Successfully Saved");
        res.redirect("/addTimeSchedule");
    })
    .catch((err)=>{
        console.log(err);
    })
})



app.listen(PORT,(req,res)=>{
    console.log(`http://localhost:${PORT}`);
});



