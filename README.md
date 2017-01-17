# Ride Along

> A simple ride sharing service for Grinnell College students.

## Installing Dependencies

Right after you clone, or if your are getting errors, be sure to run `yarn` or `npm install` if you
are still using npm.

## Developing

To start a live-reloading development server, run `yarn serve` or `npm run serve`.  A specific port
can be specified by adding it as an argument like so: `yarn serve 8080`.  To run tslint on the
project, run `yarn lint` or `npm run lint`.  You can optionally fix errors with
`yarn lint -- --fix` or `npm run lint -- --fix`, or pass any other commands to the linter.

## Building

To create a production build, run `yarn build` or `npm run build`.  Then run `yarn serve:build` or
`npm run serve:build` to start the production server.  A port can be specified just like with
`yarn serve`.

## Deploying

To create a deployment build, run `yarn build:deploy` or `npm run build:deploy`.  `yarn serve:build`
still works for testing.  There is not yet a command to actually deploy.  You may need to
`yarn`/`npm install` afterwards.
