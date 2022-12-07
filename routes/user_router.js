const express = require ('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/User.js');
const Route = require('../models/Route.js');
const BusStop = require('../models/BusStop.js');
const Comment = require('../models/Comment.js');

router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    if (username == "" || password == "") {
        return res.status(400).send({msg: "Please enter username and password!"});
    }

    try {
        const user = await User.findOne({username}).select("_id password homeLocation").exec();

        if (!user) {
            return res.status(401).send({msg: "Wrong username/password!"});
        }
        
        const isPwdCorrect = await bcrypt.compare(password, user.password);
        
        if (!isPwdCorrect) {
            return res.status(401).send({msg: "Wrong username/password!"});
        }
        
        req.session.role = 'user';
        req.session.user = {username, homeLocation: user.homeLocation || {}};
        res.send({user: req.session.user});
    }
    catch (err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

router.use((req, res, next) => {
    if (req.session.role !== 'user') {
        return res.send({msg: "Unauthorized"});
    }

    next();
});

// update user home location
router.put("/home/:username", async (req, res) => {
    const homeLocation = req.body.homeLocation;

    try {
        await User.updateOne({username: req.params.username}, {homeLocation}).exec();
        req.session.user.homeLocation = homeLocation;
        res.send({msg: "Your home location is saved"});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// search/get (sorted) bus stops
router.get("/bus-stops", async (req, res) => {
    const {criterion, value, sortOrder} = req.query;    
    const {username, homeLocation: {latitude, longitude}} = req.session.user;
    
    try {
        const {favBusStopIds} = await User.findOne({username}).select("-_id favBusStopIds").exec();

        let stages;
        if (criterion === "name") {
            stages = [
                {$set: {isFavourite: {$in: ["$busStopId", favBusStopIds]}}},
                {$match: {name: {$regex: `\\b${value}\\b`, $options: 'i'}}}
            ];
        }
        else if (criterion === "dist") {
            if (isNaN(value)) {
                return res.status(400).send({msg: "Please enter a positive number"})
            }

            const dist = parseFloat(value);
            if (dist <= 0) {
                return res.status(400).send({msg: "Please enter a positive number"})
            }

            stages = [
                {$set: {
                    dist: { 
                        $function: {
                            body: function(lat1, lng1, lat2, lng2) {
                                const deg2rad = Math.PI / 180
                                const R = 6371; // Radius of the earth in km
                                const dLat = (lat2 - lat1) * deg2rad 
                                const dLng = (lng2 - lng1) * deg2rad
                                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                        Math.cos(lat1 * deg2rad) * Math.cos(lat2 * deg2rad) * 
                                        Math.sin(dLng / 2) * Math.sin(dLng / 2); 
                                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
                                return R * c; // Distance in km
                            },
                            args: [latitude, longitude, "$latitude", "$longitude"],
                            lang: "js"
                        }
                    },
                    isFavourite: {$in: ["$busStopId", favBusStopIds]}
                }},
                {$match: {dist: {$lt: dist}}}
            ];
        }
        else {
            stages = [
                {$set: {isFavourite: {$in: ["$busStopId", favBusStopIds]}}},
                {$sort: {name: parseInt(sortOrder, 10) || 1}}
            ];
        }
        
        const busStops = await BusStop.aggregate([
            ...stages,
            {$lookup: {
                from: "comments",
                localField: "busStopId",
                foreignField: "busStopId",
                as: "comments"
            }},
            {$lookup: {
                from: "users",
                localField: "busStopId",
                foreignField: "favBusStopIds",
                as: "users"
            }},
            {$set: { 
                favNum: {$size: "$users"},
                commentsNum: {$size: "$comments"}
            }}, 
            {$project: {_id: 0, users: 0, comments: 0, dist: 0}}
        ]).exec();
        res.send(busStops);
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// search bus Stop by ID
router.get("/bus-stops/:busStopId", async (req, res) => {
    try {
        const busStops = await BusStop.aggregate([
            {$match: {busStopId: req.params.busStopId}},
            {$lookup: {
                from: "comments",
                localField: "busStopId",
                foreignField: "busStopId",
                as: "comments"
            }},
            {$lookup: {
                from: "users",
                localField: "busStopId",
                foreignField: "favBusStopIds",
                as: "users"
            }},
            {$set: {favNum: {$size: "$users"}}}, 
            {$project: {_id: 0, users: 0, "comments._id": 0}}
        ]).exec();
        
        if (busStops.length === 0) {
            return res.status(404).send({ err: "Bus stop does not exist!" });
        }
        res.send(busStops[0]);
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// finding all the favourite bus stops of the user.
router.get("/fav-bus-stops/:username", async (req, res) => {
    const username = req.params.username;
    
    try {
        const favBusStops = await User.aggregate([
            {$match: {username}},
            {$lookup: {
                from: "busstops",
                localField: "favBusStopIds",
                foreignField: "busStopId",
                as: "busStop"
            }},
            {$unwind: "$busStop"},
            {$lookup: {
                from: "comments",
                localField: "busStop.busStopId",
                foreignField: "busStopId",
                as: "comments"
            }},
            {$lookup: {
                from: "users",
                localField: "busStop.busStopId",
                foreignField: "favBusStopIds",
                as: "users"
            }},
            {$replaceWith: { 
                $mergeObjects: [
                    "$busStop",
                    { 
                        commentsNum: {$size: "$comments"},
                        favNum: {$size: "$users"},
                    }
                ]
            }}, 
            {$project: {_id: 0}}
        ]).exec();
        
        res.send(favBusStops);
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// adding the favourite location to fav list.
router.put("/fav-bus-stops/:username/:busStopId", async (req, res) => {
    const {username, busStopId} = req.params;
    const {op} = req.query;
    
    try {
        const update = op === "add" ? {$push: {favBusStopIds: busStopId}} : {$pull: {favBusStopIds: busStopId}}
        await User.updateOne({username}, update);
        res.send({});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// add the comment to bus stop 
router.post("/comments", async (req, res) => {
    const {username} = req.session.user;
    const {content, busStopId, datetime} = req.body;

    try {
        const comment = await Comment.create({username, content, busStopId, datetime});
        await User.updateOne({username}, {$push: {comments: comment._id}})
        
        res.send({});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// find top 5 bus stops with most comments
router.get("/top-5-bus-stops", async (req, res) => {
    try {
        // await Comment.create({
        //     username: "LeeRay",
        //     content: "test a",
        //     busStopId: "001430",
        //     datetime: "30/09/2022, 21:37:47"
        // });
        
        const commentsBusStops = await Comment.aggregate([
            {$group: {_id: '$busStopId', commentsNum: {$count: {}}}},
            {$sort: { commentsNum: -1 }},
            {$limit: 5},
            {$lookup: {
                from: "busstops",
                localField: "_id",
                foreignField: "busStopId",
                as: "busStop"
            }},
            {$project: {
                _id: 0,
                name: { $arrayElemAt: ["$busStop.name", 0] },
                commentsNum: 1
            }},
        ])

        res.send({commentsBusStops});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// find all routes
router.get("/routes", async (req, res) => {
    try {
        const routes = await Route.aggregate([
            {$group: {_id: '$routeId', busStops: {$push: "$busStops"}}},
            {$project: {
                routeId: "$_id",
                busStops: {
                    $reduce: {
                        input: "$busStops",
                        initialValue: [],
                        in: {
                            $concatArrays: ["$$value", "$$this"]
                        }
                    }
                }
            }},
            {$lookup: {
                from: "busstops",
                localField: "busStops.busStop",
                foreignField: "_id",
                as: "busStops"
            }},
            {$project: {
                _id: 0,
                routeId: 1,
                busStopIds: "$busStops.busStopId"
            }}
        ]);

        res.send({routes});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

// update eta
router.put("/eta", async (req, res) => {
    const busStopsETA = req.body.busStopsETA;
    const updates = [];

    const promise = BusStop.updateMany({}, {eta: []}).exec();

    for (const busStopId in busStopsETA) {
        const timeForEachRoute = {};
        for (const {routeId, dir, time} of busStopsETA[busStopId]) {
            if (!timeForEachRoute.hasOwnProperty(routeId)) {
                timeForEachRoute[routeId] = {};
            }

            if (!timeForEachRoute[routeId].hasOwnProperty(dir)) {
                timeForEachRoute[routeId][dir] = [];
            }

            const timeString = time == "" ? " " : new Date(time).toTimeString().split(' ')[0].substring(0,5);
            timeForEachRoute[routeId][dir].push(timeString);
        }

        const etaList = [];
        for (const routeId in timeForEachRoute) {
            for (const dir in timeForEachRoute[routeId]) {
                etaList.push({routeId, dir, time: timeForEachRoute[routeId][dir]});
            }
        }

        updates.push({
            updateOne: {
                filter: {busStopId},
                update: {eta: etaList}
            }
        });
    }

    try {
        await promise;
        await BusStop.bulkWrite(updates);

        res.send({});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({err: "500 Server Error"});
    }
});

module.exports = router;
