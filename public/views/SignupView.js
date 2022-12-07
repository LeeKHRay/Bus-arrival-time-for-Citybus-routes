import View from './View.js';
import LoginView from './LoginView.js';
import {historyPushState} from '../js/utils.js';

export default class SignupView extends View {
    constructor() {
        super("Sign Up",
            `
                <div class="mx-2">
                    <h2>Sign Up</h2>
                    <form>
                        <div class="form-group">
                            <label for="username">Username(between 4 and 20 charcters)</label>
                            <input type="text" style="width: 300px" class="form-control inputBox" id="username" name="username" required>
                            <label for="password">Password(between 4 and 20 charcters)</label>
                            <input type="password" style="width: 300px" class="form-control inputBox" id="password" name="password" required>
                            <label for="repeatPassword">Repeat your password</label>
                            <input type="password" style="width: 300px" class="form-control inputBox" id="repeatPassword" name="repeatPassword" required>
                        </div>
                        <button type="submit" class="btn btn-success" id="signup-submit">Sign up</button>
                    </form>
                    <a id="login" href="" data-href="/">Login</a>
                </div>
            `
        );
        
        $(document).on("click", "#signup-submit", e => {
            e.preventDefault();
            const username = $("#username").val();
            const password = $("#password").val();
            const repeatPassword = $("#repeatPassword").val();

            $.post("/signup", {username, password, repeatPassword}, ({msg}) => {
                alert(msg);
                LoginView.getInstance().setContent();
                historyPushState("/");
            })
            .fail(xhr => {
                const msg = xhr.responseJSON.msg;
                if (msg) {
                    alert(msg);
                }
            });
        });
    }
}
