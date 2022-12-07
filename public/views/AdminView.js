import View from './View.js';
import LoginView from './LoginView.js';
import AdminSubview from './admin_subviews/AdminSubview.js';
import AdminHomeSubview from './admin_subviews/AdminHomeSubview.js';
import CreateBusStopSubview from './admin_subviews/bus_stops/CreateBusStopSubview.js';
import ListBusStopsSubview from './admin_subviews/bus_stops/ListBusStopsSubview.js';
import CreateUserSubview from './admin_subviews/users/CreateUserSubview.js';
import ListUsersSubview from './admin_subviews/users/ListUsersSubview.js';
import CSVSubview from './admin_subviews/CSVSubview.js';
import Top5UsersSubview from './admin_subviews/Top5UsersSubview.js';
import {historyPushState, historyReplaceState} from '../js/utils.js';

export default class AdminView extends View {
    #login;

    constructor() {
        super("Admin Home",
            `
                <nav class="mb-2 navbar navbar-expand-md bg-dark flex-md-row flex-column">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item">
                            <a id="admin-home" class="nav-link text-danger disabled" href="" data-admin-nav-item="">Home</a>
                        </li>

                        <li class="nav-item dropdown">
                            <a class="nav-link text-success dropdown-toggle" data-toggle="dropdown" href="">Bus Stops</a>
                            <div class="dropdown-menu">
                                <a id="bus-stops-create" class="dropdown-item text-success" href="" data-admin-nav-item="bus-stops create">Create New Bus Stop</a>
                                <a id="bus-stops-list" class="dropdown-item text-success" href="" data-admin-nav-item="bus-stops list">See Bus Stop List</a>
                            </div>
                        </li>

                        <li class="nav-item dropdown">
                            <a class="nav-link text-success dropdown-toggle" data-toggle="dropdown" href="">Users</a>
                            <div class="dropdown-menu">
                                <a id="users-create" class="dropdown-item text-success" href="" data-admin-nav-item="users create">Create New User</a>
                                <a id="users-list" class="dropdown-item text-success" href="" data-admin-nav-item="users list">See User List</a>
                            </div>
                        </li>

                        <li class="nav-item">
                            <a id="csv" class="nav-link text-success" href="" data-admin-nav-item="csv">Create Bus Stop Data from CSV</a>
                        </li>
                        <li class="nav-item">
                            <a id="top-5-users" class="nav-link text-success" href="" data-admin-nav-item="top-5-users">Top 5 Users</a>
                        </li>
                    </ul>
                    <ul class="navbar-nav ml-md-auto mr-md-0 mr-auto">
                        <li class="nav-item">
                            <a id="admin-logout" class="nav-link text-success" href="">Logout</a>
                        </li>
                    </ul>
                </nav>
                
                <div id="admin-content" class="mx-2"></div>
            `
        );

        this.subviews = {
            "": AdminHomeSubview.getInstance(), // use empty string as key since home page don't have route parameters
            "bus-stops": {
                create: CreateBusStopSubview.getInstance(),
                list: ListBusStopsSubview.getInstance()
            },
            users: {
                create: CreateUserSubview.getInstance(),
                list: ListUsersSubview.getInstance()
            },
            csv: CSVSubview.getInstance(),
            "top-5-users":  Top5UsersSubview.getInstance()
        }

        this.#login = false;
        
        // handle click event from navbar
        $(document).on("click", "a[data-admin-nav-item]", e => {
            e.preventDefault();

            const [navItem, crud] = $(e.target).data("adminNavItem").split(" ");
            const params = crud ? {navItem, crud} : {navItem};

            const {subview, url} = this.#getSubviewAndUrl(params);
            subview.setContent();
            this.#changeNavbar(params);
            historyPushState(url);
        });

        // logout
        $(document).on("click", "#admin-logout", e => {
            e.preventDefault();
            
            $.post("/logout", () => {
                this.logout();
                LoginView.getInstance().setContent();
                historyReplaceState("/");
            });
        });
    }

    login() {
        this.#login = true;
    }

    logout() {
        this.#login = false;
    }

    getLoginStatus() {
        return this.#login;
    }

    #getSubviewAndUrl(params) {
        const paramsNum = Object.keys(params).length;
        const {navItem, crud} = params;

        if (paramsNum === 1 && this.subviews[navItem] instanceof AdminSubview) {
            return {subview: this.subviews[navItem], url: `/admin/${navItem}`};
        } 

        if (paramsNum === 2 && this.subviews[navItem]?.[crud] instanceof AdminSubview) {
            return {subview: this.subviews[navItem][crud], url: `/admin/${navItem}/${crud}`};
        }

        // request for admin home page or invalid params
        params.navItem = ""; // change navItem to empty string to get AdminHomeSubview
        return {subview: this.subviews[""], url: "/admin"};
    }

    #changeNavbar({navItem, crud}) {
        if (navItem === "") {
            navItem = "admin-home";
        }

        let id = `#${navItem}`;
        if (crud) {
            id += `-${crud}`;
        }

        const $curNavItem = $(id);
        const $otherNavItems = $("nav a").not($curNavItem);

        $otherNavItems.removeClass("disabled");
        $otherNavItems.removeClass("text-danger");
        $otherNavItems.addClass("text-success");
        $curNavItem.addClass("disabled");
        $curNavItem.removeClass("text-success");
        $curNavItem.addClass("text-danger");
        $curNavItem.parent().prev(".dropdown-toggle").addClass("text-danger");
    }

    setContent(params = {}) {
        super.setContent();

        const {subview, url} = this.#getSubviewAndUrl(params);
        subview.setContent();
        this.#changeNavbar(params);
        return url; // return url for history api
    }
}
