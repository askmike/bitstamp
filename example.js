var Bitstamp = require('./bitstamp.js');

var publicBitstamp = new Bitstamp();

publicBitstamp.transactions('btceur', {time: 'hour'}, console.log);
// publicBitstamp.ticker('btceur', console.log);
// publicBitstamp.ticker_hour('btceur', console.log);
// publicBitstamp.order_book('btcusd', false, console.log);
// publicBitstamp.eur_usd(console.log);

var key = 'your-key';
var secret = 'your-secret';
var client_id = 'your-bitstamp-user-id';
var timeout = 10000;
var host = 'www.your.bitstamp.net';
var privateBitstamp = new Bitstamp(key, secret, client_id, timeout, host);

//    commented out for your protection

// privateBitstamp.balance(null, console.log);
// privateBitstamp.user_transactions('btceur', {limit: 10, offset: 5, sort: 'asc'}, console.log);
// privateBitstamp.open_orders('btcusd', console.log);
// privateBitstamp.order_status(id, console.log);
// privateBitstamp.cancel_order(id, console.log);
// privateBitstamp.cancel_all_orders(console.log)
// privateBitstamp.buy('btcusd', amount, price, limit_price, console.log);
// privateBitstamp.sell('btcusd', amount, price, limit_price, console.log);
// privateBitstamp.withdrawal_requests(console.log);
// privateBitstamp.bitcoin_withdrawal(amount, address, console.log);
// privateBitstamp.bitcoin_deposit_address(console.log);
// privateBitstamp.unconfirmed_btc(console.log);
// privateBitstamp.ripple_withdrawal(amount, address, currency);
// privateBitstamp.ripple_address(console.log);
// privateBitstamp.transfer_to_main(amount, currency, subAccount, console.log);
// privateBitstamp.transfer_from_main(amount, currency, subAccount, console.log);
