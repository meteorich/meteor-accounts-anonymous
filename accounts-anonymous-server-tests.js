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
    var anonId = connection.call('login', { anonymous: true }).id;
    test.equal(actualCalls, expectedCalls);

    // Anonymous user logged in.
    expectedId = anonId;
    var pwId = connection.call('createUser', { email: 'testuser@example.com', password: 'password' }).id;
    Meteor.users.remove({ _id: pwId });
    expectedCalls++;
    test.equal(actualCalls, expectedCalls);
    test.equal(actualId, anonId);
  } finally {
    connection.disconnect();
    anonId && Meteor.users.remove({ _id: anonId });
    anonId && Meteor.users.remove({ _id: pwId });
  }
});
