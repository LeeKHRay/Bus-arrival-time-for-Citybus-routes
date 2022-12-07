import UserSubview from './UserSubview.js';
import UserView from '../UserView.js';
import {createMap} from '../../js/utils.js';

export default class SettingsSubview extends UserSubview {
    constructor() {
        super("Settings", `
            <h1>Settings</h1>
            <h3 class="d-inline">Click on the map to put a marker on your home location. You can also drag the marker.</h3>
            <button type="button" class="btn btn-success m-2" id="set-home-btn">Save</button>
            <div id='set-home-map' class="w-100 h-75"></div>
        `);
        this.btns = [];
    }

    setContent({username, homeLocation}) {
        super.setContent();

        const map = createMap('set-home-map', homeLocation);
        let marker = null;

        if (Object.keys(homeLocation).length == 2) {
            // put a marker on home location
            marker = new mapboxgl.Marker({draggable: true})
            .setLngLat([homeLocation.longitude, homeLocation.latitude])             
            .addTo(map);
        }

        map.on('click', ({lngLat}) => {
            if (marker) {
                marker.setLngLat(lngLat);
            }
            else {
                marker = new mapboxgl.Marker({draggable: true})
                .setLngLat(lngLat)            
                .addTo(map);
            }
        });

        $("#set-home-btn").on("click", () => {
            if (marker) {
                const lngLat = marker.getLngLat();
                const homeLocation = {latitude: lngLat.lat, longitude: lngLat.lng}

                $.ajax({
                    url: `/user/home/${username}`,
                    type: "PUT",
                    data: {homeLocation}
                })
                .done(({msg}) => {
                    UserView.getInstance().homeLocation = homeLocation;
                    alert(msg);
                });
            }
            else {
                alert("Please put a marker on the home location");
            }
        });
    }
}