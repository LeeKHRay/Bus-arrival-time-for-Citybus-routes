import AdminSubview from './AdminSubview.js';

export default class CSVSubview extends AdminSubview {
    #isUploading;

    constructor() {
        super("Create Bus Stop Data from CSV", `
            <h1>Create Bus Stop Data from CSV</h1>
            <h4>Please follow the format below:</h4>
            <h5>Data format: bus stop ID, name, latitude, longitude, route ID, sequence number, direction</h5>
            <img src="/csv_format.jpg" alt="format of CSV file">
            <h6 class="mt-2">Reminder:<i><br>
            1. Headers must be provided.<br>
            2. The bus stop name should <strong>NOT</strong> include any ",".<br>
            3. Bus stop ID should be a 6-unit string of value.<br>
            4. Direction should be "I" for Inbound or "O" for Outbound.<br>
            5. Rows with invalid format will be ignored.<br>
            6. Rows containing existing bus stop ID or existing sequence number of the corresponding route will be ignored.
            </i></h6>

            <form>
                <div class="input-group w-50 mt-2 mb-2">
                    <div class="custom-file">
                        <input type="file" class="custom-file-input" id="csv-file" accept=".csv" required>
                        <label id="csv-file-label" class="custom-file-label" for="csv-file">Choose file</label>
                    </div>
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button" id="submit-file">Upload File</button>
                    </div>
                </div>
            </form>

            <h3 id="msg"></h3>
            <div id="saved-data"></div>
        `);

        this.#isUploading = false;

        // check if file is valid
        $(document).on("change", "#csv-file", ({target}) => {
            let tokens = $(target).val().split('\\');
            const filename = tokens[tokens.length - 1];
            tokens = filename.split('.');

            if (tokens[tokens.length - 1] == "csv") { // check file format
                $("#csv-file-label").html(filename);
            }
            else {
                $("#csv-file-label").html('Choose File');
                $("#csv-file").val('');
                alert("Please choose a CSV file!");
            }
        });

        // submit csv file
        $(document).on("click", "#submit-file", () => {
            if (this.#isUploading) {
                return;
            }

            if (!$("#csv-file").val()) {
                alert("Please choose a CSV file!");
            }
            else {
                this.#isUploading = true;
                $("#saved-data").html("");
                $("#msg").html("Uploading...");

                Papa.parse($("#csv-file").prop("files")[0], {
                    header: true,
                    skipEmptyLines: "greedy",
                    error: (err, file, inputE, reason) => {
                        console.log(err, file, inputE, reason);
                        $("#csv-file-label").html('Choose File');
                        $("form").trigger("reset");
                        $("#msg").html("");
                        alert("Cannot parse the file!");
                        this.#isUploading = false;
                    },
                    complete: results => {
                        $("#csv-file-label").html('Choose File');
                        $("form").trigger("reset");
            
                        $.post("/admin/csv", {data: results.data}, res => {
                            this.#listSavedCSVData(res.savedData);
                        })
                        .fail(xhr => {
                            const msg = xhr.responseJSON.msg;
                            if (msg) {
                                alert(msg);
                            }
                        })
                        .always(() => {
                            $("#msg").html("");
                            this.#isUploading = false;
                        });
                    }
                });
            }
        });
    }

    #listSavedCSVData(busStops) {
        let rows = "";

        for (const {busStopId, name, latitude, longitude, routeId, dir, seq} of busStops) {
            rows += `
                <tr>
                    <td>${busStopId}</td>                    
                    <td>${name}</td>
                    <td>${latitude}</td>
                    <td>${longitude}</td>
                    <td>${routeId}</td>
                    <td>${dir}</td>
                    <td>${seq}</td>
                </tr>
            `;
        };
        
        const table = `
            <h3>Saved Bus Stop Data</h3>
            <table class='table table-hover text-center text-dark mx-auto'>
                <thead class="thead-light" style="position: sticky; top: 0"><tr>
                    <th>Bus Stop ID</th>
                    <th>Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Route ID</th>
                    <th>Direction</th>
                    <th>Sequence Number</th>
                </tr></thead>
                <tbody>${rows}</tbody>                
            </table>
        `;
        
        $("#saved-data").html(table);
    }
}