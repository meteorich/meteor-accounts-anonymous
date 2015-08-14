Accounts.registerLoginHandler("anonymous", function (options) {
    if (! options || ! options.anonymous || Meteor.userId())
        return undefined;

    var newUserId = Accounts.insertUserDoc(options, {});
    return {
        userId: newUserId
    };
});

AccountsAnonymous._onAbandonedHook = new Hook({
  bindEnvironment: false,
  debugPrintExceptions: "AccountsAnonymous.onAbandoned callback"
});

AccountsAnonymous.onAbandoned = function (func) {
  var self = this;
  return self._onAbandonedHook.register(func);
};

var callbackSet = {
  onSwitch: function (attemptingUser, attempt) {
    if (isAnonymous(attemptingUser)) {
      AccountsAnonymous._onAbandonedHook.each(function (callback) {
          callback(attemptingUser);
          return true;
      });
    }
  }
};

AccountsAnonymous._init = function () {
  AccountsMultiple.register(callbackSet);
};

AccountsAnonymous._init();

function isAnonymous(user) {
  // A user is anonymous if they don't have any services other than "resume"
  return (user.services && _.size(user.services) === 1 && user.services.resume);
}
