/*****************
 * special anonymous behavior so that visitors can
 * manipulate their work
 *
 */

// If our app has a Blaze, override the {{currentUser}} helper to deal guest logins
if (Package.blaze) {
    /**
     * @global
     * @name  currentUser
     * @isHelper true
     * @summary Calls [Meteor.user()](#meteor_user). Use `{{#if currentUser}}` to check whether the user is logged in.
     * Where "logged in" means: The user has has authenticated (e.g. through providing credentials)
     */
    Package.blaze.Blaze.Template.registerHelper('currentUser', function () {
        var user = Meteor.user();
        if (user && _.isEmpty(user.services))
          return null;
        if (user &&
            typeof user.profile !== 'undefined' &&
            typeof user.profile.guest !== 'undefined' &&
            user.profile.guest &&
            AccountsGuest.name === false){
            // a guest login is not a real login where the user is authenticated.
            // This allows the account-base "Sign-in" to still appear
            return null;
        } else {
            return Meteor.user();
        }
    });
}

Meteor.loginVisitor = function (email, callback) {
    if (!Meteor.userId()) {
        Accounts.callLoginMethod({
            methodArguments: [{
                email: email,
                createGuest: true
            }],
            userCallback: function (error, result) {
                if(error) {
                    callback && callback(error);
                } else {
                    callback && callback();
                }
            }
        });
    }
}

//no non-logged in users
/* you might need to limit this to avoid flooding the user db */
Meteor.startup(function(){
    Deps.autorun(function () {
        if (!Meteor.userId()) {
            if (AccountsGuest.forced === true) {
                Meteor.loginVisitor();
            }
        }
    });
});
