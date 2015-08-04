# accounts-anonymous
============

Allow users to login anonymously (i.e. no username, email, password, or OAuth
service like accounts-google)

## Features
- Supports truly anonymous users
- Does not require accounts-password
- Fires server event when an anonymous user successfully logs in as a different
  user

## Installation
```sh
meteor add brettle:accounts-anonymous
```

## Usage

On the client, to login as a new anonymous user, call
`AccountsAnonymous.login([callback])`, while not logged in. The optional
`callback` will be called with no arguments on success, or with a single `Error`
argument on failure. If the login was successful,  Meteor will have stored a
"resume" login token in the browser's localStorage which it will automatically
send when making future  connections to the server. This token allows the user
to resume as the same anonymous user as long as the token hasn't
[expired](http://docs.meteor.com/#/full/accounts_config), been deleted (e.g. by
calling  `Accounts.logout()`), or been replaced (e.g. by logging as some other
user).

On the server, call `AccountsAnonymous.onAbandoned(func)` to register a callback
to be called if an anonymous user successfully logs in as a different user. When
this occurs, the anonymous user's token will be replaced and so there will be no
way to log in again as the anonymous user. The `func` callback takes the
anonymous user as its only argument, and could be used to clean up any data
associated with the user.

## History and Acknowledgements

This is a friendly hard fork of the excellent
[artwells:accounts-guest](https://github.com/artwells/meteor-accounts-guest)
package. Before the fork, I [contributed
code](https://github.com/artwells/meteor-accounts-guest/pull/35) which allowed
artwells:accounts-guest to be used without accounts-password. I'm forking now
because I'm not interested in the password-based guests which that package uses
and I'd also like to split out some of the features into separate packages. I
don't see any way to make these changes to artwells:accounts-guest without
breaking compatibility for existing users of that package. Thus the hard fork.
