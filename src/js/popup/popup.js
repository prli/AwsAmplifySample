import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AuthProfile from '../authentication/authProfile';

// check if user is authenticated already
AuthProfile.getAuthProfile().then((data) => {
  if (data) {
    $('#loginButton').click();
  }
});

// Adding onclick action listener to "Login" button of extension popup
$('#loginButton').click(function (e) {
  AuthProfile.authenticate().then(() => {
    $('#searchBar').removeClass('d-none');
    $('#loginButton').addClass('d-none');
  });
  e.preventDefault();
});