$(document).ready( function () {
	
$(".button-collapse").sideNav();
    $('#userMaintenanceTable').DataTable();
    $('#caresMaintenanceTable').DataTable();
    $('#reportsTable').DataTable();
    $('#logsTable').DataTable();
    $('#archivedUsersAccountsTable').DataTable();
    $('#archivedCareAccountsTable').DataTable();
    $('.modal').modal();
    $('.datepicker').pickadate({
	    selectMonths: true, // Creates a dropdown to control month
	    selectYears: 15, // Creates a dropdown of 15 years to control year,
	    today: 'Today',
	    clear: 'Clear',
	    close: 'Ok',
	    closeOnSelect: false, // Close upon selecting a date,
	    onClose: function() {
		    var x = this.get('select', 'd-m-yyyy');
		    getReportByDate(x);
		}
	  });
} );

var dt = new Date();
var month = dt.getMonth() + 1;
var dateToday = dt.getDate() + "-" + month + "-" + dt.getFullYear();

$('.dateNow').text(dateToday);

firebase.firestore().enablePersistence();
var db = firebase.firestore();
var logs = db.collection('logs');
firebase.auth().onAuthStateChanged(function(user) {
	var user = firebase.auth().currentUser;
	if (user) {
	    var user_email = user.email;
	    checkTimeInStatus(user_email);
	    checkTimeIn1(user_email);
	    checkTimeOut1(user_email);
		checkTimeIn2(user_email);
		checkTimeOut2(user_email);
		checkOverTimeIn(user_email);
		checkOverTimeInOut(user_email);
	   // console.log(user.email);
	   var docRef = db.collection('users').where("email", "==", user_email);
	   docRef.get()
	    .then(function(querySnapshot) {
	        querySnapshot.forEach(function(doc) {
	          $('#user_fullname').val(doc.data().first_name + ' ' + doc.data().middle_initial + ' ' + doc.data().last_name);
	          $('.user_fullname').text(doc.data().first_name + ' ' + doc.data().middle_initial + ' ' + doc.data().last_name);
	          $('.emp_no').text(doc.data().emp_no);
	          $('#user_email_address').val(doc.data().email);

	        });
	    })
	    .catch(function(error) {
	        console.log("Error getting documents: ", error);
	    });

	} else {
		window.location.href = 'index.html';
// 	  window.location.replace("index.html");
	}
});

// new Fingerprint2().get(function(result, components){
//   console.log(result); //a hash, representing your device fingerprint
//   console.log(components); // an array of FP components
// });

$("#timeInButton").click(function(){
	var dz = new Date();
	var time = dz.getHours() + ":" + dz.getMinutes() + ":" + dz.getSeconds();
	$('#timeInButton').addClass('hide');
	$('#timeOutButton').removeClass('hide');
	$('.TimeNow').text('Timed In: ' + time);
	$('.dateToday').text(dateToday);
	setTimeout(function(){ 
		$('.TimeNow').text('');
		$('.dateToday').text('');
	}, 5000);
	var location = $('.myLocation').html();
	var user = firebase.auth().currentUser;
  	var user_email  = user.email;
	var timeRecords = db.collection('timeRecords');
	var docRef = timeRecords.where("user_email", "==", user_email).where("date", "==", dateToday);
	   docRef.get()
	    .then(function(querySnapshot) {
	    	if(querySnapshot.empty){
	        		timeRecords.add({
	        			date: dateToday,
	        			user_email: user_email,
	        			status: 'Timed In 1',
	        			location: location,
	        			timeIn1: time
	        		})
	        	}
	        querySnapshot.forEach(function(doc) {
	          
	          if(doc.data().status === 'Timed Out 1'){
	          	timeRecords.doc(doc.id).update({
	          		timeIn2: time,
				location: location,
	          		status: 'Timed In 2'
	          	});
	          }

	          if(doc.data().status === 'Timed Out 2'){
	          	timeRecords.doc(doc.id).update({
	          		otTimeIn: time,
				location: location,
	          		status: 'Over Time In'
	          	});
	          	$('#timeOutButton').html('OT Time Out');
	          }

	          if(doc.data().status === 'Over Time Out'){
	          	$('#timeInButton').addClass('disabled');
	          }

	        });
	    })
	    .catch(function(error) {
	        console.log("Error getting documents: ", error);
	    });
});

$("#timeOutButton").click(function(){
	var dy = new Date();
	var time = dy.getHours() + ":" + dy.getMinutes() + ":" + dy.getSeconds();
	$('#timeInButton').removeClass('hide');
	$('#timeOutButton').addClass('hide');
	$('.TimeNow').text('Timed Out: ' + time);
	$('.dateToday').text(dateToday);

	setTimeout(function(){ 
		$('.TimeNow').text('');
		$('.dateToday').text('');
	}, 5000);
	var location = $('.myLocation').html();
	var user = firebase.auth().currentUser;
  	var user_email  = user.email;
	var timeRecords = db.collection('timeRecords');
	var docRef = timeRecords.where("user_email", "==", user_email).where("date", "==", dateToday);
	   docRef.get()
	    .then(function(querySnapshot) {
	        querySnapshot.forEach(function(doc) {
	          if(doc.data().status === 'Timed In 1'){
	          	timeRecords.doc(doc.id).update({
	          		timeOut1: time,
				location: location,
	          		status: 'Timed Out 1'
	          	});
	          }
	          
   	          if(doc.data().status === 'Timed In 2'){
	          	timeRecords.doc(doc.id).update({
	          		timeOut2: time,
				location: location,
	          		status: 'Timed Out 2'
	          	});
	          	$('#timeInButton').html('OT Time In');
	          }

	          if(doc.data().status === 'Over Time In'){
	          	timeRecords.doc(doc.id).update({
	          		otTimeOut: time,
				location: location,
	          		status: 'Over Time Out'
	          	});
	          	$('#timeInButton').html('End of Shift');
	          	$('#timeInButton').addClass('disabled');
	          }

	        });
	    })
	    .catch(function(error) {
	        console.log("Error getting documents: ", error);
	    });
});


$(".signOutBtn").click(function(){
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      window.location.replace('index.html');
    }).catch(function(error) {
      alert(error.message);
    });
});

$('#myAccountPassword').on('input',function() { 
  var password = $('#myAccountPassword').val();
  if(password.length < 6){
        $('#myAccountErrorMsg').removeClass('hide');
        $('#myAccountErrorMsg').html('Password should be atleast 6 characters.');
  }else{
        $('#myAccountErrorMsg').addClass('hide');
  }
});

$('#myAccountCPassword').on('input',function() {
  var password = $('#myAccountPassword').val();
  var cPassword = $('#myAccountCPassword').val();

  if (password != cPassword) {
        $('#myAccountErrorMsg').removeClass('hide');
        $('#myAccountErrorMsg').html('Passwords do not match.');
        $('.updateMyAccountBtn').addClass('disabled');
    } else {
        $('#myAccountErrorMsg').addClass('hide');
        $('.updateMyAccountBtn').removeClass('disabled');
    }
});

$(document).on('click', '.updateMyAccountBtn', function (event) {
  event.preventDefault();

  var user = firebase.auth().currentUser;
  var password  = $('#myAccountPassword').val();

  user.updatePassword(password).then(function() {
    $('#myAccount').modal('close');
    $('#myAccountPassword').val('');
	$('#myAccountCPassword').val('');
	$('.updateMyAccountBtn').addClass('disabled');
    return Materialize.toast('Perfect! Your Account has been updated.', 5000);
  }).catch(function(error) {
    console.log(error);
    $('#myAccount').modal('close');
    return Materialize.toast('Oh No! An error occured.', 5000);
  });
});

$(document).on('click', '.myAccountBtn', function (event) {
  event.preventDefault();

  var user = firebase.auth().currentUser;
  var user_email  = user.email;
  $('#myAccountEmail').val(user_email);
});

function checkTimeInStatus(email){
	var docRef = db.collection('timeRecords').where("user_email", "==", email).where("date", "==", dateToday);
	   docRef.get()
	    .then(function(querySnapshot) {
	    	if(querySnapshot.empty){
	        		$('#timeInButton').removeClass('hide');
	        	}
	        querySnapshot.forEach(function(doc) {
	        	
	          if(doc.data().status === 'Timed In 1'){
	          	$('#timeInButton').addClass('hide');
	          	$('#timeOutButton').removeClass('hide');
	          }
	          
	          if(doc.data().status === 'Timed Out 1'){
	          	$('#timeInButton').removeClass('hide');
	          	$('#timeOutButton').addClass('hide');
	          }

	          if(doc.data().status === 'Timed In 2'){
	          	$('#timeInButton').addClass('hide');
	          	$('#timeOutButton').removeClass('hide');
	          }

	          if(doc.data().status === 'Timed Out 2'){
	          	$('#timeInButton').removeClass('hide');
	          	$('#timeInButton').html('OT Time In');
	          	$('#timeOutButton').addClass('hide');
	          }

	          if(doc.data().status === 'Over Time In'){
	          	$('#timeInButton').addClass('hide');
	          	$('#timeOutButton').removeClass('hide');
	          	$('#timeOutButton').html('OT Time Out');
	          }

	          if(doc.data().status === 'Over Time Out'){
	          	$('#timeInButton').removeClass('hide');
	          	$('#timeInButton').html('End of Shift');
	          	$('#timeInButton').addClass('disabled');
	          }

	        });
	    })
	    .catch(function(error) {
	        console.log("Error getting documents: ", error);
	    });
}

function checkTimeIn1(email){
	var docRef = db.collection('timeRecords').where("user_email", "==", email).where("date", "==", dateToday);
	   docRef.onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
        	if (change.type === "added") {
                $('.timeIn1').text(change.doc.data().timeIn1);
			isLate();
            }
            if (change.type === "modified") {
            	$('.timeIn1').text(change.doc.data().timeIn1);
		    isLate();
            }
        });
    });
}

function checkTimeOut1(email){
	var docRef = db.collection('timeRecords').where("user_email", "==", email).where("date", "==", dateToday);
	   docRef.onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
        	if (change.type === "added") {
                $('.timeOut1').text(change.doc.data().timeOut1);
            }
            if (change.type === "modified") {
            	$('.timeOut1').text(change.doc.data().timeOut1);
            }
        });
    });
}

function checkTimeIn2(email){
	var docRef = db.collection('timeRecords').where("user_email", "==", email).where("date", "==", dateToday);
	   docRef.onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
        	if (change.type === "added") {
                $('.timeIn2').text(change.doc.data().timeIn2);
            }
            if (change.type === "modified") {
            	$('.timeIn2').text(change.doc.data().timeIn2);
            }
        });
    });
}

function checkTimeOut2(email){
	var docRef = db.collection('timeRecords').where("user_email", "==", email).where("date", "==", dateToday);
	   docRef.onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
        	if (change.type === "added") {
                $('.timeOut2').text(change.doc.data().timeOut2);
            }
            if (change.type === "modified") {
            	$('.timeOut2').text(change.doc.data().timeOut2);
            }
        });
    });
}

function checkOverTimeIn(email){
	var docRef = db.collection('timeRecords').where("user_email", "==", email).where("date", "==", dateToday);
	   docRef.onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
        	if (change.type === "added") {
                $('.otTimeIn').text(change.doc.data().otTimeIn);
            }
            if (change.type === "modified") {
            	$('.otTimeIn').text(change.doc.data().otTimeIn);
            }
        });
    });
}

function checkOverTimeInOut(email){
	var docRef = db.collection('timeRecords').where("user_email", "==", email).where("date", "==", dateToday);
	   docRef.onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
        	if (change.type === "added") {
                $('.otTimeOut').text(change.doc.data().otTimeOut);
            }
            if (change.type === "modified") {
            	$('.otTimeOut').text(change.doc.data().otTimeOut);
            }
        });
    });
}

function getReportByDate(date){
  var email = $('#user_email_address').val();
    $('.reportTimeIn1').text('');
    $('.reportTimeOut1').text('');
    $('.reportTimeIn2').text('');
    $('.reportTimeOut2').text('');
    $('.reportOverTimeIn').text('');
    $('.reportOverTimeOut').text('');
    $('.reportPlace').text('');

  var docRef = db.collection('timeRecords');
  docRef.where("user_email", "==", email).where("date", "==", date)
    .onSnapshot(function(snapshot) {
          if(snapshot.empty){
		  $('.reportErrorMessage').removeClass('hide');
		  $('.with-header').addClass('hide');
            console.log('no Records');
          }
        snapshot.docChanges.forEach(function(change) {
		$('.reportErrorMessage').addClass('hide');
		$('.with-header').removeClass('hide');
          if (change.type === "added") {
                $('.reportDate').html(date);
                $('.reportTimeIn1').text(change.doc.data().timeIn1);
                $('.reportTimeOut1').text(change.doc.data().timeOut1);
                $('.reportTimeIn2').text(change.doc.data().timeIn2);
                $('.reportTimeOut2').text(change.doc.data().timeOut2);
                $('.reportOverTimeIn').text(change.doc.data().otTimeIn);
                $('.reportOverTimeOut').text(change.doc.data().otTimeOut);
                $('.reportPlace').text(change.doc.data().location);
            }
            if (change.type === "modified") {
                $('.reportDate').html(date);
                $('.reportTimeIn1').text(change.doc.data().timeIn1);
                $('.reportTimeOut1').text(change.doc.data().timeOut1);
                $('.reportTimeIn2').text(change.doc.data().timeIn2);
                $('.reportTimeOut2').text(change.doc.data().timeOut2);
                $('.reportOverTimeIn').text(change.doc.data().otTimeIn);
                $('.reportOverTimeOut').text(change.doc.data().otTimeOut);
                $('.reportPlace').text(change.doc.data().location);
            }
        });
    }); 
}


		    
function isLate(){
	var value = $('.timeIn1').text();
	var x = "8:00:00";
	var z = "6:00:00";
	var late  = "8:15:00";
	if(value > x || value < z){
		console.log('ok');
	}
	if(value > late){
		console.log('late');
	}
}
		   
