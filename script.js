// configuration
const spaceApiURL = "https://spaceapi.ccc-p.org";
const spaceApiEventEndpoint = "https://spaceapi.ccc-p.org/listen";
const eventName = "state_changed";
const refreshTime = 60; // refresh every x seconds


const states = {
    true: { icon: "open.svg", message: "Die machBar ist offen!", color: "#FFCE54", alt: "'Open' door sign" },
    false: { icon: "closed.svg", message: "Die machBar ist geschlossen!", color: "#aa593d", alt: "'Closed' door sign" },
    "error": { icon: "error.svg", message: "Ups! Da ist wohl etwas schiefgelaufen!", color: "#aa593d", alt: "Error Symbol" }
}

const eventSource = new EventSource(spaceApiEventEndpoint);

function setState(state) {
    var stateConfig = states[state];

    $("#icon").attr("src", stateConfig.icon);
    $("#icon").attr("alt", stateConfig.alt);
    $("#message").text(stateConfig.message);
    $("#message").css("color", stateConfig.color);
    $("#updateTime").text(new Date().toLocaleString());
}

function onFail() {
    setState("error");
}

function validateAndSetState(state) {
    if (typeof state === "boolean")
        setState(state);
    else
        throw "data.state.open must be boolean!";
}        

function update() {
    $.getJSON(spaceApiURL, function (data) {
        try {
            var state = data.state.open;
            validateAndSetState(state);
        }
        catch (ex) {
            onFail();
        }

    }).fail(onFail)
}

function onEvent(event){
    console.log(event.data);
    try {
        var state = event.data;
        validateAndSetState(state);
    }
    catch (ex) {
        onFail();
    }
}

function main() {
    update();
    eventSource.addEventListener(eventName, onEvent);
    // setInterval(update, refreshTime * 1000); // update state once every refreshTime seconds
}

$(document).ready(main);