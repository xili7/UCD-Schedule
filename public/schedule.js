var CLIENT_ID = '714904123751-q81ourgv190smgj45sj3e0oc15aisv48.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar"];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize(
        {
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
        }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    var addButtonDiv = document.getElementById('addSchedule-div');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        addButtonDiv.style.display = 'inline';
        loadCalendarApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
        addButtonDiv.style.display = 'none';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            handleAuthResult);
    return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
    var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    request.execute(function(resp) {
        var events = resp.items;
        appendPre('Upcoming events:');

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                appendPre(event.summary + ' (' + when + ')')
            }
        } else {
            appendPre('No upcoming events found.');
        }

    });
}

{
    var quarterForm = document.getElementsByName('schedTermForm')[0];
       
    var authorize_div = document.getElementById('authorize-div');
    if(typeof(authorize_div) == 'undefined' || authorize_div == null) {
        authorize_div = document.createElement('div');
        authorize_div.id = 'authorize-div';
        var authorize_button = document.createElement('button');
        authorize_button.innerHTML = 'Login a google account';
        authorize_div.appendChild(authorize_button);
        authorize_button.setAttribute('onClick', 'handleAuthClick(event)');
        quarterForm.appendChild(authorize_div);
    }
    
    var addSchedule_div = document.getElementById('addSchedule_div') 
    if(typeof(addSchedule_div) == 'undefined' || addSchedule_div == null) {
        addSchedule_div = document.createElement('div');
        addSchedule_div.id = 'addSchedule-div';
        var addSchedule_button = document.createElement('button');
        addSchedule_button.innerHTML = 'Add current schedule to google calendar';
        addSchedule_div.appendChild(addSchedule_button);
        addSchedule_button.setAttribute('onClick', 'handleAuthClick(event)');
        quarterForm.appendChild(addSchedule_div);
    }
    addSchedule_div.style.displayer = 'none';
    
    
    if(document.getElementById('onLoadCheckAuth') == null) {
        var f = document.createElement('script');
        f.id = 'onLoadCheckAuth';
        f.src = 'https://apis.google.com/js/client.js?onload=checkAuth';
        document.body.appendChild(f);
    } else {
        checkAuth();
    }
}