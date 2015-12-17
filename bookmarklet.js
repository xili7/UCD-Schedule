javascript:(
    function(){
        if(~window.location.href.indexOf('my.ucdavis.edu')) {
            var g = document.createElement('script');
            g.src = 'https://ucdxili7.azurewebsites.net/schedule.js';
            document.body.appendChild(g);
        } else {
            window.alert('Please only use this bookmarklet in myucdavis HOME page. Please also have your UCD account logged in.');
        }
    }
)();

//This is the URL of the bookmarket.