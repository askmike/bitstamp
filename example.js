var Bitstamp = require('./bitstamp.js');

var publicBitstamp = new Bitstamp();

publicBitstamp.transactions({time: 'hour'}, console.log);
// publicBitstamp.ticker(console.log);
// publicBitstamp.order_book(false, console.log);
// publicBitstamp.eur_usd(console.log);

var key = 'your key';
var secret = 'your secret';
var client_id = '0'; // your Bitstamp user ID
var privateBitstamp = new Bitstamp(key, secret, client_id);

//    commented out for your protection

// privateBitstamp.balance(console.log);
// privateBitstamp.user_transactions({limit: 10, offset: 5, sort: 'asc'}, console.log);
// privateBitstamp.open_orders(console.log);
// privateBitstamp.cancel_order(id, console.log);
// privateBitstamp.buy(amount, price, console.log);
// privateBitstamp.sell(amount, price, console.log);
// privateBitstamp.withdrawal_requests(console.log);
// privateBitstamp.bitcoin_withdrawal(amount, address, console.log);
// privateBitstamp.bitcoin_deposit_address(console.log);
// privateBitstamp.unconfirmed_btc(console.log())
// privateBitstamp.ripple_withdrawal(amount, address, currency)
// privateBitstamp.ripple_address(console.log)


//		Bistamp is currently (Thu Oct 31 13:54:19 CET 2013) 
//		returning 404's when doing these calls

// privateBitstamp.create_code(usd, btc, console.log);
// privateBitstamp.check_code(code, console.log);
// privateBitstamp.redeem_code(code, console.log);

//    Bistamp is currently (Tue Aug 26 19:31:55 CEST 2014) 
//    returning 404's when doing these calls

// publicBitstamp.bitinstant(console.log);