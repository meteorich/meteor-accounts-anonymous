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

var WithoutBindingEnvironment = {};

WithoutBindingEnvironment.run = function(func) {
  var saved = Meteor.bindEnvironment;
  try {
    Meteor.bindEnvironment = dontBindEnvironment;
    return func();
  } finally {
    Meteor.bindEnvironment = saved;
  }
};

// Copied from Meteor.bindEnvironment and removed all the env stuff.
var dontBindEnvironment = function (func, onException, _this) {
  if (!onException || typeof(onException) === 'string') {
    var description = onException || "callback of async function";
    onException = function (error) {
      Meteor._debug(
        "Exception in " + description + ":",
        error && error.stack || error
      );
    };
  }

  return function (/* arguments */) {
    var args = _.toArray(arguments);

    var runAndHandleExceptions = function () {
      try {
        var ret = func.apply(_this, args);
      } catch (e) {
        onException(e);
      }
      return ret;
    };

    return runAndHandleExceptions();
  };
};

var loginAttemptHandler = function () {
  var attemptingUserId = Meteor.userId();
  var onLoginStopper = Accounts.onLogin(function (attempt) {
    onLoginStopper.stop();
    onLoginFailureStopper.stop();
    if (attemptingUserId != null && attempt.type != 'resume') {
      var attemptingUser = Meteor.users.findOne({ _id: attemptingUserId });
      if (isGuest(attemptingUser)) {
        AccountsAnonymous._onAbandonedHook.each(function (callback) {
            callback(attemptingUser);
            return true;
        });
      }
    }
  });
  var onLoginFailureStopper = Accounts.onLoginFailure(function (attempt) {
    onLoginStopper.stop();
    onLoginFailureStopper.stop();
  });
  return true;
};

WithoutBindingEnvironment.run(function () {
  Accounts.validateLoginAttempt(loginAttemptHandler);
});

var isGuest = function(user) {
  // A user is a guest if they don't have any services other than "resume"
  return (user.services && _.size(user.services) === 1 && user.services.resume);
};
