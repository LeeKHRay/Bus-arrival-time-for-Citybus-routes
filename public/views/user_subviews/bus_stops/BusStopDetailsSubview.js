import UserView from '../../UserView.js';
import UserSubview from '../UserSubview.js';
import {createMap, historyReplaceState} from '../../../js/utils.js';

export default class BusStopDetailsSubview extends UserSubview {
    constructor() {
        super("Bus Stop Details", `
            <h1 class="d-none">Bus Stop Details</h1>
            <div id="details">
                <div class="d-flex justify-content-center align-items-center m-2">
                    <div class="spinner-border mr-2"></div>
                    <strong>Loading... </strong>
                </div>
            </div>
            
        `);

        // adding comment click
        $(document).on("click", "#add-comment-btn", e => {
            e.preventDefault();
        
            const content = $("#comment").val().trim();
            const now = new Date().toLocaleString("en-GB");
            
            if (content) {
                $.post("/user/comments", {
                    content,
                    busStopId: $("#bus-stop-id").text(),
                    datetime: now
                }, () => {
                    this.#addComment(content, now, UserView.getInstance().username);
                    $("form").trigger("reset");
                });
            }
            else {
                alert("Please enter your comment");
            }
        });
    }

    #addComment(content, datetime, username) {
        if ($("#comment-list").length === 0) {
            $("#comments").html(`<ul id="comment-list" class="list-unstyled overflow-auto" style="height: 60vh"></ul>`);
        }

        const newComment = `
            <li class="media">
                <div class="media-body border border-info rounded-top rounded-bottom px-2">
                    <h5 class="text-primary">${username}</h5>
                    <p>${content}</p>
                    <p class="text-right">${datetime}</p>
                </div>
            </li>
        `;
        $("#comment-list").append($(newComment));
    }

    setContent({busStopId}) {
        super.setContent();

        $.get(`/user/bus-stops/${busStopId}`, res => {
            const {busStopId, name, latitude, longitude, comments, favNum, eta} = res;

            // show details
            let etaList = "";
            if (eta?.length > 0) {
                for (const {routeId, dir, time} of eta) {
                    etaList += `
                        <li>Route ${routeId} (${dir == "I" ? "Inbound" : "Outbound"}): ${time.join(", ")}</li>
                    `
                }
            }

            $("h1.d-none").removeClass("d-none");
            $("#details").html(`
                <div class="row mr-1">
                    <div class="col-12 col-lg">
                        <div class="row">
                            <div class="col-12 border-bottom mb-2">
                                <b>Bus Stop ID: <span id="bus-stop-id">${busStopId}</span></b><br>
                                Name: ${name}<br>
                                Location (latitude, longitude): (${latitude}, ${longitude})<br>
                                #Favourites: <span>${favNum}</span><br>
                                Estimated time of arrival:
                                ${etaList ? `<br><ul>${etaList}</ul>` : " N/A"}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12" style="height: 650px">
                                <div id="bus-stop-details-map" class="h-100 w-100"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg mt-2 mt-lg-0">
                        <div class="row">
                            <div class="col-12 border-bottom">
                                <h3>Comments</h3>
                                <div id="comments">
                                    <ul id="comment-list" class="list-unstyled overflow-auto" style="height: 560px"></ul>
                                </div>
                            </div>
                            <div class="col-12">
                                <form>
                                    <div class="form-group">
                                        <label for="comment">Your comment</label>
                                        <textarea class="form-control" id="comment" name="comment" rows="3"></textarea>
                                    </div>
                                </form>
                                <button type="button" id="add-comment-btn" class="btn btn-success">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            `)

            if (comments.length > 0) {
                // show comments
                for (const {username, content, datetime} of comments) {
                    this.#addComment(content, datetime, username);
                }
            }
            else {
                $("#comments").html("<h6>There are no comments for this bus stop yet</h6>");
            }

            // show bus stop location in map
            const map = createMap("bus-stop-details-map", {latitude, longitude});
            new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);
        })
        .fail(xhr => {
            if (xhr.status === 404) {
                UserView.getInstance().setContent({});
                historyReplaceState("/user");
            }
        });
    }
}