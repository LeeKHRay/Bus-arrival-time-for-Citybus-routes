# Bus arrival time for Citybus routes

## Project Setup
Clone this repository. You will need `node` and `npm` installed globally on your machine.

Replace the value of `mongoDBURL` in `app.js` and `api.js` with your MongoDB server URL

Install dependencies:
`npm install`

Start server:
`node app.js`

Visit website:
`http://localhost:2064/`

## RESTful API
- List all bus stops:  `GET http://localhost:2064/api/locations`

- Add a new bus stop: `POST http://localhost:2064/api/locations`
	- Request body: 
	```
	<location>
		<name>bus stop name</name>
		<id>bus stop ID</id>
		<latitude>bus stop latitude</latitude>
		<longitude>bus stop longitude</longitude>
	</location>
	```	

- Retrieve a bus stop: `GET http://localhost:2064/api/locations/bus-stop-id`

- Update a bus stop: `PUT http://localhost:2064/api/locations/bus-stop-id` 
	- Request body: 
	```
	<location>
		<name>updated bus stop name</name>
		<id>updated bus stop ID</id>
		<latitude>updated bus stop latitude</latitude>
		<longitude>updated bus stop longitude</longitude>
	</location>
	```

- Delete a bus stop: `DELETE http://localhost:2064/api/locations/bus-stop-id`

Start server for RESTful API:
`node api.js`

## Data Source:
Citybus ETA: https://data.gov.hk/en-data/dataset/ctb-eta-transport-realtime-eta
