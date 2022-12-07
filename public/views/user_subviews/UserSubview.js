import View from "../View.js";

export default class UserSubview extends View {
    constructor(title, html) {
        super(title, html);
    }

    setContent() {
        $("title").text(this.title);
        $("#user-content").html(this.html);
    }
}