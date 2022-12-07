import View from './View.js';
import LoginView from './LoginView.js';
import UserSubview from './user_subviews/UserSubview.js';
import UserHomeSubview from './user_subviews/UserHomeSubview.js';
import BusStopListSubview from './user_subviews/bus_stops/BusStopListSubview.js';
import BusStopsSearchSubview from './user_subviews/bus_stops/BusStopsSearchSubview.js';
import BusStopDetailsSubview from './user_subviews/bus_stops/BusStopDetailsSubview.js';
import FavBusStopsSubview from './user_subviews/FavBusStopsSubview.js';
import Top5BusStopsSubview from './user_subviews/Top5BusStopsSubview.js';
import SettingsSubview from './user_subviews/SettingsSubview.js';
import {historyPushState, historyReplaceState} from '../js/utils.js';

export default class UserView extends View {
    #login;
    #user;
    #updatedETA

    constructor() {
        super("Home",
            `
                <nav class="mb-2 navbar navbar-expand-md bg-dark flex-md-row flex-column">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item">
                            <a id="user-home" class="nav-link text-danger disabled" href="" data-user-nav-item="">Home</a>
                        </li>

                        <li class="nav-item dropdown">
                            <a class="nav-link text-success dropdown-toggle" data-toggle="dropdown" href="">Bus Stops</a>
                            <div class="dropdown-menu">
                                <a id="bus-stops-list" class="dropdown-item text-success" href="" data-user-nav-item="bus-stops list">List in Table</a>
                                <a id="bus-stops-search" class="dropdown-item text-success" href="" data-user-nav-item="bus-stops search">Search</a>
                            </div>
                        </li>

                        <li class="nav-item">
                            <a id="fav-bus-stops" class="nav-link text-success" href="" data-user-nav-item="fav-bus-stops">See Favourite Bus Stops</a>
                        </li>
                        <li class="nav-item mr-auto">
                            <a id="top-5-bus-stops" class="nav-link text-success" href="" data-user-nav-item="top-5-bus-stops">See Top 5 Bus Stops</a>
                        </li>
                    </ul>
                    <ul class="navbar-nav ml-md-auto mr-md-0 mr-auto">
                        <li class="nav-item dropdown">
                            <a id="username" class="nav-link text-success dropdown-toggle" data-toggle="dropdown" href=""></a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a id="settings" class="dropdown-item text-success" href="" data-user-nav-item="settings">Settings</a>
                                <a id="user-logout" class="dropdown-item text-success" href="">Logout</a>
                            </div>
                        </div>
                    </ul>
                </nav>
                
                <div id="user-content" class="mx-2"></div>
            `
        );

        this.subviews = {
            "": UserHomeSubview.getInstance(),
            "bus-stops": {
                list: BusStopListSubview.getInstance(),
                search: BusStopsSearchSubview.getInstance(),
                details: BusStopDetailsSubview.getInstance(),
            },
            "fav-bus-stops": FavBusStopsSubview.getInstance(),
            "top-5-bus-stops": Top5BusStopsSubview.getInstance(),
            settings: SettingsSubview.getInstance(),
        }

        this.#login = false;
        this.#user = null;
        this.#updatedETA = false;

        // handle click event from navbar
        $(document).on("click", "a[data-user-nav-item]", e => {
            e.preventDefault();

            const [navItem, action] = $(e.target).data("userNavItem").split(" ");
            const params = action ? {navItem, action} : {navItem};

            const {subview, url} = this.#getSubviewAndUrl(params);
            subview.setContent(this.#user);
            this.#changeNavbar(params);
            historyPushState(url);
        });

        // seperate view of bus stop
        $(document).on("click", ".bus-stop-details", e => {
            e.preventDefault();
            
            const busStopId = $(e.target).data("busStopId");
            this.subviews["bus-stops"].details.setContent({busStopId});
            this.#changeNavbar({});
            historyPushState(`/user/bus-stops/${busStopId}`);
        });

        // add favourite bus stop
        $(document).on("click", ".add-to-fav", e => {
            const $this = $(e.target);
            const checked = $this.is(":checked");
            const busStopId = $this.parent().parent().find("td a.bus-stop-details").data("busStopId");

            $.ajax({
                url: `/user/fav-bus-stops/${this.username}/${busStopId}?op=${checked ? "add" : "remove"}`,
                type: "PUT"
            })
            .done(() => {
                const $favNum = $this.parent().parent().find(".fav-num");
                $favNum.text(parseInt($favNum.text(), 10) + (checked ? 1 : -1));
            });
        });

        // logout
        $(document).on("click", "#user-logout", e => {
            e.preventDefault();

            $.post("/logout", () => {
                this.logout();
                LoginView.getInstance().setContent();
                historyReplaceState("/");
            });
        });
    }

    login(user) {
        this.#login = true;
        this.#user = user;
    }

    logout() {
        this.#login = false;
        this.#user = null;
        this.#updatedETA = false;
    }

    getLoginStatus() {
        return [this.#login, this.#user];
    }

    get homeLocation() {
        return this.#user.homeLocation;
    }

    set homeLocation(newHomeLocation) {
        this.#user.homeLocation = newHomeLocation;
    }

    get username() {
        return this.#user.username;
    }
    
    #getSubviewAndUrl(params) {
        const paramsNum = Object.keys(params).length;
        const {navItem, action} = params;

        if (paramsNum === 1 && this.subviews[navItem] instanceof UserSubview) {
            return {subview: this.subviews[navItem], url: `/user/${navItem}`};
        } 

        if (paramsNum === 2) {
            if (navItem === "bus-stops" && action.match(/^[0-9]{6}$/)) {
                return {subview: this.subviews["bus-stops"].details, url: `/user/bus-stops/${action}`};
            }

            if (this.subviews[navItem]?.[action] instanceof UserSubview) {
                return {subview: this.subviews[navItem][action], url: `/user/${navItem}/${action}`};
            }
        }

        // request for user home page or invalid params
        params.navItem = ""; // change navItem to empty string to get AdminHomeSubview
        return {subview: this.subviews[""], url: "/user"};
    }

    #changeNavbar({navItem, action}) {
        if (navItem === "") {
            navItem = "user-home";
        }
        
        const $curNavItem = $(action ? `#${navItem}-${action}` : `#${navItem}`);
        const $otherNavItems = $("nav a").not($curNavItem);

        $otherNavItems.removeClass("disabled");
        $otherNavItems.removeClass("text-danger");
        $otherNavItems.addClass("text-success");
        $curNavItem.addClass("disabled");
        $curNavItem.removeClass("text-success");
        $curNavItem.addClass("text-danger");
        $curNavItem.parent().prev(".dropdown-toggle").addClass("text-danger");
    }

    async setContent(params = {}) {
        super.setContent();
        $("#username").html(this.username);

        if (!this.#updatedETA) {
            await this.updateETA();
        }
        
        const {subview, url} = this.#getSubviewAndUrl(params);
        subview.setContent({...this.#user, busStopId: params.action});
        this.#changeNavbar(params);
        return url; // return url for history api
    }

    async #getETA(busStopsIdsInRoutes) {
        return Promise.all(busStopsIdsInRoutes.map(({routeId, uniqueBusStopIds}) =>
            Promise.all(Array.from(uniqueBusStopIds).map(async busStopId => {
                const response = await fetch(`https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/CTB/${busStopId}/${routeId}`);
                return response.json();
            }))
        ));
    }   

    async updateETA() {
        return $.get("/user/routes", async res => {
            const busStopsIdsInRoutes = [];
            for (const {routeId, busStopIds} of res.routes) {
                const uniqueBusStopIds = new Set(); // store all bus stop ids in a route
                for (const busStopId of busStopIds) {
                    uniqueBusStopIds.add(busStopId);
                }
                busStopsIdsInRoutes.push({routeId, uniqueBusStopIds});
            }

            const routesETA = await this.#getETA(busStopsIdsInRoutes);   

            const busStopsETA = {};
            for (const routeETA of routesETA) {
                for (const {data} of routeETA) {
                    for (const {stop, route, dir, eta} of data) {
                        if (!busStopsETA.hasOwnProperty(stop)) {
                            busStopsETA[stop] = [];
                        }

                        busStopsETA[stop].push({
                            routeId: route,
                            dir: dir,
                            time: eta
                        })
                    }
                }
            }

            $.ajax({
                url: "/user/eta", 
                method: "PUT",
                data: {busStopsETA}
            })
            .done(() => {
                this.#updatedETA = true;
            });
        })
    }
}
