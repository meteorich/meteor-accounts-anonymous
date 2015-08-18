"use strict";
/* globals AccountsAnonymous */

AccountsAnonymous.login = function (callback) {
  callback = callback || function () {};
  if (Meteor.userId()) {
    callback(new Meteor.Error(AccountsAnonymous._ALREADY_LOGGED_IN_ERROR,
      "You can't login anonymously while you are already logged in."));
    return;
  }
  Accounts.callLoginMethod({
    methodArguments: [{
      anonymous: true
    }],
    userCallback: function (error) {
      if (error) {
        if (callback) { callback(error); }
      } else {
        if (callback) { callback(); }
      }
    }
  });
};
