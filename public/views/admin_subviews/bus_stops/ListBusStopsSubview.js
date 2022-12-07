import AdminSubview from '../AdminSubview.js';
import {routesSelectOptions, getBusStopList} from '../../../js/utils.js';

export default class ListBusStopsSubview extends AdminSubview {
    #isDeleting;

    constructor() {
        super("Bus Stop List",
            `
                <h1>Bus Stop List</h1>
                <div class="form-group">
                    <label for="route-select-menu-list">Select a route</label><br>
                    <select style="width: 300px" id="route-select-menu-list" class="custom-select">
                    ${routesSelectOptions}
                    </select>
                </div>
                <div id="result"></div>
            `
        );

        this.#isDeleting = false;

        // retrieve bus stops and show edit and delete buttons
        $(document).on("change", '#route-select-menu-list', ({target}) => {
            const routeId = target.value;

            $("#result").html(`
                <div class="d-flex justify-content-center align-items-center m-2">
                    <div class="spinner-border mr-2"></div>
                    <strong>Loading... </strong>
                </div>
            `);

            $.get(`/admin/bus-stops?routeId=${routeId}`, res => {
                $("#result").html(getBusStopList({...res, routeId}));

                $(".bus-stop-info").append(`
                    <button type="button" class="btn btn-warning mt-1 mr-3" data-update-bus-stop-attr="name">Edit Name</button>
                    <button type="button" class="btn btn-warning mt-1 mr-3" data-update-bus-stop-attr="latitude">Edit Latitude</button>
                    <button type="button" class="btn btn-warning mt-1 mr-3" data-update-bus-stop-attr="longitude">Edit Longitude</button>
                    <button type="button" class="btn btn-warning mt-1 delete-bus-stop-btn">Delete</button>
                `);
            });
        });

        // update bus stop
        $(document).on("click", "button[data-update-bus-stop-attr]", ({target}) => {
            const attr = $(target).data("updateBusStopAttr");
            const newValue = prompt(`Please enter the new ${attr}`)?.trim();

            if (newValue === "") {
                alert(`Please enter the new ${attr}!`);
            }
            else {
                const busStopId = $(target).parent().find("span.bus-stop-id").text();
                
                $.ajax({
                    url: `/admin/bus-stops/${busStopId}?updateAttr=${attr}`,
                    type: "PUT",
                    data: {newValue}
                })
                .done(res => {
                    $(`.bus-stop-id:contains(${busStopId})`).parent().siblings(`span.bus-stop-${attr}`).html(newValue);
                    alert(res.msg);
                })
                .fail(xhr => {
                    console.log(xhr);
                    const msg = xhr.responseJSON.msg;
                    if (msg) {
                        alert(msg);
                    }
                });
            }
        });

        // delete bus stop
        $(document).on("click", ".delete-bus-stop-btn", ({target}) => {
            if (this.#isDeleting) {
                return;
            }

            this.#isDeleting = true;
            const busStopId = $(target).parent().find("span.bus-stop-id").text();
        
            $.ajax({
                url: `/admin/bus-stops/${busStopId}`,
                type: "DELETE"
            })
            .done(({msg}) => {
                $(`.bus-stop-id:contains(${busStopId})`).parent().parent().remove();

                if ($("#inbound-container > div").length == 0) {
                    $("#inbound-container").html('<h2><strong class="m-1 text-warning">No Bus Stops</strong></h2>');
                }
                if ($("#outbound-container > div").length == 0) {
                    $("#outbound-container").html('<h2><strong class="m-1 text-warning">No Bus Stops</strong></h2>');
                }

                alert(msg)
                this.#isDeleting = false;
            });
        });
    }
}
