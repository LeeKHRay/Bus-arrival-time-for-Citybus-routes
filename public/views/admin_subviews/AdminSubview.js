import View from "../View.js";

export default class AdminSubview extends View {
    constructor(title, html) {
        super(title, html);
    }

    setContent() {
        $("title").text(this.title);
        $("#admin-content").html(this.html);
    }
}