var CLIENT_ID = '714904123751-q81ourgv190smgj45sj3e0oc15aisv48.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar"];

var classEvents = classEvents || {};
var classFinalEvents = classFinalEvents || {};

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


/**
 * Create and show checkbox before the class names
 */
function addCheckBox(classContainer, i) {
    var firstChild = classContainer.firstChild;
    var checkBoxDiv = document.createElement('div');
    var checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = true;
    checkBox.id = 'classCheckBox' + i;
    checkBoxDiv.appendChild(checkBox);
    checkBox.insertAdjacentHTML('afterend', " add class schedule to google calendar");
    classContainer.insertBefore(checkBoxDiv, firstChild);
}


/**
 * Initiate the add selected class schedules to google calendar process.
 */
function parseClass(classContainer, i) {
    
}

/**
 * Initiate the add selected class schedules to google calendar process.
 */
function addClassesToCalendar(event) {
    var classes = document.getElementById('my_schedule2_container').getElementsByClassName('class_container');
    
    for(var i = 0; i < classes.length; i++) {
        if(!classes[i].firstChild.firstChild.checked) {
            continue;
        }
        
        parseClass(classes[i], i);
    }
    return false;
}


/**
 * Create selection boxes in response to user clicking select quarter button.
 *
 * @param {Event} event Button click event.
 */
function handleQuarterSelectClick(event) {
    quarterForm.getElementsByTagName('select')[0].style.display = 'none';
    var classes = document.getElementById('my_schedule2_container').getElementsByClassName('class_container');
    window.confirm(classes.length);
    
    for(var i = 0; i < classes.length; i++) {
        addCheckBox(classes[i], i);
    }
    
    var addScheduleDiv = document.getElementById('addSchedule-div');
    addScheduleDiv.firstChild.innerHTML = 'Add the selected classes to Google Calendar!'
    addScheduleDiv.firstChild.setAttribute('onClick', 'addClassesToCalendar(event)');
    return false;
}

/**
 * initializations
 * add the authorization/quarter selection buttons
 */
var quarterForm;
{
    quarterForm = document.getElementsByName('schedTermForm')[0];
    if(quarterForm == null) {
        window.alert("Please login your UCD account and go to MyUCDavis home page.");
    } else {
        var authorizeDiv = document.getElementById('authorize-div');
        if(typeof(authorizeDiv) == 'undefined' || authorizeDiv == null) {
            authorizeDiv = document.createElement('div');
            authorizeDiv.id = 'authorize-div';
            var authorizeButton = document.createElement('button');
            authorizeButton.innerHTML = 'Login a google account';
            authorizeButton.type = 'button';
            authorizeDiv.appendChild(authorizeButton);
            authorizeButton.setAttribute('onClick', 'handleAuthClick(event)');
            quarterForm.appendChild(authorizeDiv);
        }
        
        var addScheduleDiv = document.getElementById('addSchedule-div') 
        if(typeof(addScheduleDiv) == 'undefined' || addScheduleDiv == null) {
            addScheduleDiv = document.createElement('div');
            addScheduleDiv.id = 'addSchedule-div';
            var addScheduleButton = document.createElement('button');
            addScheduleButton.innerHTML = 'Select a quarter, then click me!';
            addScheduleButton.type = 'button'
            addScheduleDiv.appendChild(addScheduleButton);
            addScheduleButton.setAttribute('onClick', 'handleQuarterSelectClick(event)');
            quarterForm.appendChild(addScheduleDiv);
        }
        addScheduleDiv.style.displayer = 'none';
        
        
        if(document.getElementById('onLoadCheckAuth') == null) {
            var f = document.createElement('script');
            f.id = 'onLoadCheckAuth';
            f.src = 'https://apis.google.com/js/client.js?onload=checkAuth';
            document.body.appendChild(f);
        } else {
            checkAuth();
        }
    }
}