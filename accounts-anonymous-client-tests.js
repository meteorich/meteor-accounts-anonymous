"use strict";
/* globals AccountsAnonymous */

Tinytest.addAsync('AccountsAnonymous - login()', function (test, onComplete) {
	Meteor.logout(function (err) {
		test.isUndefined(err);
		test.isNull(Meteor.userId(), 'Logged out user should be null');
		AccountsAnonymous.login(function (err) {
			test.isUndefined(err);
			var firstUserId = Meteor.userId();
			test.isNotNull(firstUserId, 'Logged in user should not be null');
			AccountsAnonymous.login(function (err) {
				test.instanceOf(err, Meteor.Error);
				test.equal(err.error, AccountsAnonymous._ALREADY_LOGGED_IN_ERROR);
				var secondUserId = Meteor.userId();
				test.equal(secondUserId, firstUserId);
				Meteor.logout(function (err) {
					test.isUndefined(err);
					test.isNull(Meteor.userId(), 'Logged out user should be null');
					AccountsAnonymous.login(function (err) {
						test.isUndefined(err);
						var thirdUserId = Meteor.userId();
						test.isNotNull(thirdUserId);
						test.notEqual(thirdUserId, secondUserId);
						onComplete();
					});
				});
			});
		});
	});
});
