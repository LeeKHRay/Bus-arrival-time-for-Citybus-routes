import AdminSubview from './AdminSubview.js';
import {busRoutes} from '../../js/utils.js';

export default class AdminHomeSubview extends AdminSubview {
    #isFlush;

    constructor() {
        super("Admin Home", `
            <h2>Welcome Admin!</h2>
            <button type="button" class="btn btn-dark" id="flush">Flush data</button>
            <div id="msg" class="mt-2"></div>
        `);

        this.#isFlush = false;
    
        // flush data
        $(document).on("click", "#flush", async () => {
            if (this.#isFlush) {
                return;
            }

            this.#isFlush = true;

            $("#msg").removeClass("text-success");
            $("#msg").html(`
                <div class="d-flex align-items-center m-2">
                    <div class="spinner-border mr-2"></div>
                    <strong>Flushing... </strong>
                </div>
            `);
            
            try {
                const [inRoutes, outRoutes] = this.#getRoutesData(...await this.#getRoutes());
        
                const busStops = this.#getBusStopsData(await this.#getBusStops(inRoutes, outRoutes));
                
                const busStopsETA = this.#getETAData(busStops, await this.#getETA(inRoutes, outRoutes));
        
                $.post("/admin/flush", {inRoutes, outRoutes, busStops, busStopsETA}, ({msg}) => {
                    $("#msg").addClass("text-success");
                    $("#msg").html(`<strong class='m-2'>${msg}</strong>`);
                    this.#isFlush = false;
                });
            } 
            catch(err) {
                console.log(err);
            }
        });
    }

    async #getRoutes () {
        // use fetch API to get routes data since ajax request, which has a custom header, will be blocked by CORS policy
        const inRoutesPromises = Promise.all(busRoutes.map(async route => {
            const response = await fetch(`https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/CTB/${route}/inbound`);
            return response.json();
        }));
    
        const outRoutesPromises = Promise.all(busRoutes.map(async route => {
            const response = await fetch(`https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/CTB/${route}/outbound`);
            return response.json();
        }));
        
        return Promise.all([inRoutesPromises, outRoutesPromises]);
    }
    
    #getRoutesData (inRoutes, outRoutes) {
        inRoutes = inRoutes.map(({data}, i) => ({
            routeId: busRoutes[i],
            busStops: data.map(stop => ({
                busStopId: stop.stop,
                seq: stop.seq
            }))
        }));
        
        outRoutes = outRoutes.map(({data}, i) => ({
            routeId : busRoutes[i],
            busStops: data.map(stop => ({
                busStopId: stop.stop,
                seq: stop.seq
            }))
        }));
    
        return [inRoutes, outRoutes];
    }
    
    async #getBusStops(inRoutes, outRoutes) {
        const busStopIds = new Set(); // store all bus stop ids
    
        for (let i = 0; i < busRoutes.length; i++) {
            for (const {busStopId} of inRoutes[i].busStops) {
                busStopIds.add(busStopId);
            }
            for (const {busStopId} of outRoutes[i].busStops) {
                busStopIds.add(busStopId);
            }
        }
        
        return Promise.all(Array.from(busStopIds).map(async busStopId => {
            const response = await fetch(`https://rt.data.gov.hk/v1/transport/citybus-nwfb/stop/${busStopId}`);
            return response.json();
        }));
    }
    
    #getBusStopsData (busStops) {
        return busStops.map(({data}) => ({
            busStopId : data.stop,
            name: data.name_en,
            latitude: data.lat,
            longitude: data.long,
        }));
    }
    
    async #getETA(inRoutes, outRoutes) {
        const busStopsIdsInRoutes = [];
        for (let i = 0; i < busRoutes.length; i++) {
            const busStopIds = new Set(); // store bus stop ids in a route(inbound & outbound)
            for (const {busStopId} of inRoutes[i].busStops) {
                busStopIds.add(busStopId);
            }
            for (const {busStopId} of outRoutes[i].busStops) {
                busStopIds.add(busStopId);
            }
            busStopsIdsInRoutes.push(busStopIds);
        }
    
        return Promise.all(busStopsIdsInRoutes.map((busStopIds, i) =>
            Promise.all(Array.from(busStopIds).map(async busStopId => {
                const response = await fetch(`https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/CTB/${busStopId}/${busRoutes[i]}`);
                return response.json();
            }))
        ));
    }
    
    #getETAData(busStops, routesETA) {    
        const busStopsETA = {};
        for (const {busStopId} of busStops) {
            busStopsETA[busStopId] = [];
        }
        
        for (const routeETA of routesETA) {
            for (const {data} of routeETA) {
                for (const {stop, route, dir, eta} of data) {
                    busStopsETA[stop].push({
                        routeId: route,
                        dir: dir,
                        time: eta
                    })
                }
            }
        }
    
        return busStopsETA;
    }
}