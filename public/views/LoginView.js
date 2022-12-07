import View from './View.js';
import UserView from './UserView.js';
import AdminView from './AdminView.js';
import {historyReplaceState} from '../js/utils.js';

export default class LoginView extends View {
    constructor() {
        super("Bus arrival time for Citybus Routes APP",
            `
                <div class="mx-2">
                    <h1>Bus Arrival Time for Citybus Routes APP (Group 10)</h1>
                    <h2>Login</h2>
                    <form>
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" style="width: 300px" class="form-control input-box" id="username" name="username" required>                    
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" style="width: 300px" class="form-control input-box" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-success" id="user-login">Login</button>
                    </form>
                    <a id="signup" href="" data-href="/signup">Create an account</a>
                    <br>
                    <a id="admin-login" href="">Login as admin</a>
                    <br>
                    <a id="about" href="" data-href="/about">About This Project</a>
                </div>
            `
        );
        
        $(document).on("click", "#user-login", e => {
            e.preventDefault();
            const username = $("#username").val();
            const password = $("#password").val();

            $.post("/user/login", {username, password}, ({user}) => {
                const userView = UserView.getInstance();
                userView.login(user);
                userView.setContent({});
                historyReplaceState("/user");
            })
            .fail(xhr => {
                console.log(xhr);
                const msg = xhr.responseJSON.msg;
                if (msg) {
                    alert(msg);
                }
            });
        });

        $(document).on("click", "#admin-login", e => {
            e.preventDefault();
            $.post("/admin/login", () => {
                const adminView = AdminView.getInstance();
                adminView.login();
                adminView.setContent();
                historyReplaceState('/admin');
            });
        });
    }
}
