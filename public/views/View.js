export default class View {
    static instance = null;

    #title;
    #html;

    constructor(title, html) {
        this.#title = title;
        this.#html = html;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        
        return this.instance
    }

    get html() {
        return this.#html;
    }

    get title() {
        return this.#title;
    }

    setContent() {
        $("title").text(this.#title);
        $("#content").html(this.#html);
    }
}