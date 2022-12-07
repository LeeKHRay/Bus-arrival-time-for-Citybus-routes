const express = require('express');
const app = express();

const xmlParser = require('express-xml-bodyparser');
app.use(xmlParser({explicitArray: false, normalize: true}));

const mongoDBURL = ""; // MongoDB server URL
const mongoose = require('mongoose');
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', () => console.log("Connection is open..."));

const BusStop = require('./models/BusStop.js');

app.use((req, res, next) => {
    if (req.headers['authorization'] === "Bearer csci2720") {
        next();
    }
    else {
        res.status(401).send();
    }
});

app.get("/api/locations", async (req, res) => {
    try {
        const busStops = await BusStop.find({}).exec();

        let locations = "";
        for (const {name, busStopId, latitude, longitude} of busStops) {
            locations += `
                <location>
                    <name>${name}</name>
                    <id>${busStopId}</id>
                    <latitude>${latitude}</latitude>
                    <longitude>${longitude}</longitude>
                </location>
            `;
        }

        res.send(locations);
    }
    catch(err) {
        console.log(err);
        res.status(500).send();
    }
});

app.post("/api/locations", async (req, res) => {
    const {name, id, latitude, longitude} = req.body.location;

    try {
        await BusStop.create({
            busStopId: id,
            name,
            latitude,
            longitude
        });

        res.setHeader('Location', `http://localhost:2064/api/locations/${id}`).send();
    }
    catch(err) {
        console.log(err);
        res.status(500).send();
    }
});

app.get("/api/locations/:busStopId", async (req, res) => {
    try {
        const busStop = await BusStop.findOne({busStopId: req.params.busStopId}).exec();
        if (!busStop) {
            return res.status(404).send("Bus stop does not exist");
        }

        const {name, busStopId, latitude, longitude} = busStop;
        const location = `
            <location>
                <name>${name}</name>
                <id>${busStopId}</id>
                <latitude>${latitude}</latitude>
                <longitude>${longitude}</longitude>
            </location>
        `;

        res.send(location);
    }
    catch(err) {
        console.log(err);
        res.status(500).send();
    }
});

app.put("/api/locations/:busStopId", async (req, res) => {
    try {
        const {id, ...newBusStop} = req.body.location;
        if (id) {
            newBusStop.busStopId = id;
        }
        
        await BusStop.updateOne({busStopId: req.params.busStopId}, newBusStop).exec();
        
        res.send();
    }
    catch(err) {
        console.log(err);
        res.status(500).send();
    }
});

app.delete("/api/locations/:busStopId", async (req, res) => {
    try {
        await BusStop.deleteOne({busStopId: req.params.busStopId}).exec();
        res.send();
    }
    catch(err) {
        console.log(err);
        res.status(500).send();
    }
});

const server = app.listen(2064);