BlazeLayout.setRoot('body');

Session.set("resize", null);
Meteor.startup(function() {

  // add class to body to turn off the cookies/local storage notification
  $(document.body).addClass('meteor-loaded')

  window.addEventListener('resize', function(){
    Session.set("resize", new Date());
  });

  // on start-up, if no user, set language to chinese
  if (!Meteor.userId()) {
		console.log("New User, Welcome!");
  }

  if (Meteor.isCordova) {

    document.addEventListener("deviceready", deviceReady, false);

    function deviceReady() {
      // override navigation back button
      document.addEventListener("backbutton", function(e) {
        e.preventDefault();
        navigator.app.exitApp();
        console.log("App should be exit");
      });

      // update Geolocation very 10s
      App.Utils.Geolocation.updateGPSCoordOnChange(10000);
      // update wifi config every 5s
      App.Utils.WifiWizard.updateWifiConfigOnChange(5000);

      //Test pushing notification "World, Hello!"
      App.Utils.Notification.scheduleSingleNotification("World, Hello!");

      console.log("Device is ready");
    }
  }
});
