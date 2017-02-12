# Publications Admin

> Web client for editing and managing publications.

## Installing Dependencies

Right after you clone, or if your are getting errors, be sure to run `yarn` or `npm install` if you
are still using npm.

## Developing

To start a live-reloading development server, run `yarn serve` or `npm run serve`.  To run tslint
on the project, run `yarn lint` or `npm run lint`.  You can optionally fix errors with
`yarn lint -- --fix` or `npm run lint -- --fix`, or pass any other commands to the linter.

## Building

To create a production build, run `yarn build` or `npm run build`.  Then run `yarn serve:build` or
`npm run serve:build` to start the production server.  A port can be specified just like with
`yarn serve`.

## Deploying

Make sure you are signed into the aws cli with the AppDev account. Be sure to run `yarn build` or
`npm run build`, then `yarn deploy` or `npm run deploy` to deploy to the s3 bucket called
`publications-admin-site`.
