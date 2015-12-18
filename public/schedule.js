var CLIENT_ID = '714904123751-q81ourgv190smgj45sj3e0oc15aisv48.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar"];

var classEvents = [];
var classFinalEvents = [];
var count = 0;

var today;
var winterStartDate;
var newerStartDate;
var winterEndDate;
var selectedCalendarID;

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
 * Load Google Calendar client library. Add class schedules to google calendar.
 * once client library is loaded.
 */
function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', addClassCallBack);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function addClassCallBack() {
    for(var i = 0; i < classEvents.length; i++) {
        var request = gapi.client.calendar.events.insert({
            'calendarId': selectedCalendarID,
            'resource': classEvents[i]
        });
    
        request.execute(function(event) {
            count++;
            if(count == classEvents.length) {
                if(window.confirm('Finished adding all events to Google Calendar! Refresh or sync your google calendar to see the changes!')) {
                    window.location.refresh();
                } else {
                    window.location.refresh();
                }
            }
        });
    }
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
    var firstClassDate = moment(newerStartDate);
    
    while(true) {
        for(var i = 0; i < weekdays.length; i++) {
            if(firstClassDate.days() == weekdayNum[weekdays[i]]) {
                return firstClassDate;
            }
        }
        firstClassDate.add(1, 'days');
    }
}

function getCorrectClassStartEndTimes(classIntervalString) {
    var parts = classIntervalString.split(' - ');
    var startParts = parts[0].split(':');
    var endParts = parts[1].split(':');
    var isPM = endParts[1].indexOf('PM') >= 0;
    var returnArray = [];
    
    if(isPM) {
        if(Number(startParts[0]) < 10) {
            returnArray[0] = Number(startParts[0]) + 12;
        } else {
            returnArray[0] = Number(startParts[0]);
        }
        returnArray[2] = Number(endParts[0]) + 12;
    } else {
        returnArray[0] = Number(startParts[0]);
        returnArray[2] = Number(endParts[0]);
    }
    
    returnArray[1] = Number(startParts[1]);
    returnArray[3] = Number(endParts[1].substring(0, 2));
    
    return returnArray;
}


/**
 * Parse a class schedule, create class event(s) from it, and store the class events into the classEvents array.
 * NOTE: There can be more than 1 class events in a class event when there's discussion/lab.
 */
function parseClass(classContainer) {
    var classNameString = classContainer.getElementsByClassName('className')[0];
    var classNameParts = classNameString.innerHTML.split(' - ');
    
    var schedData = classContainer.getElementsByClassName('schedData')[0].children[0].children;
    
    for(var i = 0; i < schedData.length - 2; i++) {
        var currentSchedData = schedData[i].children;
        var weekdaysArray = convertWeekday(currentSchedData[0].innerHTML);
        var firstClassDate = findFirstClassDate(weekdaysArray);
        var firstClassEndTime = moment(firstClassDate);
        var correctTimeParts = getCorrectClassStartEndTimes(currentSchedData[1].innerHTML);
        firstClassDate.hours(correctTimeParts[0]);
        firstClassDate.minutes(correctTimeParts[1]);
        firstClassEndTime.hours(correctTimeParts[2]);
        firstClassEndTime.minutes(correctTimeParts[3]);
        
        var classLocation = currentSchedData[2].innerHTML + ' ' + currentSchedData[3].innerHTML;
        
        firstClassDate.utc();
        winterEndDate.utc();
        var rruleString = 'FREQ=WEEKLY;UNTIL=' + winterEndDate.format('YYYYMMDD[T]HHmmss[Z]') + ';WKST=SU;BYDAY=' + weekdaysArray.toString();
        firstClassDate.local();
        var classEvent = {
            'summary': classNameParts[0],
            'location': classLocation,
            'description': classNameParts[1],
            'start': {
            'dateTime': firstClassDate.format(),
            'timeZone' : 'America/Los_Angeles'
            },
            'end': {
                'dateTime': firstClassEndTime.format(),
                'timeZone' : 'America/Los_Angeles'
            },
            'recurrence': [
                'RRULE:' + rruleString
            ],
            'attendees': [],
            'attachments': [],
            'remainders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'popup', 'minutes': 20}
                ]
            }
        };
    
        classEvents.push(classEvent);
    }
}

/**
 * Initiate the add selected class schedules to google calendar process.
 */
function addClassesToCalendar(event) {
    var classes = document.getElementById('my_schedule2_container').getElementsByClassName('class_container');
    classEvents = [];
    
    for(var i = 0; i < classes.length; i++) {
        if(!classes[i].firstChild.firstChild.checked) {
            continue;
        }
        parseClass(classes[i]);
    }
    addClassCallBack();
    
    return false;
}

/**
 * Adds the calendar list drop down menu to DOM.
 */

function addCalendarSelectionMenu() {
    var request = gapi.client.calendar.calendarList.list({'minAccessRole': 'writer'});
    request.execute(function(response) {
        var calendarMenu = document.createElement('select');
        calendarMenu.class = "form-control";
        calendarMenu.onchange = function() {selectedCalendarID = this.value;};
        
        var calendars = response.items;
        for(var i = 0; i < calendars.length; i++) {
            var option = document.createElement('option');
            option.value = calendars[i].id;
            option.innerHTML = calendars[i].summary;
            calendarMenu.appendChild(option);
        }
        selectedCalendarID = calendars[0].id;
        
        quarterForm.insertBefore(calendarMenu, quarterForm.children[0]);
        quarterForm.insertAdjacentHTML('afterbegin', 'Choose one of your calendars');
    });
}


/**
 * Create selection boxes in response to user clicking select quarter button.
 *
 * @param {Event} event Button click event.
 */
function handleQuarterSelectClick(event) {
    quarterForm.children[0].style.display = 'none';
    quarterForm.getElementsByTagName('select')[0].style.display = 'none';
    gapi.client.load('calendar', 'v3', addCalendarSelectionMenu);
    
    var classes = document.getElementById('my_schedule2_container').getElementsByClassName('class_container');
    window.confirm('You have ' + classes.length + ' registered/waitlisted classes');
    
    for(var i = 0; i < classes.length; i++) {
        addCheckBox(classes[i], i);
    }
    
    var addScheduleDiv = document.getElementById('addSchedule-div');
    addScheduleDiv.firstChild.innerHTML = 'Select classes below, then click me to add them to Google Calendar!';
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
        
        today = moment();
        winterStartDate = moment([2016, 0, 4]);
        newerStartDate = today.diff(winterStartDate) > 0 ? today : winterStartDate;
        winterEndDate = moment([2016, 2, 14, 23]);
    }
}