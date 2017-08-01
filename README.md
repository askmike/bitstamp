# Bitstamp

    npm install bitstamp

A basic API wrapper for the [Bitstamp REST API](https://www.bitstamp.net/api/). Please refer to [their documentation](https://www.bitstamp.net/api/) for all calls explained. Check out `example.js` for a list of all possible calls and their parameters.

```javascript
var Bitstamp = require('bitstamp');
var bitstamp = new Bitstamp();

bitstamp.transactions('btcusd', function(err, trades) {
  console.log(trades);
});
```
## 0.3.0 - June 2016 update

API v2 is introduced, you now need to pass the market you are interested in. Note that some API calls have changed [and](https://www.bitstamp.net/api/):

> Please note that API v2 endpoints rounding is different, than the one used on the old endpoints.

## 0.1.0 - October 2013 update

The whole private API authentication process looks different now. The result is that you have to provide different information to Bitstamp (generate an API key, provide key, secret and client ID - the last is your Bitstamp user ID). Check out the new examples in `example.js`.

# Final

If this wrapper helped you in any way, you can always leave me a tip at (BTC) 1KyQdQ9ctjCrGjGRCWSBhPKcj5omy4gv5S

# License

The MIT License (MIT)

Copyright (c) 2013 Mike van Rossum mike@mvr.me

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
