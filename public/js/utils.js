const busRoutes = ["20", "22", "70", "117", "260", "307", "592", "608", "681", "969"];
const routesSelectOptions = '<option value="" hidden selected>Select Route</option>' + busRoutes.map(route => `<option value="${route}">${route}</option>`).join('');

const historyPushState = url => history.pushState({ content: $("#content").html(), title: $("title").text(), url }, '', url);
const historyReplaceState = url => history.replaceState({ content: $("#content").html(), title: $("title").text(), url }, '', url);

const getBusStopTable = (busStops, hasFavCol, order = 0) => {
    if (busStops.length == 0) {
        return false;
    }

    let rows = "";
    for (const {busStopId, name, latitude, longitude, commentsNum, favNum, isFavourite} of busStops) {
        rows += `
            <tr>
                <td><a class="bus-stop-details" href="" data-bus-stop-id="${busStopId}">${name}</a></td>
                <td>${latitude}</td>
                <td>${longitude}</td>
                <td>${commentsNum}</td>
                <td class="fav-num">${favNum}</td>
                ${hasFavCol ? `<td><input type="checkbox" class="add-to-fav" ${isFavourite ? "checked" : ""}></td>` : ""}
            </tr>
        `;
    }
    
    let nameColHeader;
    if (order === 0) {
        nameColHeader = "Name";
    }
    else {
        nameColHeader = `<a id="bus-stop-name-col" class="text-dark" href="">Name ${order > 0 ? '▲' : '▼'}</a>`;
    }

    return `
        <table class="table table-borderless table-hover table-sm text-center text-dark mx-auto">
            <thead class="thead-light" style="position: sticky; top: 0"><tr>
                <th>${nameColHeader}</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>#Comments</th>
                <th>#Favourite</th>
                ${hasFavCol ? "<th>Add to Favourite</th>" : ""}
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

const getBusStopList = ({routeId, inbound, outbound}) => {
    let inboundInfo = "";
    if (inbound.length == 0) {
        inboundInfo = '<h2><strong class="text-warning">No Bus Stops</strong></h2>';
    }
    else {
        for (const {busStop, seq} of inbound) {
            let inboundETA = "";
            for (const eta of busStop.eta) {
                if (eta.routeId === routeId && eta.dir === "I") {
                    const times = eta.time.join(", ");
                    inboundETA += inboundETA !== "" ? `, ${times}` : times;
                }
            };

            inboundInfo += `
                <div class='mb-3 p-2 border border-primary rounded bus-stop-info'>
                <b>Bus stop ID: <span class="bus-stop-id">${busStop.busStopId}</span></b><br>
                Name: <span class="bus-stop-name">${busStop.name}</span><br>
                Location (latitude, longitude): (<span class="bus-stop-latitude">${busStop.latitude}</span>, 
                <span class="bus-stop-longitude">${busStop.longitude}</span>)<br>
                Sequence number: <span>${seq}</span><br>
                Estimated time of arrival: ${inboundETA || "N/A"}<br>
                </div>
            `;
        };
    }

    let outboundInfo = "";
    if (outbound.length == 0) {
        outboundInfo = '<h2><strong class="text-warning">No Bus Stops</strong></h2>';
    }
    else {
        for (const {busStop, seq} of outbound) {
            let outboundETA = "";
            for (const eta of busStop.eta) {
                if (eta.routeId == routeId && eta.dir == "O") {
                    const times = eta.time.join(", ");
                    outboundETA += outboundETA !== "" ? `, ${times}` : times;
                }
            };

            outboundInfo += `
                <div class='mb-3 p-2 border border-primary rounded bus-stop-info'>
                <b>Bus stop ID: <span class="bus-stop-id">${busStop.busStopId}</span></b><br>
                Name: <span class="bus-stop-name">${busStop.name}</span><br>
                Location (latitude, longitude): (<span class="bus-stop-latitude">${busStop.latitude}</span>, 
                <span class="bus-stop-longitude">${busStop.longitude}</span>)<br>
                Sequence number: <span>${seq}</span><br>
                Estimated time of arrival: ${outboundETA || "N/A"}<br>
                </div>
            `;
        };
    }

    return `
        <div class='row'>
            <div class='col'>
                <h3>Inbound</h3>
                <div id="inbound-container">
                ${inboundInfo}
                </div>
            </div>
            <div class='col'>
                <h3>Outbound</h3>
                <div id="outbound-container">
                ${outboundInfo}
                </div>
            </div>
        </div>
    `;
};

const getUserList = ({users}) => {
    if (users.length === 0) {
        return '<h2><strong class="text-warning">No Users</strong></h2>';
    }

    let result = "";
    for (let {userId, username, password} of users) {
        result += `
            <div class="mb-3 p-2 border border-info rounded user-info">
                <span class="d-none user-id">${userId}</span>
                Username: <span class="user-username">${username}</span><br>
                Password: <span class="user-password">${password}</span><br>
            </div>
        `;
    };

    return result;
}

const chartOptions = (type, title, labelString) => {
    if (type == "horizontalBar") {
        return {
            legend: {display: false},
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString
                    },
                    ticks: {
                        min: 0,
                        beginAtZero: true,
                        callback: value => {
                            if (Math.floor(value) === value) {
                                return value;
                            }
                        }
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    }
                }]
            },
            title: {
                display: true,
                text: title,
                position: 'top',
                fontSize: 14
            }
        }
    }

    if (type == "bar") {
        return {
            legend: {display: false},
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString
                    },
                    ticks: {
                        min: 0,
                        beginAtZero: true,
                        callback: value => {
                            if (Math.floor(value) === value) {
                                return value;
                            }
                        }
                    }
                }]
            },
            title: {
                display: true,
                text: title,
                position: 'top',
                fontSize: 14
            }
        };
    }
    
    return {
        title: {
            display: true,
            text: title,
            position: 'top',
            fontSize: 14
        }
    };
};

const createChart = ($canvas, type, labels, data, bgColor, borderColor, title, labelString) => {
    const dataNum = data.length;
    const options = chartOptions(type, title, labelString);
    
    new Chart($canvas, {
        type,
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: Array.isArray(bgColor) ? bgColor.slice(0, dataNum) : Array(dataNum).fill(bgColor),
                borderColor: Array(dataNum).fill(borderColor),
                borderWidth: 1
            }]
        },
        options
    });
};

mapboxgl.accessToken = 'pk.eyJ1IjoibGtoOTUyNjM1NDciLCJhIjoiY2tsZWtkb2drMXEwYzJuczh1amVwam10NCJ9.0rOdrir7ap-eS5vTdrSAOA';
const createMap = (mapId, {latitude, longitude}) => {
    const lat = latitude || 22.30361786767277;
    const lng = longitude || 114.1720448838451; 

    const map = new mapboxgl.Map({
        container: mapId, // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [lng, lat], // starting position [lng, lat]
        zoom: 14, // starting zoom
        projection: 'globe' // display the map as a 3D globe
    });
    map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}), 'top-left');
    return map;
};

export { 
    busRoutes, 
    routesSelectOptions, 
    getBusStopTable,
    getBusStopList, 
    getUserList, 
    historyPushState, 
    historyReplaceState, 
    createChart, 
    createMap 
};