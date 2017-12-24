'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

_.mixin({
  // compact for objects
  compactObject: to_clean => {
    _.map(to_clean, (value, key, toClean) => {
      if (value === undefined) {delete toClean[key];}
    });
    return to_clean;
  }
});

// error object this lib returns
const BitstampError = function BitstampError (message, meta) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.meta = meta;
};

const Bitstamp = function (key, secret, client_id, timeout, host) {
  this.key = key;
  this.secret = secret;
  this.client_id = client_id;
  this.timeout = timeout || 5000;
  this.host = host || 'www.bitstamp.net';

  _.bindAll(this);
};


Bitstamp.prototype._request = function (method, path, data) {
  let timeout = this.timeout;
  const options = {
    host: this.host,
    path,
    method,
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; Bitstamp node.js client)'
    }
  };

  if (method === 'post') {
    options.headers['Content-Length'] = data.length;
    options.headers['content-type'] = 'application/x-www-form-urlencoded';
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      res.setEncoding('utf8');
      let buffer = '';
			
      res.on('data', response => {
        buffer += response;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          let message;

          try {
            message = JSON.parse(buffer);
          } catch (e) {
            message = buffer;
          }

          reject(new BitstampError('Bitstamp error ' + res.statusCode, message));
        }
        try {
          let json = JSON.parse(buffer);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.on('socket', socket => {
      socket.setTimeout(timeout);
      socket.on('timeout', () => {
        req.abort();
      });
    });

    req.end(data);
  });
};

// if you call new Date too fast it will generate
// the same ms, helper to make sure the nonce is
// truly unique (supports up to 999 calls per ms).
Bitstamp.prototype._generateNonce = function () {
  let now = new Date().getTime();

  if (now !== this.last) {this.nonceIncr = -1;}

  this.last = now;
  this.nonceIncr++;

  // add padding to nonce incr
  // @link https://stackoverflow.com/questions/6823592/numbers-in-the-form-of-001
  let padding =
    this.nonceIncr < 10 ? '000' :
      this.nonceIncr < 100 ? '00' :
        this.nonceIncr < 1000 ? '0' : '';
  return now + padding + this.nonceIncr;
};

Bitstamp.prototype._get = async function (market, action, args) {
  args = _.compactObject(args);

  let path;
  if (market) {
    path = '/api/v2/' + action + '/' + market;
  } else {
    // some documented endpoints (eg `https://www.bitstamp.net/api/eur_usd/`)
    // do not go via the v2 api.
    path = '/api/' + action;
  }

  path += (querystring.stringify(args) === '' ? '/' : '/?') + querystring.stringify(args);
  return await this._request('get', path, undefined, args);
};


Bitstamp.prototype._post = async function (market, action, args, legacy_endpoint) {
  if (!this.key || !this.secret || !this.client_id) {
    throw 'Must provide key, secret and client ID to make this API request.';
  } else {
    let path;
    if (legacy_endpoint) {
      path = '/api/' + action + '/';
    } else {
      if (market) {
        path = '/api/v2/' + action + '/' + market + '/';
      } else {
        path = '/api/v2/' + action + '/';
      }
    }

    let nonce = this._generateNonce();
    let message = nonce + this.client_id + this.key;
    const signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
    const signature = signer.update(message).digest('hex').toUpperCase();

    args = _.extend({
      key: this.key,
      signature: signature,
      nonce: nonce
    }, args);

    args = _.compactObject(args);
    let data = querystring.stringify(args);

    return await this._request('post', path, data, args);
  }
};

//
// Public API
//

Bitstamp.prototype.transactions = async function (market, options, callback) {
  if (!callback) {
    callback = options;
    options = undefined;
  }
  return await this._get(market, 'transactions', options);
};

Bitstamp.prototype.ticker = async function (market) {
  return await this._get(market, 'ticker');
};

Bitstamp.prototype.ticker_hour = async function (market) {
  return await this._get(market, 'ticker_hour');
};

Bitstamp.prototype.order_book = async function (market) {
  return await this._get(market, 'order_book');
};

Bitstamp.prototype.eur_usd = async function () {
  return await this._get(null, 'eur_usd');
};

//
// Private API
// (you need to have key / secret / client ID set)
//

Bitstamp.prototype.balance = async function (market) {
  return await this._post(market, 'balance');
};

Bitstamp.prototype.user_transactions = async function (market, options) {
  return await this._post(market, 'user_transactions', options);
};

Bitstamp.prototype.open_orders = async function (market) {
  return await this._post(market, 'open_orders');
};

Bitstamp.prototype.order_status = async function (id) {
  return await this._post(null, 'order_status', {id}, true);
};

Bitstamp.prototype.cancel_order = async function (id) {
  return await this._post(null, 'cancel_order', {id}, true);
};

Bitstamp.prototype.cancel_all_orders = async function () {
  return await this._post(null, 'cancel_all_orders', null, true);
};

Bitstamp.prototype.buy = async function (market, amount, price, limit_price) {
  return await this._post(market, 'buy', {
    amount,
    price,
    limit_price
  });
};

Bitstamp.prototype.buyMarket = async function (market, amount) {
  return await this._post(market, 'buy/market', {
    amount
  });
};

Bitstamp.prototype.sell = async function (market, amount, price, limit_price) {
  return await this._post(market, 'sell', {
    amount,
    price,
    limit_price
  });
};

Bitstamp.prototype.sellMarket = async function (market, amount) {
  return await this._post(market, 'sell/market', {
    amount
  });
};

Bitstamp.prototype.withdrawal_requests = async function () {
  return await this._post(null, 'withdrawal_requests', null, true);
};

Bitstamp.prototype.bitcoin_withdrawal = async function (amount, address, instant) {
  return await this._post(null, 'bitcoin_withdrawal', {
    amount,
    address,
    instant
  }, true);
};

Bitstamp.prototype.xrp_withdrawal = async function (amount, address, destination_tag) {
  return await this._post(null, 'xrp_withdrawal', {
    amount,
    address,
    destination_tag
  }, true);
};

Bitstamp.prototype.bitcoin_deposit_address = async function () {
  return await this._post(null, 'bitcoin_deposit_address', null, true);
};

Bitstamp.prototype.unconfirmed_btc = async function () {
  return await this._post(null, 'unconfirmed_btc', null, true);
};


// the API documentation is wrong as of `Sat Jun 11 2016 10:10:07`.
// It doesn't corectly list this call. Therefor not sure if all
// arguments are correct.
Bitstamp.prototype.ripple_withdrawal = async function (amount, address, currency) {
  return await this._post(null, 'ripple_withdrawal', {
    amount,
    address,
    currency
  }, true);
};

Bitstamp.prototype.ripple_address = async function () {
  return await this._post(null, 'ripple_address', null, true);
};

Bitstamp.prototype.transfer_to_main = async function (amount, currency, subAccount) {
  return await this._post(null, 'transfer-to-main', {
    amount,
    currency,
    subAccount
  }, true);
};

Bitstamp.prototype.transfer_from_main = async function (amount, currency, subAccount) {
  return await this._post(null, 'transfer-from-main', {
    amount,
    currency,
    subAccount
  }, true);
};

module.exports = Bitstamp;
