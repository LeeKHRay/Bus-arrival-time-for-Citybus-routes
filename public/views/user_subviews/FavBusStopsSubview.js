import UserSubview from './UserSubview.js';
import { getBusStopTable } from '../../js/utils.js';

export default class FavBusStopsSubview extends UserSubview {
    constructor() {
        super("Favourite Bus Stops", `
            <h1>Favourite Bus Stops</h1>
            <div id="result">
                <div class="d-flex justify-content-center align-items-center m-2">
                    <div class="spinner-border mr-2"></div>
                    <strong>Loading... </strong>
                </div>
            </div>
        `);
    }

    setContent({username}) {
        super.setContent();

        $.get(`/user/fav-bus-stops/${username}`, favBusStops => {
            if (favBusStops.length > 0) {
                $("#result").html(getBusStopTable(favBusStops));
            }
            else {
                $("#result").html("<h3>You don\'t have favourite bus stops</h3>");
            }
        });
    }
}