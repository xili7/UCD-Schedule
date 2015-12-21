javascript:(
    function(){
        if(~window.location.href.indexOf('my.ucdavis.edu')) {
            var f  = document.createElement('script');
            f.src= 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js';
            document.body.appendChild(f);
            
            var g = document.createElement('script');
            g.src = 'https://ucdxili7.azurewebsites.net/schedule.js';
            document.body.appendChild(g);
        } else {
            window.alert('Please only use this bookmarklet in myucdavis HOME page. Please also have your UCD account logged in.');
        }
    }
)();

//Copy and paste this whole file as the URL of the bookmark.
//You can skip these 2 lines though.