import LoginView from "../views/LoginView.js";
import AboutView from "../views/AboutView.js";
import SignupView from "../views/SignupView.js";
import UserView from "../views/UserView.js";
import AdminView from "../views/AdminView.js";
import { historyPushState, historyReplaceState } from "./utils.js";

const loginView = LoginView.getInstance();
const signupView = SignupView.getInstance();
const aboutView = AboutView.getInstance();
const userView = UserView.getInstance();
const adminView = AdminView.getInstance();

const routes = [
    { path: "/", view: loginView },
    { path: "/about", view: aboutView },
    { path: "/signup", view: signupView },
    { path: "/user", view: userView },
    { path: "/user/:navItem", view: userView },
    { path: "/user/:navItem/:action", view: userView },
    { path: "/admin", view: adminView },
    { path: "/admin/:navItem", view: adminView },
    { path: "/admin/:navItem/:crud", view: adminView }
];

const pathToRegex = path => new RegExp(`^${path.replace(/\/:\w+/g, "\\/([\\w-]+)")}$`);

const getParams = route => {
    const values = route.paramValues;
    const keys = Array.from(route.path.matchAll(/:([\w-]+)/g)).map(result => result[1]);
    return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
};

const router = async (pathname = location.pathname) => {
    let curRoute = null;

    // find current route
    for (let route of routes) {
        const result = pathname.match(pathToRegex(route.path));
        if (result) {
            curRoute = {
                ...route,
                url: pathname,
                paramValues: result.slice(1)
            };
            break;
        }
    }
    
    // redirect
    const adminLogin = adminView.getLoginStatus();
    const [userLogin] = userView.getLoginStatus();
    let url = curRoute?.url;
    
    if (userLogin) { // user logged in
        if (!url?.startsWith("/user")) {
            curRoute = {
                ...routes[3],
                url: routes[3].path,
                paramValues: []
            };
        }
    }
    else if (adminLogin) { // admin logged in
        if (!url?.startsWith("/admin")) {
            curRoute = {
                ...routes[6],
                url: routes[6].path,
                paramValues: []
            };
        }
    }
    else if (!url || url?.startsWith("/user") || url?.startsWith("/admin")) { // route does not exist or have not logged in
        curRoute = {
            ...routes[0],
            url: routes[0].path,
            paramValues: []
        };
    }
    
    url = await curRoute.view.setContent(getParams(curRoute));
    return url || curRoute.url;
};

$.ajaxSetup({
    beforeSend: xhr => {
        xhr.setRequestHeader('ajax-request', true);
    }
});

// get user login status
$.get('/login', async ({role, user}) => {
    if (role === 'user') {
        userView.login(user);
    }
    else if (role === 'admin') {
        adminView.login();
    }

    const url = await router();
    historyReplaceState(url); // change url in address bar without refresh
});

$(window).on("popstate", async () => {
    const url = await router();
    historyReplaceState(url); // change url in address bar without refresh
});

$(document).on("click", "a[data-href]", async e => {
    e.preventDefault();
    const href = $(e.target).data("href");
    await router(href);
    historyPushState(href);
});

$(document).on("keypress", "input", () => {
    $("#msg").html("");
});
