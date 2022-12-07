const express = require ('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/User.js');
const Route = require('../models/Route.js');
const BusStop = require('../models/BusStop.js');
const Comment = require('../models/Comment.js');

const busRoutes = new Set(["20", "22", "70", "117", "260", "307", "592", "608", "681", "969"]);

router.post("/login", (req, res) => {
    req.session.role = 'admin';
    res.send();
});

router.use((req, res, next) => {
    if (req.session.role !== 'admin') {
        return res.status(401).send({msg: "Unauthorized"});
    }

    next();
});

//admin flush data
router.post("/flush", async (req, res) => {
    try {
        // remove routes and busstops collections before storing data
        await Promise.all([BusStop.deleteMany({}).exec(), Route.deleteMany({}).exec()]);
        
        /*
        inRoutes, outRoutes = {      busStops = [{        busStopsETA = {
            routeId,                    busStopId,          busStopId: [{
            busStops: [{                name,                   routeId,
                busStopId,              latitude,               dir,
                seq                     longitude               time
            }]                      }]                      }], ...
        }                                               }
        */
        const {inRoutes, outRoutes, busStops, busStopsETA} = req.body;
        
        const busStopDocs = await BusStop.insertMany(busStops.map(busStop => {  
            const timeForEachRoute = {}
            if (busStopsETA?.hasOwnProperty(busStop.busStopId)) {
                for (const {routeId, dir, time} of busStopsETA[busStop.busStopId]) {
                    if (!timeForEachRoute.hasOwnProperty(routeId)) {
                        timeForEachRoute[routeId] = {}
                    }
    
                    if (!timeForEachRoute[routeId].hasOwnProperty(dir)) {
                        timeForEachRoute[routeId][dir] = [];
                    }
    
                    const timeString = time == "" ? " " : new Date(time).toTimeString().split(' ')[0].substring(0,5);
                    timeForEachRoute[routeId][dir].push(timeString);
                }
            }

            const etaList = [];
            for (const routeId in timeForEachRoute) {
                for (const dir in timeForEachRoute[routeId]) {
                    etaList.push({routeId, dir, time: timeForEachRoute[routeId][dir]});
                }
            }

            return {
                ...busStop,
                eta: etaList
            }
        }));
        console.log("Bus Stop Data Stored");
        
        // map busStopId to ObjectId
        const busStopIdToObjectId = {};
        for (const {busStopId, _id} of busStopDocs) {
            busStopIdToObjectId[busStopId] = _id;
        }

        await Route.insertMany(inRoutes.map(({routeId, busStops}) => ({
            routeId,
            dir: "I",
            busStops: busStops.map(({busStopId, seq}) => ({busStop: busStopIdToObjectId[busStopId], seq}))
        })));

        await Route.insertMany(outRoutes.map(({routeId, busStops}) => ({
            routeId,
            dir: "O",
            busStops: busStops.map(({busStopId, seq}) => ({busStop: busStopIdToObjectId[busStopId], seq}))
        })));
        console.log("Route Data Stored");

        res.send({msg: "Done!"});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

/* admin CRUD actions for bus stop data */
// create bus stop
router.post("/bus-stops", async (req, res) => {
    let {busStopId, name, latitude, longitude, routeId, dir, seq} = req.body;
    
    if (!busStopId || !name || !latitude || !longitude || !seq) {
        return res.status(400).send({msg: "Please fill in all the fields!"});
    }

    if (!busStopId.match(/^[0-9]{6}$/)) {
        return res.status(400).send({msg: "Please enter a valid bus stop ID!"});
    }
    
    if (isNaN(latitude) || Math.abs(latitude) > 90) {
        return res.status(400).send({msg: "Please enter a valid latitude!"});
    }
    latitude = parseFloat(latitude);

    if (isNaN(longitude) || Math.abs(longitude) > 180) {
        return res.status(400).send({msg: "Please enter a valid longitude!"});
    }
    longitude = parseFloat(longitude);

    if (!routeId) {
        return res.status(400).send({msg: "Please choose a route!"});
    }
    
    if (!dir) {
        return res.status(400).send({msg: "Please choose a direction!"});
    }
    
    if (seq <= 0) {
        return res.status(400).send({msg: "Please enter a positive sequence number!"});
    }
    
    try {
        const route = await Route.findOne({routeId, dir, "busStops.seq": seq}).exec();
        if (route) {
            return res.status(400).send({msg: "Sequence number already exists in the route!"});
        }

        const busStop = await BusStop.create({busStopId, name, latitude, longitude, eta: []});
        await Route.updateOne({routeId, dir}, {$push: {busStops: {busStop: busStop._id,seq}}}).exec();

        res.send({msg: "Create bus stop successfully!"});
    }
    catch(err) {
        console.log(err);
        if (err.code === 11000) {
            res.status(409).send({msg: "Bus stop ID already exists!"});
        }
        else {
            res.status(500).send({err: "500 Server Error"});
        }
    }
});

//retrieve bus stops
router.get("/bus-stops", async (req, res) => {
    const routeId = req.query.routeId;

    try {
        let [inbound, outbound] = await Promise.all([
            Route.findOne({routeId, dir: "I"}).populate('busStops.busStop').select("-_id busStops").exec(),
            Route.findOne({routeId, dir: "O"}).populate('busStops.busStop').select("-_id busStops").exec()
        ]);

        const comparator = (stop1, stop2) => stop1.seq - stop2.seq;
        inbound = inbound ? inbound.busStops.sort(comparator) : [];
        outbound = outbound ? outbound.busStops.sort(comparator) : [];

        res.send({inbound, outbound});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

//update bus stop
router.put("/bus-stops/:busStopId", async (req, res) => {
    const busStopId = req.params.busStopId;
    const updateAttr = req.query.updateAttr;
    let {newValue} = req.body;
    
    try {
        if (updateAttr === "latitude") {
            if (isNaN(newValue) || Math.abs(newValue) > 90) {
                return res.status(400).send({msg: "Please enter a valid latitude!"});
            }
            newValue = parseFloat(newValue);
        }
        else if (updateAttr === "longitude") {
            if (isNaN(newValue) || Math.abs(newValue) > 180) {
                return res.status(400).send({msg: "Please enter a valid longitude!"});
            }
            newValue = parseFloat(newValue);
        }
        else if (updateAttr !== "name") {
            return res.status(400).send({msg: "Invalid attribute!"});
        }

        await BusStop.updateOne({busStopId}, {[updateAttr]: newValue}).exec();
        res.send({msg: `${updateAttr.charAt(0).toUpperCase() + updateAttr.slice(1)} is updated`});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// delete bus stop
router.delete("/bus-stops/:busStopId", async (req, res) => {
    const busStopId = req.params.busStopId;
    
    try {
        const deletedBusStop = await BusStop.findOneAndDelete({busStopId}).select("_id busStopId").exec();
        await Promise.all([
            Route.updateMany({}, {$pull: {busStops: {busStop: deletedBusStop._id}}}).exec(), 
            User.updateMany({}, {$pull: {favBusStopIds: deletedBusStop.busStopId}}).exec()
        ]);
        
        const comments = await Comment.find({busStopId: deletedBusStop.busStopId}).select("_id").exec();
        await Promise.all([
            Comment.deleteMany({busStopId: deletedBusStop.busStopId}).exec(),
            User.updateMany({}, {$pull: {comments: comments._id}}).exec()
        ]);

        res.send({ msg: "Bus stop is deleted" });
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

/* admin CRUD actions for user data */
// create user
router.post("/users", async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        res.status(400).send({msg: "Please fill in all the fields!"});
    }
    else if (username.length < 4 || username.length > 20) {
        res.status(400).send({msg: "The username should have 4-20 characters!"});
    }
    else if (password.length < 4 || password.length > 20) {
        res.status(400).send({msg: "The password should have 4-20 characters!"});
    }
    else {
        try {
            const user = await User.findOne({}).sort({userId: -1}).select("userId").exec();
            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                userId: user ? user.userId + 1 : 1,
                username,
                password: hashedPassword,
                comments: [],
                favLoc: [],
                homeLocation: {}
            }); 
            
            res.send({msg: "Create user successfully"});
        }
        catch(err) {
            console.log(err);
            if (err.code === 11000) {
                res.status(409).send({msg: "Username already exists!"});
            }
            else {
                res.status(500).send({err: "500 Server Error"});
            }
        }
    }
});

// retrieve users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-_id userId username password").sort({ userId: 1 }).exec();
        res.send({users});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// update user
router.put("/users/:userId", async (req, res) => {
    const userId = req.params.userId;
    const updateAttr = req.query.updateAttr;
    const {newValue} = req.body;

    try {
        if (updateAttr === "username") {
            if (newValue.length < 4 || newValue.length > 20){
                return res.status(400).send({msg: "The username should have 4-20 characters!"});
            }
            
            const user = await User.findOne({username: newValue})
            if (user) {
                return res.status(409).send({msg: "The username already exists!"});
            }
            
            await User.updateOne({userId},{username: newValue}).exec();
            return res.send({msg: "Username is updated", newValue});
        }
        else if (updateAttr === "password") {
            if (newValue.length < 4 || newValue.length > 20) {
                return res.status(400).send({msg: "The password should have 4-20 characters!"});
            }
            
            const hashedPassword = await bcrypt.hash(newValue, 10);
            await User.updateOne({userId}, {password: hashedPassword}).exec();
            return res.send({msg: "Password is updated", newValue: hashedPassword});
        }
        
        res.status(400).send({msg: "Invalid attribute!"});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// delete user
router.delete("/users/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        await User.findOneAndDelete({userId}).exec();
        res.send({ msg: "User is deleted" });
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// store the CSV data into databse
router.post("/csv", async (req, res) => {
    const data = req.body.data;
    const savedData = [];

    for (const row of data) {
        if (Object.keys(row).length == 7) {            
            let {busStopId, name, latitude, longitude, routeId, dir, seq} = row;

            if (!(busStopId && name && latitude && longitude && routeId && dir && seq)) {
                continue;
            }

            if (!busStopId.match(/^[0-9]{6}$/) || !busRoutes.has(routeId) || (dir != "I" && dir != "O") || seq <= 0) {
                continue;
            }

            if (isNaN(latitude) || Math.abs(latitude) > 90) {
                continue;
            }
            latitude = parseFloat(latitude);

            if (isNaN(longitude) || Math.abs(longitude) > 180) {
                continue;
            }
            longitude = parseFloat(longitude);

            try {
                const existingBusStop = await BusStop.findOne({busStopId}).select("_id").exec();
                if (existingBusStop) {
                    continue;
                }

                const route = await Route.findOne({routeId, dir, "busStops.seq": seq}).exec();
                if (route) {
                    continue;
                }

                const busStop = await BusStop.create({busStopId, name, latitude, longitude, eta: []});
                await Route.updateOne({routeId, dir}, {$push: {busStops: {busStop: busStop._id, seq}}});
                
                savedData.push(row);
            }
            catch(err) {
                console.log(err);
                return res.status(500).send({err: "500 Server Error"});
            }
        }
    }

    if (savedData.length === 0) {
        return res.status(400).send({msg: "No bus stops are created, the data may be invalid or duplicated"});
    }

    res.send({savedData, msg: "Create bus stops from CSV file successfully!"});
});

//Top 5 User Chart
router.get("/top-5-users", async (req, res) => {
    try {
        const top5Users = await User.aggregate([{
            $facet: {
                // find top 5 users with the most comments
                commentsUsers: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            commentsNum: { $size: "$comments" }
                        }
                    },
                    { $sort: { commentsNum: -1 } },
                    { $limit: 5 }
                ], 
                // find top 5 users with the most favourite bus stops
                favBusStopsUsers: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            favBusStopsNum: { $size: "$favBusStopIds" }
                        }
                    },
                    { $sort: { favBusStopsNum: -1 } },
                    { $limit: 5 }
                ]
            }
        }]).exec();

        res.send(top5Users[0]);    
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

module.exports = router;
