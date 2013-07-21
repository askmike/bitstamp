var querystring = require("querystring");
var https = require('https');
var _ = require('underscore');

_.mixin({
  // compact for objects
  compactObject: function(to_clean) {
    _.map(to_clean, function(value, key, to_clean) {
      if (value === undefined) {
        delete to_clean[key];
      }
    });
    return to_clean;
  }
});  

var Bitstamp = function(user, password) {
  this.user = user;
  this.password = password;

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

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var buffer = '';
    res.on('data', function(data) {
      buffer += data;
    });
    res.on('end', function() {
      try {
        var json = JSON.parse(buffer);
      } catch (err) {
        return callback(err);
      }
      callback(null, json);
    });
  });
  req.end(data);
}

Bitstamp.prototype._get = function(action, callback, args) {
  args = _.compactObject(args);
  var path = '/api/' + action + '/?' + querystring.stringify(args);
  this._request('get', path, undefined, callback, args)
}

Bitstamp.prototype._post = function(action, callback, args) {
  if(!this.user || !this.password)
    return callback('Must provide key and secret to make this API request.');

  var path = '/api/' + action + '/';
  args = _.extend({user: this.user, password: this.password}, args);
  args = _.compactObject(args);
  var data = querystring.stringify(args);

  this._request('post', path, data, callback, args);
}

// 
// Public API
// 

Bitstamp.prototype.transactions = function(timedelta, callback) {
  if(!callback) {
    callback = timedelta;
    timedelta = undefined;
  }
  this._get('transactions', callback, {timedelta: timedelta});
}

Bitstamp.prototype.ticker = function(callback) {
  this._get('ticker', callback);
}

Bitstamp.prototype.order_book = function(group, callback) {
  if(!callback) {
    callback = group;
    group = undefined;
  }
  this._get('order_book', callback, {group: group});
}

Bitstamp.prototype.bitinstant = function(callback) {
  this._get('bitinstant', callback);
}

Bitstamp.prototype.eur_usd = function(callback) {
  this._get('eur_usd', callback);
}

// 
// Trading API
// (you need to have user / password set)
// 

Bitstamp.prototype.balance = function(callback) {
  this._post('balance', callback);
}

Bitstamp.prototype.user_transactions = function(timedelta, callback) {
  if(!callback) {
    callback = timedelta;
    timedelta = undefined;
  }
  this._post('user_transactions', callback, {timedelta: timedelta});
}

Bitstamp.prototype.open_orders = function(callback) {
  this._post('open_orders', callback);
}

Bitstamp.prototype.cancel_order = function(id, callback) {
  this._post('user_transactions', callback, {id: id});
}

Bitstamp.prototype.buy = function(amount, price, callback) {
  this._post('buy', callback, {amount: amount, price: price});
}

Bitstamp.prototype.sell = function(amount, price, callback) {
  this._post('sell', callback, {amount: amount, price: price});
}

Bitstamp.prototype.create_code = function(usd, btc, callback) {
  this._post('create_code', callback, {usd: usd, btc: btc});
}

Bitstamp.prototype.check_code = function(code, callback) {
  this._post('check_code', callback, {code: code});
}

Bitstamp.prototype.redeem_code = function(code, callback) {
  this._post('redeem_code', callback, {code: code});
}

Bitstamp.prototype.sendtouser = function(customer_id, currency, amount, callback) {
  this._post('sendtouser', callback, {customer_id: customer_id, currency: currency, amount: amount});
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

module.exports = Bitstamp;