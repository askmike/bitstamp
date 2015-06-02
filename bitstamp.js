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

var Bitstamp = function(key, secret, client_id) {
  this.key = key;
  this.secret = secret;
  this.client_id = client_id;

  _.bindAll(this);
}

Bitstamp.prototype._request = function(method, path, data, callback, args) {
  
  var options = {
    host: 'www.bitstamp.net',
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
        return callback(new Error('Bitstamp error ' + res.statusCode + ': ' + buffer));
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
    socket.setTimeout(5000);
    socket.on('timeout', function() {
      req.abort();
    });
    socket.on('error', function(err) {
      callback(err);
    });
  });
  
  req.end(data);

}

// if you call new Date to fast it will generate
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

Bitstamp.prototype._get = function(action, callback, args) {
  args = _.compactObject(args);
  var path = '/api/' + action + (querystring.stringify(args) === '' ? '/' : '/?') + querystring.stringify(args);
  this._request('get', path, undefined, callback, args)
}

Bitstamp.prototype._post = function(action, callback, args) {
  if(!this.key || !this.secret || !this.client_id)
    return callback(new Error('Must provide key, secret and client ID to make this API request.'));

  var path = '/api/' + action + '/';

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

Bitstamp.prototype.transactions = function(options, callback) {
  if(!callback) {
    callback = options;
    options = undefined;
  }
  this._get('transactions', callback, options);
}

Bitstamp.prototype.ticker = function(callback) {
  this._get('ticker', callback);
}

Bitstamp.prototype.order_book = function(group, callback) {
  if(!callback) {
    callback = group;
    group = undefined;
  }
  var options;
  if(typeof limit === 'object')
    options = group;
  else
    options = {group: group};
  this._get('order_book', callback, options);
}

Bitstamp.prototype.bitinstant = function(callback) {
  this._get('bitinstant', callback);
}

Bitstamp.prototype.eur_usd = function(callback) {
  this._get('eur_usd', callback);
}

// 
// Private API
// (you need to have key / secret / client ID set)
// 

Bitstamp.prototype.balance = function(callback) {
  this._post('balance', callback);
}

Bitstamp.prototype.user_transactions = function(limit, callback) {
  if(!callback) {
    callback = limit;
    limit = undefined;
  }
  var options;
  if(typeof limit === 'object')
    options = limit;
  else
    options = {limit: limit};
  this._post('user_transactions', callback, options);
}

Bitstamp.prototype.open_orders = function(callback) {
  this._post('open_orders', callback);
}

Bitstamp.prototype.cancel_order = function(id, callback) {
  this._post('cancel_order', callback, {id: id});
}

Bitstamp.prototype.buy = function(amount, price, callback) {
  this._post('buy', callback, {amount: amount, price: price});
}

Bitstamp.prototype.sell = function(amount, price, callback) {
  this._post('sell', callback, {amount: amount, price: price});
}

Bitstamp.prototype.withdrawal_requests = function(callback) {
  this._post('withdrawal_requests', callback);
}

Bitstamp.prototype.bitcoin_withdrawal = function(amount, address, callback) {
  this._post('bitcoin_withdrawal', callback, {amount: amount, address: address});
}

Bitstamp.prototype.bitcoin_deposit_address = function(callback) {
  this._post('bitcoin_deposit_address', callback);
}

Bitstamp.prototype.unconfirmed_btc = function(callback) {
  this._post('unconfirmed_btc', callback);
}

Bitstamp.prototype.ripple_withdrawal = function(amount, address, currency, callback) {
  this._post('ripple_withdrawal', callback, {amount: amount, address: address, currency: currency});
}

Bitstamp.prototype.ripple_address = function(callback) {
  this._post('ripple_address', callback);
}

// These API calls return a 404 as of `Thu Oct 31 13:54:19 CET 2013`
// even though they are still in the API documentation
Bitstamp.prototype.create_code = function(usd, btc, callback) {
  this._post('create_code', callback, {usd: usd, btc: btc});
}
Bitstamp.prototype.check_code = function(code, callback) {
  this._post('check_code', callback, {code: code});
}
Bitstamp.prototype.redeem_code = function(code, callback) {
  this._post('redeem_code', callback, {code: code});
}

module.exports = Bitstamp;
