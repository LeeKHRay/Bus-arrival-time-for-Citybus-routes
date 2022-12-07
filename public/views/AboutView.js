import View from './View.js';

export default class AboutView extends View {
    constructor() {
        super("About This Project",
            `
                <div class="mx-2">
                    <h1 id="title">About This Project</h1>

                    <h4><u>Group Members (Group 10)</u></h4>
                    <table class="table table-borderless table-sm table-responsive">
                        <tr>
                            <td>Kwan Tsz Fung</td>
                            <td>1155078864</td>
                        </tr>
                        <tr>
                            <td>Lee Kwan Hung</td>
                            <td>1155108603</td>
                        </tr>
                        <tr>
                            <td>Wong Ching Yeung Wallace</td>
                            <td>1155093534</td>
                        </tr>
                        <tr>
                            <td>Choi Chun Wa</td>
                            <td>1155094180</td>
                        </tr>
                    </table>
                    
                    <h4><u>Workload distribution</u></h4>
                    <table class="table table-borderless table-sm table-responsive">
                        <tbody>
                            <tr>
                                <td>Kwan Tsz Fung</td>
                                <td>user action#4, 6, admin action#1, 2, 3, charting statistics in admin view</td>
                            </tr>
                            <tr>
                                <td>Lee Kwan Hung</td>
                                <td>user action#1, 3, admin action#1, 2, 3, 5, non-user action#1, 2, charting statistics in user view</td>
                            </tr>
                            <tr>
                                <td>Wong Ching Yeung Wallace</td>
                                <td>user action#2, 3, 4, 5 admin action# 4, user location, map interface</td>
                            </tr>
                            <tr>
                                <td>Choi Chun Wa</td>
                                <td>writing report, designing RESTful API, designing user interface, editing source code structure</td>
                            </tr>
                            <tr>
                                <td>Together</td>
                                <td>about page, design data schemas</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h4><u>"How-to"</u></h4>
                    <b>Login Page:</b>
                    <ul>
                        <li>Login form (login as user)</li>
                        <li>Sign up page link</li>
                        <li>Admin login link (login as admin)</li>
                        <li>About this Project</li>
                    </ul>

                    <b>Sign Up Page:</b>
                    <ul>
                        <li>Sign up form</li>
                        <li>Login page link</li>
                    </ul>
                    
                    <b>User View:</b>
                    <ul>
                        <li>Home page
                            <ul>
                                <li>Show the location of all bus stops on a map</li>
                                <li>Click the marker to open a popup with a link to the separate view for the corresponding bus stop</li>
                            </ul>
                        </li>

                        <li>List bus stops in table
                            <ul>
                                <li>Click the name column header to sort bus stops</li>
                                <li>Click the bus stop name can go to separate view</li>
                                <li>Check the "Add to Favourite" checkbox to add the bus stop into the list of favourite bus stops</li>
                                <li>Uncheck the checkbox to remove the bus stop from the list of favourite bus stops</li>
                            </ul>
                        </li>

                        <li>Search bus stops
                            <ul>
                                <li>Search bus stops by name or distance from user home location (updatable in settings page)</li>
                                <li>Click the bus stop name can go to separate view</li>
                                <li>Check the "Add to Favourite" checkbox to add the bus stop into the list of favourite bus stops</li>
                                <li>Uncheck the checkbox to remove the bus stop from the list of favourite bus stops</li>
                            </ul>
                        </li>

                        <li>Separate view for bus stop
                            <ul>
                                <li>Show bus stop details and location on map</li>
                                <li>Show user comments</li>
                                <li>Add add new comment</li>
                            </ul>
                        </li>

                        <li>See favourite bus stops listed in table</li>
                        <li>See top 5 bus stops with most comments in bar chart and pie chart</li>
                        <li>Dropdrop menu (with username) at top right
                            <ul>
                                <li>Update user location in settings page</li>
                                <li>Logout as user</li>
                            </ul>
                        </li>
                    </ul>

                    <b>Admin View:</b>
                    <ul>
                        <li>Home page
                            <ul>
                                <li>Flush data</li>
                            </ul>
                        </li>
                        <li>CRUD bus stops
                            <ul>
                                <li>Create new bus stop</li>
                                <li>See bus stops in list (with buttons to update and delete bus stops)</li>
                            </ul>
                        </li>
                        <li>CRUD users
                            <ul>
                                <li>Create new bus stop</li>
                                <li>See users in list (with buttons to update and delete users)</li>
                            </ul>
                        </li>
                        <li>Create bus stop data by uploading .csv file</li>
                        <li>See top 5 users with most comments and most favourite locations in two bar charts</li>
                        <li>Logout as admin</li>
                    </ul>

                    <h4><u>Data Schemas</u></h4>
                    <table class="table table-sm table-responsive">
                        <tbody>
                            <tr>
                                <td>BusStop</td>
                                <td>
                                    ${`{<br>
                                        &emsp;busStopId: { type: String, required: true, unique: true },<br>
                                        &emsp;name: { type: String, required: true },<br>
                                        &emsp;latitude: { type: Number, required: true },<br>
                                        &emsp;longitude: { type: Number, required: true },<br>
                                        &emsp;eta: [{<br>
                                            &emsp;&emsp;routeId: { type: String, required: true },<br>
                                            &emsp;&emsp;dir: { type: String, required: true },<br>
                                            &emsp;&emsp;time: [{ type: String, required: true }]<br>
                                        &emsp;}]<br>
                                    }`}
                                </td>
                            </tr>
                            <tr>
                                <td>Route</td>
                                <td>
                                    ${`{<br>
                                        &emsp;routeId: { type: String, required: true },<br>
                                        &emsp;dir: { type: String, required: true },<br>
                                        &emsp;busStops: [{<br> 
                                            &emsp;&emsp;busStop: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },<br>
                                            &emsp;&emsp;seq: { type: Number, required: true }<br>
                                        &emsp;}]<br>
                                    }`}
                                </td>
                            </tr>
                            <tr>
                                <td>User</td>
                                <td>
                                    ${`{<br>
                                        &emsp;userId: { type: Number, required: true, unique: true },<br>
                                        &emsp;username: { type: String, required: true, unique: true },<br>
                                        &emsp;password: { type: String, required: true },<br>
                                        &emsp;comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],<br>
                                        &emsp;favBusStopIds: [{ type: String }],<br>
                                        &emsp;homeLocation: {<br>
                                            &emsp;&emsp;latitude: { type: Number },<br>
                                            &emsp;&emsp;longitude: { type: Number }<br>
                                        &emsp;}<br>
                                    }`}
                                </td>
                            </tr>
                            <tr>
                                <td>Comment</td>
                                <td>
                                    ${`{<br>
                                        &emsp;username: { type: String, required: true },<br>
                                        &emsp;content: { type: String, required: true },<br>
                                        &emsp;busStopId: { type: String, required: true },<br>
                                        &emsp;datetime: { type: String, required: true }<br>
                                    }`}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h4><u>Technologies and Libraries</u></h4>
                    <p>Why jQuery + MongoDB + Node.js?</p>
                    <table class="table table-bordered table-responsive text-dark">
                        <thead class="thead-dark">
                            <tr>
                                <th>Advantages</th>
                                <th>Disadvantages</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>jQuery allows us to write JavaScript faster and easier</td>
                                <td>We have to import the whole jQuery library but we usually only use part of it</td>
                            </tr>
                            <tr>
                                <td>We can use MongoDB without the knowledge in SQL</td>
                                <td>There is no foreign key in MongoDB which is inconvenient to join two collections for searching and manipulating data</td>
                            </tr>
                            <tr>
                                <td>Data in MongoDB has a flexible schema</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Node.js is using JavaScript and does not require us to learn new languages</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <br><br>
                    <b class="text-danger"><u>We have read the article in http://www.cuhk.edu.hk/policy/academichonesty carefully.</u></b><br>
                    <a id="login" href="" data-href="/">Return to Login Page</a>
                </div>
            `
        );
    }
}
