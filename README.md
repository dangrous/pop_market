# Pop Market

## Overview

**Pop Market** is an interface for betting on the success of songs in Spotify's Global Top 50 playlist. Players log in through Oauth via Spotify, and are able to buy or sell songs at prices determined by their place on the playlist. Spotify updates this playlist every day, so it ideally would become a daily routine. On first login, players are given 1000 points to spend. The top ten users by net worth (available points added to the value of songs in their portfolio) are shown for comparison.

This application makes use of [Spotify's API](https://developer.spotify.com/documentation/web-api/) for OAuth (the Authorization code flow) as well as for pulling the song lists and creating the links back to listen to the songs (using the simpler client credentials flow). It stores the encrypted user id as a cookie to allow for easy access without re-logging in.

This project is built with React / Redux on the front end (styled with Bootstrap) and Node.js / Express on the back end. The data is stored in MongoDB, accessed via Mongoose. The front end was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Live Link

A version of this application is running on Fly.io [here](https://pop-market.fly.dev/).

## To Run

Run `npm install` in both the front end and back end directories.

You'll also want to update the `.env_dummy` file into a `.env` file using the appropriate values for your development environment.

You can either run the ends separately, using `npm start` in each directory, or you can build the front end into the back end using first `npm run build` and then `cp -r build ../backend` in the `/frontend` directory. Then you'll be able to simply `npm start` in the `/backend` directory and be good to go!

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
