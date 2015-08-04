AccountsAnonymous.login = function (callback) {
  callback = callback || function () {};
  if (Meteor.userId()) {
    callback(new Meteor.Error('accounts-anonymous-already-logged-in',
      "You can't login anonymously while you are already logged in."));
    return;
  }
  Accounts.callLoginMethod({
    methodArguments: [{
      anonymous: true
    }],
    userCallback: function (error, result) {
      if (error) {
        callback && callback(error);
      } else {
        callback && callback();
      }
    }
  });
}
