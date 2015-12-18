# UCD-Schedule
A bookmarklet that helps UCD students add their class schedule to Google Calendar.

##How to use  
1. Drag this <a href="javascript:(function(){if(~window.location.href.indexOf('my.ucdavis.edu')) {var f  = document.createElement('script');f.src='https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js';document.body.appendChild(f);var g = document.createElement('script');g.src = 'https://ucdxili7.azurewebsites.net/schedule.js';document.body.appendChild(g);} else {window.alert('Please only use this bookmarklet in myucdavis HOME page. Please also have your UCD account logged in.');}})();">link</a>  to your browser's bookmark bar.
2. Go to [my.ucdavis.edu](my.ucdavis.edu), and login your UCD account.
3. Click the bookmark.
4. Follow the instructions in the mySchedule tile.
