import UserView from '../../UserView.js';
import UserSubview from '../UserSubview.js';
import { getBusStopTable } from '../../../js/utils.js';

export default class BusStopsSearchSubview extends UserSubview {
    constructor() {
        super("Search Bus Stops", `
            <h1>Search Bus Stops</h1>
            Choose a search criterion<br>
            <div class="custom-control custom-radio custom-control-inline">
                <input class="custom-control-input" id="criterion-name" type="radio" name="criterion" value="name" checked>
                <label class="custom-control-label" for="criterion-name">Bus stop name</label>
            </div>
            <div class="custom-control custom-radio custom-control-inline">
                <input class="custom-control-input" id="criterion-dist" type="radio" name="criterion" value="dist">
                <label class="custom-control-label" for="criterion-dist">Distance to home location</label>
            </div>
            <div id="criterion" class="form-group mt-2">
                <label for="value">Name</label>
                <input class="form-control" style="width: 300px" type="text" name="value" id="value">
            </div>
            <button type="button" class="btn btn-success" id="search-btn">Search</button>
            <div id="result"></div>
        `);
        
        // choose search criterion
        $(document).on("change", "input[name=criterion]", ({target}) => {
            const $this = $(target);
            
            if ($this.val() === "dist" && $.isEmptyObject(UserView.getInstance().homeLocation)) {
                alert("Please set your home location in the settings page first!");
                $("#criterion-name").prop("checked", true);
            }
            else {
                $("#criterion > label").html($this.val() === "name" ? "Name" : "Distance (km)");
            }
        });

        // search bus stops by the chosen criterion
        $(document).on("click", "#search-btn", () => {
            const val = $("#value").val();
            if (!val) {
                alert("Please input the search value");
                return;
            }

            const criterion = $("input[name=criterion]:checked").val();

            $("#result").html(`
                <div class="d-flex justify-content-center align-items-center m-2">
                    <div class="spinner-border mr-2"></div>
                    <strong>Search... </strong>
                </div>
            `);

            $.get(`/user/bus-stops?criterion=${criterion}&value=${val}`, busStops => {
                $("#value").val("");
                if (busStops.length > 0) {
                    $("#result").html(getBusStopTable(busStops, true));
                }
                else {
                    $("#result").html("<h3>No bus stops are found</h3>");
                }
            })
            .fail(xhr => {
                $("#result").html("");
                console.log(xhr);
                const msg = xhr.responseJSON.msg;
                if (msg) {
                    alert(msg);
                }
            });
        });
    }
}