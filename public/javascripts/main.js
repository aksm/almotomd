/**
 * Created by anthony on 10/22/16.
 */

//API by Anthony
var userAPI = '/userlist';

// console.log('hello');

$.ajax({
    url: userAPI,
    method: 'GET'
}).done(function (response) {
    $.each(response, function (key, value) {


        // console.log(key);
        // console.log(value);
        $('#userlist').append('<li class="collection-item click-to-call white-text transparent" data-user="' + value.username + '" data-id="' + value._id + '"><div>' + value.username + '<a href="#!" class="secondary-content"><i class="material-icons white-text">videocam</i></a> <a href="#!" class="secondary-content"><i class="material-icons white-text">chat</i></a> <a href="#!" class="secondary-content"><i class="material-icons white-text">phone</i></a></div></li>');

    });

});

$(document).on('click','.click-to-call', function () {
    var id = $(this).attr('data-id');
    var currentUrl = window.location.origin;
    var URL = currentUrl + '/page/' + id
    $.get(URL, function(data){
    	console.log('success');
    });


});
$(document).ready(function() {
    $('select').material_select();
});