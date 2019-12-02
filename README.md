# Privacy-Node

A simple wrapper for the [Privacy.com](https://www.privacy.com) API.
Can be easily implemented into a node.js application to view/track spending, or in an Autocheckout application to select cards to use.

## To install with npm or yarn:
```
```

## To install with GitHub:
```
git clone https://github.com/aiomonitors/Privacy-Node-Wrapper
cd Privacy-Node-Wrapper
npm install
```

Note: If installing with GitHub, require the Privacy.js file in your project

# Usage
Note: All functions are async, and can be called with Promises or `await`
## Initialization
```js
const Privacy = require('privacy-api')
const account = new Privacy("API KEY", development = true)
//Note: Set development to true if you are using the sandbox
```

## Cards
### Fetch all cards
Params:
    `paginate`: Iterate through all pages of response - Defaults to `true`
```js
account.getAllCards(paginate = true).then(cards => {
    //Do stuff with array of cards
})
```
