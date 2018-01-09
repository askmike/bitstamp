var querystring = require("querystring");
var https = require('https');
var _ = require('underscore');
var crypto = require('crypto');

_.mixin({
  // compact for objects
  compactObject: function(to_clean) {
    _.map(to_clean, function(value, key, to_clean) {
      if (value === undefined)
        delete to_clean[key];
    });
    return to_clean;
  }
});

// error object this lib returns
var BitstampError = function BitstampError(message, meta) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.meta = meta;
};

var Bitstamp = function(key, secret, client_id, timeout, host) {
  this.key = key;
  this.secret = secret;
  this.client_id = client_id;
  this.timeout = timeout || 5000;
  this.host = host || 'www.bitstamp.net';

  _.bindAll(this);
}

Bitstamp.prototype._request = function(method, path, data, callback, args) {
  var timeout = this.timeout;
  var options = {
    host: this.host,
    path: path,
    method: method,
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; Bitstamp node.js client)'
    }
  };

  if(method === 'post') {
    options.headers['Content-Length'] = data.length;
    options.headers['content-type'] = 'application/x-www-form-urlencoded';
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var buffer = '';
    res.on('data', function(data) {
      buffer += data;
    });
    res.on('end', function() {
      if (res.statusCode !== 200) {
        var message;

        try {
          message = JSON.parse(buffer);
        } catch(e) {
          message = buffer;
        }

        return callback(new BitstampError('Bitstamp error ' + res.statusCode, message));
      }
      try {
        var json = JSON.parse(buffer);
      } catch (err) {
        return callback(err);
      }
      callback(null, json);
    });
  });

  req.on('error', function(err) {
    callback(err);
  });

  req.on('socket', function (socket) {
    socket.setTimeout(timeout);
    socket.on('timeout', function() {
      req.abort();
    });
  });

  req.end(data);
}

// if you call new Date too fast it will generate
// the same ms, helper to make sure the nonce is
// truly unique (supports up to 999 calls per ms).
Bitstamp.prototype._generateNonce = function() {
  var now = new Date().getTime();

  if(now !== this.last)
    this.nonceIncr = -1;

  this.last = now;
  this.nonceIncr++;

  // add padding to nonce incr
  // @link https://stackoverflow.com/questions/6823592/numbers-in-the-form-of-001
  var padding =
    this.nonceIncr < 10 ? '000' :
      this.nonceIncr < 100 ? '00' :
        this.nonceIncr < 1000 ?  '0' : '';
  return now + padding + this.nonceIncr;
}

Bitstamp.prototype._get = function(market, action, callback, args) {
  args = _.compactObject(args);

  if(market)
    var path = '/api/v2/' + action + '/' + market;
  else
    // some documented endpoints (eg `https://www.bitstamp.net/api/eur_usd/`)
    // do not go via the v2 api.
    var path = '/api/' + action;

  path += (querystring.stringify(args) === '' ? '/' : '/?') + querystring.stringify(args);
  this._request('get', path, undefined, callback, args)
}

Bitstamp.prototype._post = function(market, action, callback, args, legacy_endpoint) {
  if(!this.key || !this.secret || !this.client_id)
    return callback(new Error('Must provide key, secret and client ID to make this API request.'));

  if(legacy_endpoint)
    var path = '/api/' + action + '/';
  else {
    if(market)
      var path = '/api/v2/' + action + '/' + market + '/';
    else
      var path = '/api/v2/' + action + '/';
  }

  var nonce = this._generateNonce();
  var message = nonce + this.client_id + this.key;
  var signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
  var signature = signer.update(message).digest('hex').toUpperCase();

  args = _.extend({
    key: this.key,
    signature: signature,
    nonce: nonce
  }, args);

  args = _.compactObject(args);
  var data = querystring.stringify(args);

  this._request('post', path, data, callback, args);
}

//
// Public API
//

Bitstamp.prototype.transactions = function(market, options, callback) {
  if(!callback) {
    callback = options;
    options = undefined;
  }
  this._get(market, 'transactions', callback, options);
}

Bitstamp.prototype.ticker = function(market, callback) {
  this._get(market, 'ticker', callback);
}

Bitstamp.prototype.ticker_hour = function(market, callback) {
  this._get(market, 'ticker_hour', callback);
}

Bitstamp.prototype.order_book = function(market, group, callback) {
  if(!callback) {
    callback = group;
    group = undefined;
  }
  var options;
  if(typeof limit === 'object')
    options = group;
  else
    options = {group: group};
  this._get(market, 'order_book', callback, options);
}

// This API calls are removed from the documentation as of `Sat Jun 11 2016 10:10:07`
// Bitstamp.prototype.bitinstant = function(callback) {
//   this._get('bitinstant', callback);
// }

Bitstamp.prototype.eur_usd = function(callback) {
  this._get(null, 'eur_usd', callback);
}

//
// Private API
// (you need to have key / secret / client ID set)
//

Bitstamp.prototype.balance = function(market, callback) {
  this._post(market, 'balance', callback);
}

Bitstamp.prototype.user_transactions = function(market, options, callback) {
  if(!callback) {
    callback = options;
    options = undefined;
  }
  this._post(market, 'user_transactions', callback, options);
}

Bitstamp.prototype.open_orders = function(market, callback) {
  this._post(market, 'open_orders', callback);
}

Bitstamp.prototype.order_status = function (id, callback) {
  this._post(null, 'order_status', callback, {id: id}, true);
};

Bitstamp.prototype.cancel_order = function(id, callback) {
  this._post(null, 'cancel_order', callback, {id: id}, true);
}

Bitstamp.prototype.cancel_all_orders = function(callback) {
  this._post(null, 'cancel_all_orders', callback, null, true);
}

Bitstamp.prototype.buy = function(market, amount, price, limit_price, callback) {
  this._post(market, 'buy', callback, {
    amount: amount,
    price: price,
    limit_price: limit_price
  });
}

Bitstamp.prototype.buyMarket = function(market, amount, callback) {
  this._post(market, 'buy/market', callback, {
    amount: amount
  });
}

Bitstamp.prototype.sell = function(market, amount, price, limit_price, callback) {
  this._post(market, 'sell', callback, {
    amount: amount,
    price: price,
    limit_price: limit_price
  });
}

Bitstamp.prototype.sellMarket = function(market, amount, callback) {
  this._post(market, 'sell/market', callback, {
    amount: amount
  });
}

Bitstamp.prototype.withdrawal_requests = function(callback) {
  this._post(null, 'withdrawal_requests', callback, null, true);
}

Bitstamp.prototype.bitcoin_withdrawal = function(amount, address, instant, callback) {
  this._post(null, 'bitcoin_withdrawal', callback, {
    amount: amount,
    address: address,
    instant: instant
  }, true);
}

Bitstamp.prototype.xrp_withdrawal = function(amount, address, destination_tag, callback) {
  this._post(null, 'xrp_withdrawal', callback, {
    amount: amount,
    address: address,
    destination_tag: destination_tag
  }, true);
}

Bitstamp.prototype.bitcoin_deposit_address = function(callback) {
  this._post(null, 'bitcoin_deposit_address', callback, null, true);
}

Bitstamp.prototype.unconfirmed_btc = function(callback) {
  this._post(null, 'unconfirmed_btc', callback, null, true);
}


// the API documentation is wrong as of `Sat Jun 11 2016 10:10:07`.
// It doesn't corectly list this call. Therefor not sure if all
// arguments are correct.
Bitstamp.prototype.ripple_withdrawal = function(amount, address, currency, callback) {
  this._post(null, 'ripple_withdrawal', callback, {
    amount: amount,
    address: address,
    currency: currency
  }, true);
}

Bitstamp.prototype.ripple_address = function(callback) {
  this._post(null, 'ripple_address', callback, null, true);
}

Bitstamp.prototype.transfer_to_main = function(amount, currency, subAccount, callback) {
  this._post(null, 'transfer-to-main', callback, {
    amount: amount,
    currency: currency,
    subAccount: subAccount
  }, true);
}

Bitstamp.prototype.transfer_from_main = function(amount, currency, subAccount, callback) {
  this._post(null, 'transfer-from-main', callback, {
    amount: amount,
    currency: currency,
    subAccount: subAccount
  }, true);
}

Bitstamp.prototype.new_liquidation_address = function(liquidationCurrency, callback) {
  this._post(null, 'liquidation_address/new', callback, {
    liquidation_currency: liquidationCurrency
  });
}

Bitstamp.prototype.info_liquidation_address = function(address, callback) {
  this._post(null, 'liquidation_address/info', callback, {
    address: address
  });
}

module.exports = Bitstamp;
