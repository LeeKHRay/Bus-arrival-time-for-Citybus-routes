import UserSubview from './UserSubview.js';
import {createMap} from '../../js/utils.js';

export default class UserHomeSubView extends UserSubview {
    constructor() {
        super("Home", `
            <h1 class="text-center text-info">All Bus Stops Location</h1>
            <div style="height: 85vh">
                <div id="all-bus-stops-map" class="h-100"></div>
            </div>
        `);
    }

    setContent({homeLocation}) {
        super.setContent();

        $.get("/user/bus-stops", busStops => {
            const map = createMap('all-bus-stops-map', homeLocation);

            for (const {busStopId, name, latitude, longitude, commentsNum, favNum} of busStops) {
                // make a marker for each bus stop and add it to the map
                new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup({offset: 35, closeOnMove: true, maxWidth: 'none'}) // add popups
                .setHTML(`
                    <b>Name: <a href="" class="bus-stop-details" data-bus-stop-id="${busStopId}">${name}</a></b><br>
                    #Comments: <span>${commentsNum}</span><br>
                    #Favourites: <span>${favNum}</span><br>
                `))                
                .addTo(map);
            }
        });
    }
}