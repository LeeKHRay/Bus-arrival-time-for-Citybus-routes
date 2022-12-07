import AdminSubview from '../AdminSubview.js';

export default class CreateUserSubview extends AdminSubview {
    constructor() {
        super("Create New User",
            `
                <h1>Create New User</h1>
                <form>
                    <div class="form-group">
                        <label for="username">Username(between 4 and 20 charcters)</label>
                        <input type="text" style="width: 300px" class="form-control inputBox" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password(between 4 and 20 charcters)</label>
                        <input type="password" style="width: 300px" class="form-control inputBox" id="password" name="password" required>
                    </div>
                    <button type="button" class="btn btn-success" id="create-user-btn">Create</button>
                    <p id="msg"></p>
                </form>
            `
        );
        
        // create user
        $(document).on("click", "#create-user-btn", e => {
            const username = $("#username").val();
            const password = $("#password").val();

            $.post("/admin/users", {username, password}, res => {
                $("#msg").html(res.msg);
                $("form").trigger("reset");
            })
            .fail(xhr => {
                const msg = xhr.responseJSON.msg;
                if (msg) {
                    $("#msg").html(msg);
                }
            });
        });
    }
}
