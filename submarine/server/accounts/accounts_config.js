/**
 * Meteor Accounts Settings,
 * define what to do when new user created, How to send reset password email
 */

Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: false
})

/**
 * Initialize student User account with basic data on first login
 */
Accounts.onCreateUser((options, user) => {

  // prevent useraccount package override username
  user.profile = {
    profileSeed: Random.id(8)
  };
  user.allowBeRecommended = true;

  return user;
});

/**
 * Set reset password email template, initialized when server startup
 */
App.Initializer.configureResetEmail = function() {
  Accounts.emailTemplates.siteName = "Submarine";
  Accounts.emailTemplates.from = "noreply.submarine.cse110@gmail.com";
  Accounts.emailTemplates.resetPassword.subject = (user) =>
    "Reset your password on Submarine";

  Accounts.emailTemplates.resetPassword.text = (user, url) =>
    "Copy the token to specified field to reset your password: \r\n\n\n" +  url;

  Accounts.emailTemplates.resetPassword.html = (user, url) =>
    "<p>Copy the token to specified field to reset your password:</p><p>" + url + "</p>";

  Accounts.urls.resetPassword = (token) => token
};
