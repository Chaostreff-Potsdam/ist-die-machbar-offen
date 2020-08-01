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
    try {
        var state = JSON.parse(event.data);
        validateAndSetState(state);
    }
    catch (ex) {
        onFail();
    }
}

function setupEventSource(){
    const eventSource = new EventSource(spaceApiEventEndpoint);
    eventSource.onerror = function(err) {
        console.log("EventSource failed.");
        // fallback to polling
        setInterval(update, refreshTime * 1000); // update state once every refreshTime seconds
        // make sure event source is closed
        eventSource.close();
      };
    eventSource.addEventListener(eventName, onEvent);
    $(window).on('beforeunload', function(){
        eventSource.close();
    });
}

function main() {
    update();
    setupEventSource();
}

$(document).ready(main);
