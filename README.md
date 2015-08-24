# brettle:accounts-anonymous

[![Build Status](https://travis-ci.org/brettle/meteor-accounts-anonymous.svg?branch=master)](https://travis-ci.org/brettle/meteor-accounts-anonymous)

Allow users to login anonymously (i.e. no username, email, password, or OAuth
service like accounts-google)

This package is part of the `brettle:accounts-*` suite of packages. See
[`brettle:accounts-deluxe`](https://atmospherejs.com/brettle/accounts-deluxe)
for an overview of the suite and a live demo.

## Features
- Supports truly anonymous users
- Does not require accounts-password
- Fires server event when an anonymous user logs in as a different user

## Installation
```sh
meteor add brettle:accounts-anonymous
```

## Usage

On the client, to login as a new anonymous user, call
`AccountsAnonymous.login([callback])`, while not logged in. The optional
`callback` runs with no arguments on success, or with a single `Error` argument
on failure. If the login was successful,  Meteor will have stored a "resume"
login token in the browser's localStorage which it will automatically send when
making future  connections to the server. This token allows the user to resume
as the same anonymous user as long as the token exists (i.e. the user hasn't
logged out or logged in as some other user), and hasn't
[expired](http://docs.meteor.com/#/full/accounts_config).

On the server, call `AccountsAnonymous.onAbandoned(func)` to register a callback
to call if an anonymous user logs in as a different user. When this occurs,
Meteor replaces the anonymous user's token with the new user's token, so there
will be no way to log in again as the anonymous user. The `func` callback takes
the anonymous user as its sole argument. You might use the call back  to clean
up any data associated with the user.

## History and Acknowledgements

This is a friendly hard fork of the great
[artwells:accounts-guest](https://github.com/artwells/meteor-accounts-guest)
package. Before the fork, I [contributed
code](https://github.com/artwells/meteor-accounts-guest/pull/35) which added
support for using artwells:accounts-guest without accounts-password. I'm forking
now because I'm not interested in the password-based guests which that package
uses and I'd also like to split out some of the features into separate packages.
I don't see any way to make these changes to artwells:accounts-guest without
breaking compatibility for existing users of that package. Thus the hard fork.
