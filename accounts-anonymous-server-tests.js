"use strict";
/* globals AccountsMultiple, AccountsAnonymous */

Tinytest.add(
  'AccountsAnonymous - onAbandoned',
  function (test) {
    AccountsMultiple._unregisterAll();
    AccountsAnonymous._init();
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
      pwId = connection.call('createUser',
        { email: 'testuser@example.com', password: 'password' }
      ).id;
      Meteor.users.remove(pwId);
      expectedCalls++;
      test.equal(actualCalls, expectedCalls);
      test.equal(actualId, anonId);
    } finally {
      connection.disconnect();
      if (anonId)  { Meteor.users.remove(anonId); }
      if (pwId) { Meteor.users.remove(pwId); }
    }
  }
);

Tinytest.add(
  'AccountsAnonymous - onAbandoned - user already removed',
  function (test) {
    AccountsMultiple._unregisterAll();
    AccountsAnonymous._init();
    var onAbandonedCalls = 0;
    AccountsAnonymous.onAbandoned(function (/* user (unused) */) {
      onAbandonedCalls++;
    });

    var debugCalls = 0;
    var origDebug = Meteor._debug;
    Meteor._debug = function(/*arguments*/) {
      debugCalls++;
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

      // When we login as a new user, the above handler will remove the
      // attempting user. onAbandoned will still fire but no errors should
      // occur.
      pwId = connection.call('createUser',
        { email: 'testuser@example.com', password: 'password' }
      ).id;
      Meteor.users.remove(pwId);
      test.equal(onAbandonedCalls, 1);
      test.equal(debugCalls, 0);
    } finally {
      connection.disconnect();
      Meteor._debug = origDebug;
      if (anonId) { Meteor.users.remove(anonId); }
      if (pwId) { Meteor.users.remove(pwId); }
    }
  }
);
