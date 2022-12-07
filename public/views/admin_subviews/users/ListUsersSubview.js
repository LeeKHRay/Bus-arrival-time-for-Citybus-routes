import AdminSubview from '../AdminSubview.js';
import {getUserList} from '../../../js/utils.js';

export default class ListUsersSubview extends AdminSubview {
    #isDeleting;

    constructor() {
        super("User List",
            `
                <h1>User List</h1>
                <div id="result">
                    <div class="d-flex justify-content-center align-items-center m-2">
                        <div class="spinner-border mr-2"></div>
                        <strong>Loading... </strong>
                    </div>
                </div>
            `
        );
        
        this.#isDeleting = false;
        
        // update user
        $(document).on("click", "button[data-update-user-attr]", ({target}) => {
            const attr = $(target).data("updateUserAttr");
            const newValue = prompt(`Please enter the new ${attr}`)?.trim();

            if (newValue === "") {
                alert(`Please enter the new ${attr}!`);
            }
            else {
                const $this = $(target);
                const userId = $this.parent().find("span.user-id").text();

                $.ajax({
                    url: `/admin/users/${userId}?updateAttr=${attr}`,
                    type: "PUT",
                    data: {newValue}
                })
                .done(res => {
                    $this.siblings(`span.user-${attr}`).html(res.newValue);

                    alert(res.msg);
                })
                .fail(xhr => {
                    const msg = xhr.responseJSON.msg;
                    if (msg) {
                        alert(msg);
                    }
                });
            }
        });
        
        // delete user
        $(document).on("click", ".delete-user-btn", ({target}) => {
            if (this.#isDeleting) {
                return;
            }

            this.#isDeleting = true;
            const $this = $(target);
            const userId = $this.parent().find("span.user-id").text();

            $.ajax({
                url: `/admin/users/${userId}`,
                type: "DELETE"
            })
            .done(({msg}) => {
                $this.parent().remove();
                
                if ($("#result > div").length == 0) {
                    $("#result").html('<h2><strong class="text-warning">No Users</strong></h2>');
                }

                alert(msg);
                this.#isDeleting = false;
            });
        });
    }


    setContent() {
        super.setContent();

        $.get("/admin/users", res => {
            $("#result").html(getUserList(res));

            $(".user-info").append(`
                <button type="button" class="btn btn-warning mt-1 mr-3" data-update-user-attr="username">Edit Username</button>
                <button type="button" class="btn btn-warning mt-1 mr-3" data-update-user-attr="password">Edit Password</button>
                <button type="button" class="btn btn-warning mt-1 delete-user-btn">Delete</button>
            `);
        });
    }
}
