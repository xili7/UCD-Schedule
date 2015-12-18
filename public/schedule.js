var CLIENT_ID = '714904123751-q81ourgv190smgj45sj3e0oc15aisv48.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar"];

var classEvents = classEvents || [];
var classFinalEvents = classFinalEvents || [];

var today = today || new Date();
var winterStartDate = winterStartDate || new Date(2016, 0, 4);
var newerStartDate = today.getTime() > winterStartDate.getTime() ? today : winterStartDate;
var winterEndDate = winterEndDate || new Date(2016, 2, 14, 23);

var weekdayMap = {
    'M': 'MO',
    'T': 'TU',
    'W': 'WE',
    'R': 'TH',
    'F': 'FR'
}

var weekdayNum = {
    'MO': 1,
    'TU': 2,
    'WE': 3,
    'TH': 4,
    'FR': 5
}

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
            for (var i = 0; i < events.length; i++) {
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

function convertWeekday(weekdayLettersString) {
    var weekdays = [];
    var letters = weekdayLettersString.split('')
    for(var i = 0; i < letters.length; i++) {
        weekdays.push(weekdayMap[letters[i]]);
    }
    
    return weekdays;
}

function findFirstClassDate(weekdays) {
    var firstClassDate = new Date(newerStartDate);
    
    while(true) {
        for(var i = 0; i < weekdays.length; i++) {
            if(firstClassDate.getDay() == weekdayNum[weekdays[i]]) {
                return firstClassDate;
            }
        }
        firstClassDate.setDate(firstClassDate.getDate() + 1);
    }
}

function convert12To24HourTime(oldTime) {
    
    var parts = oldTime.split(':');
    
    if(parts[1].indexOf('pm') >= 0) {
        parts[0] = Number(parts[0]) + 12;
        parts[1] = parts[1].replace('pm', '');
    } else {
        parts[0] = Number(parts[0]);
        parts[1] = parts[1].replace('am', '');
    }
    
    parts[1] = Number(parts[1]);
}


/**
 * Initiate the add selected class schedules to google calendar process.
 */
function parseClass(classContainer) {
    var classNameString = classContainer.getElementsByClassName('className')[0];
    var classNameParts = classNameString.innerHTML.split(' - ');
    
    var schedData = classContainer.getElementsByClassName('schedData')[0].children[0].children[0].children;
    
    var weekdaysArray = convertWeekday(schedData[0].innerHTML);
    var firstClassDate = findFirstClassDate(weekdaysArray);
    var firstClassEndTime = new Date(firstClassDate.toString());
    var classStartEndTime = schedData[1].innerHTML.split(' - ');
    var classStartTime = convert12To24HourTime(classStartEndTime[0]);
    var classEndTime = convert12To24HourTime(classStartEndTime[1]);
    firstClassDate.setHours(Number(classStartTime[0]), Number(classStartTime[1]));
    firstClassEndTime.setHours(Number(classEndTime[0]), Number(classEndTime[1]));
    
    var classLocation = schedData[2] + ' ' + schedData[3];
    
    var classEvent = {
        'summary': classNameParts[0],
        'location': classLocation,
        'description': classNameParts[1],
        'start': {
          'dateTime': firstClassDate.toISOString(),
          'timezone' : 'America/Los_Angeles'
        },
        'end': {
            'dateTime': firstClassEndTime.toISOString(),
            'timezone' : 'America/Los_Angeles'
        },
        'attendees': [],
        'remainders': {
            'useDefault': false,
            'overrides': [
                {'method': 'popup', 'minutes': 20}
            ]
        }
    };
    
    classEvents.push(classEvent);
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
        
        parseClass(classes[i]);
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
    window.confirm('You have' + classes.length + ' registered/waitlisted classes');
    
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