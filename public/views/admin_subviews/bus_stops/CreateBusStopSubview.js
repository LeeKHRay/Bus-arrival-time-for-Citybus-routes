import AdminSubview from '../AdminSubview.js';
import {routesSelectOptions} from '../../../js/utils.js';

export default class CreateBusStopSubview extends AdminSubview {
    constructor() {
        super("Create Bus Stop",
            `
                <h1>Create Bus Stop</h1>
                <form id="create-bus-stop-form">
                    <div class="form-group">
                        <label for="bus-stop-id">Bus Stop ID (6 digits)</label>
                        <input type="number" style="width: 300px" class="form-control inputBox" id="bus-stop-id" name="busStopId" min="0" required">
                    </div>
                    
                    <div class="form-group">
                        <label for="bus-stop-name">Name (in English)</label>
                        <input type="text" style="width: 300px" class="form-control inputBox" id="bus-stop-name" name="name" required>
                    </div>

                    <div class="form-group">                  
                        <label for="bus-stop-lat">Latitude</label>
                        <input type="number" style="width: 300px" class="form-control inputBox" id="bus-stop-lat" name="latitude" min="-90" max="-90" required>
                    </div>

                    <div class="form-group">    
                        <label for="bus-stop-long">Longitude</label>
                        <input type="number" style="width: 300px" class="form-control inputBox" id="bus-stop-long" name="longitude" min="-180" max="180" required>
                    </div>

                    <div class="form-group">
                        <label for="route-select-menu-create">Route</label><br>
                        <select style="width: 300px" id="route-select-menu-create" class="custom-select" name="routeId">
                        ${routesSelectOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="bus-stop-seq">Sequence number</label>
                        <input type="number" style="width: 300px" class="form-control inputBox" id="bus-stop-seq" name="seq" required>
                    </div>
                    
                    <div class="form-group">
                        Direction<br>
                        <div class="custom-control custom-radio custom-control-inline">
                            <input class="custom-control-input" id="inbound" type="radio" name="dir" value="I">
                            <label class="custom-control-label" for="inbound">Inbound</label>
                        </div>
                        <div class="custom-control custom-radio custom-control-inline">
                            <input class="custom-control-input" id="outbound" type="radio" name="dir" value="O">
                            <label class="custom-control-label" for="outbound">Outbound</label>
                        </div>
                    </div>

                    <button type="button" class="btn btn-success" id="create-bus-stop-btn">Create</button>
                    <p id="msg"></p>
                </form>
            `
        );
        
        // create bus stop
        $(document).on("click", "#create-bus-stop-btn", e => {
            const data = {};
            for (const {name, value} of $("#create-bus-stop-form").serializeArray()) {
                data[name] = value;
            }

            $.post("/admin/bus-stops", data, res => {
                $("#msg").html(res.msg);
                $("form").trigger("reset");
            })
            .fail(xhr => {
                console.log(xhr);
                const msg = xhr.responseJSON.msg;
                if (msg) {
                    $("#msg").html(msg);
                }
            });
        });
    }
}
