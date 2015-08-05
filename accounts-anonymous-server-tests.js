Tinytest.add('AccountsAnonymous - onAbandoned', function (test) {
  AccountsAnonymous.onAbandoned(function (user) {
    actualCalls++;
    actualId = user._id;
  });
  var actualCalls = 0;
  var expectedCalls = 0;
  var expectedId;
  var actualId;
  var connection = DDP.connect(Meteor.absoluteUrl());
  var anonId, pwId;
  try {
    // User not logged in.
    anonId = connection.call('login', { anonymous: true }).id;
    test.equal(actualCalls, expectedCalls);

    // Anonymous user logged in.
    expectedId = anonId;
    pwId = connection.call('createUser', { email: 'testuser@example.com', password: 'password' }).id;
    Meteor.users.remove(pwId);
    expectedCalls++;
    test.equal(actualCalls, expectedCalls);
    test.equal(actualId, anonId);
  } finally {
    connection.disconnect();
    anonId && Meteor.users.remove(anonId);
    pwId && Meteor.users.remove(pwId);
  }
});

Tinytest.add('AccountsAnonymous - onAbandoned - user already removed', function (test) {
  var onAbandonedCalls = 0;
  AccountsAnonymous.onAbandoned(function (user) {
    onAbandonedCalls++;
  });

  var debugCalls = 0;
  var origDebug = Meteor._debug;
  Meteor._debug = function(/*arguments*/) {
    debugCalls++
    origDebug.apply(this, arguments);
  };

  var anonId, pwId;
  var connection = DDP.connect(Meteor.absoluteUrl());
  try {
    // Create an anonymous user
    anonId = connection.call('login', { anonymous: true }).id;

    // Add a one-off validateLoginAttempt handler that removes it.
    var validateLoginStopper = Accounts.validateLoginAttempt(function() {
      validateLoginStopper.stop();
      Meteor.users.remove(anonId);
      return true;
    });

    // When we login as a new user, the above handler will remove the attempting
    // user, so onAbandoned shouldn't fire because the user has already been removed
    pwId = connection.call('createUser', { email: 'testuser@example.com', password: 'password' }).id;
    Meteor.users.remove(pwId);
    test.equal(onAbandonedCalls, 0);
    test.equal(debugCalls, 0);
  } finally {
    connection.disconnect();
    Meteor._debug = origDebug;
    anonId && Meteor.users.remove(anonId);
    pwId && Meteor.users.remove(pwId);
  }
});


Tinytest.add('AccountsAnonymous - onAbandoned - intervening handler blocks', function (test) {
  var onAbandonedCalls = 0;
  var actualId;
  AccountsAnonymous.onAbandoned(function (user) {
    onAbandonedCalls++;
    actualId = user._id;
  });

  var debugCalls = 0;
  var origDebug = Meteor._debug;
  Meteor._debug = function(/*arguments*/) {
    debugCalls++
    origDebug.apply(this, arguments);
  };

  var anonId, pwId, pwId2, pwId3;
  var anonConnection = DDP.connect(Meteor.absoluteUrl());
  var pwConnection = DDP.connect(Meteor.absoluteUrl());
  try {
    // Create an anonymous user and a non-anonymous user
    anonId = anonConnection.call('login', { anonymous: true }).id;
    pwId = pwConnection.call('createUser', { email: 'testuser@example.com', password: 'password' }).id;

    // Add a one-off validateLoginAttempt handler that internally logs in as a
    // new non-anonymous user on the non-anonymous connection. The idea is that
    // the outer login (by the anonymous user) does not complete until the inner
    // login has. We want to make sure that the inner login (by the
    // non-anonymous user) doesn't end up using the attempting user id captured
    // during the the outer login.
    var validateLoginStopper = Accounts.validateLoginAttempt(function() {
      // Remove this handler so the next login attempt goes straight through
      validateLoginStopper.stop();

      // As a non-anonymous user, create and log in as a 3rd non-anonymous user.
      pwId2 = pwConnection.call('createUser', { email: 'testuser2@example.com', password: 'password' }).id;

      // onAbandoned should *not* fire because the real attempting user is
      // not anonymous.
      test.equal(onAbandonedCalls, 0);
      test.equal(debugCalls, 0);

      return true;
    });

    // Do the outer login (by the anonymous user),
    // triggering the above validateLoginAttempt callback after the SUT's
    // validateLoginAttempt callback has captured the userId and registered
    // one-off onLogin and onLoginFailure handlers.
    pwId3 = anonConnection.call('createUser', { email: 'testuser3@example.com', password: 'password' }).id;

    // onAbandoned *should* have fired in response to that login.
    test.equal(onAbandonedCalls, 1);
    test.equal(actualId, anonId);
    test.equal(debugCalls, 0);
  } finally {
    anonConnection.disconnect();
    pwConnection.disconnect();
    Meteor._debug = origDebug;
    anonId && Meteor.users.remove(anonId);
    pwId && Meteor.users.remove(pwId);
    pwId2 && Meteor.users.remove(pwId2);
    pwId3 && Meteor.users.remove(pwId3);
  }
});
