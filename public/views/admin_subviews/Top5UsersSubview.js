import AdminSubview from './AdminSubview.js';
import {createChart} from '../../js/utils.js';

export default class Top5UsersSubview extends AdminSubview {
    constructor() {
        super("Top 5 Users", `
            <h1>Top 5 Users with Most Comments and Favourite Bus Stops</h1>
            <div class="row">
                <div class="col-12 col-lg">
                    <canvas id="bar-chart-comments" class="w-100 h-auto"></canvas>
                </div>
                <div class="col-12 col-lg">
                    <canvas id="bar-chart-fav-bus-stops" class="w-100 h-auto"></canvas>
                </div>
            </div>
        `);
    }

    setContent() {
        super.setContent();

        // show top 5 users
        $.get("/admin/top-5-users", res => {
            const {commentsUsers, favBusStopsUsers} = res;
            const violet = 'rgba(153, 102, 255, 0.2)';
            const violetBorder = 'rgba(153, 102, 255, 1)';

            let labels = commentsUsers.map(user => user.username);
            let data = commentsUsers.map(user => user.commentsNum);
            createChart($("#bar-chart-comments"), "horizontalBar", labels, data, violet, violetBorder, 'Top 5 Users with Most Comments', 'Number of Comments');
            
            labels = favBusStopsUsers.map(user => user.username);
            data = favBusStopsUsers.map(user => user.favBusStopsNum);
            createChart($("#bar-chart-fav-bus-stops"), "horizontalBar", labels, data, violet, violetBorder, 'Top 5 Users with Most Favourite Bus Stops', 'Number of Favourite Bus Stops');
        });
    }
}