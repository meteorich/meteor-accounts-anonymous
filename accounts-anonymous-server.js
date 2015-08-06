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

AccountsMultiple.register({
  onSwitch: function (attemptingUser, attempt) {
    if (isGuest(attemptingUser)) {
      AccountsAnonymous._onAbandonedHook.each(function (callback) {
          callback(attemptingUser);
          return true;
      });
    }
  }
});

var isGuest = function(user) {
  // A user is a guest if they don't have any services other than "resume"
  return (user.services && _.size(user.services) === 1 && user.services.resume);
};
