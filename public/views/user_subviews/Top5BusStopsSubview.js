import UserSubView from './UserSubview.js';
import {createChart} from '../../js/utils.js';

export default class Top5BusStopsSubView extends UserSubView {
    constructor() {
        super("Top 5 Bus Stops", `
            <h1>Top 5 Bus Stops with Most Comments</h1>
            <div class="row">
                <div class="col-12 col-xl">
                    <canvas id="bar-chart" class="w-100 h-auto"></canvas>
                </div>
                <div class="col-12 col-xl">
                    <canvas id="pie-chart" class="w-100 h-auto"></canvas>
                </div>
            </div>
        `);
    }

    setContent() {
        super.setContent();

        // show top 5 bus stops
        $.get("/user/top-5-bus-stops", res => {
            const {commentsBusStops} = res;
            const violet = 'rgba(153, 102, 255, 0.2)';
            const violetBorder = 'rgba(153, 102, 255, 1)';
            const blackBorder = 'rgba(0, 0, 0, 1)';

            let labels = commentsBusStops.map(busStop => busStop.name);
            let data = commentsBusStops.map(busStop => busStop.commentsNum);
            createChart($("#bar-chart"), "bar", labels, data, violet, violetBorder, 'Top 5 Bus Stops with Most Comments', 'Number of Comments');   

            const bgColor = [
                'rgba(153, 102, 255, 1.0)',
                'rgba(28, 78, 244, 1.0)',
                'rgba(85, 211, 100, 1.0)',
                'rgba(201, 201, 68, 1.0)',
                'rgba(234, 141, 49, 1.0)'
            ];         
            createChart($("#pie-chart"), "pie", labels, data, bgColor, blackBorder, 'Top 5 Bus Stops with Most Comments');
        });
    }
}