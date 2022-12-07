import UserSubview from '../UserSubview.js';
import { getBusStopTable } from '../../../js/utils.js';

export default class BusStopListSubview extends UserSubview {
    #isSorting;
    #order;

    constructor() {
        super("Bus Stops", `
            <h1>Bus Stops</h1>
            <div id="result">
                <div class="d-flex justify-content-center align-items-center m-2">
                    <div class="spinner-border mr-2"></div>
                    <strong>Loading... </strong>
                </div>
            </div>
        `);

        this.#isSorting = false;
        this.#order = 1;

        // sort bus stops by name
        $(document).on("click", "#bus-stop-name-col", e => {
            e.preventDefault();
            
            if (this.#isSorting) {
                return;
            }
            
            this.#isSorting = true;
            this.#order = -this.#order;
        
            $.get(`/user/bus-stops?sortOrder=${this.#order}`, busStops => {
                $("#result").html(getBusStopTable(busStops, true, this.#order));
                this.#isSorting = false;
            });
        });
    }

    setContent() {
        super.setContent();

        $.get("/user/bus-stops", busStops => {
            $("#result").html(getBusStopTable(busStops, true, 1));
        });
    }
}