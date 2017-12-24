'use strict';

const Bitstamp = require('./bitstamp.js');

////////////////////
// Public API calls
const publicBitstamp = new Bitstamp();

publicBitstamp.ticker('btceur').then(result => {
  console.log('ticker btceur',result);
});
/*publicBitstamp.ticker_hour('btceur').then(result => {
  console.log('ticker_hour btceur',result);
});
publicBitstamp.transactions('btceur', {time: 'hour'}).then(result => {
  console.log('transactions btceur',result);
});
publicBitstamp.order_book('btceur').then(result => {
  console.log('order_book btceur',result);
});
publicBitstamp.eur_usd().then(result => {
  console.log('eur_usd',result);
});
*/
////////////////////
// Private API calls
const configFilePath ='./config/dev.json';
let config;
try {
  config = require(configFilePath);
}catch (e) {
  console.error("Run 'mv config/sample.json "+configFilePath+ "' and fill the file with your credentials\n",e); 
}
if (config) {
  const privateBitstamp = new Bitstamp(config.key, config.secret, config.client_id, config.timeout, config.host);

  privateBitstamp.balance().then(result => {
    console.log('balance',result);
  });
  //    commented out for your protection
  /*privateBitstamp.user_transactions('btceur', {
    limit: 10, offset: 5, sort: 'asc'
  }).then(result => {
    console.log('user_transactions btceur',result);
  });
  privateBitstamp.open_orders('btcusd').then(result => {
    console.log('open_orders btcusd',result);
  });
  privateBitstamp.order_status(id).then(result => {
    console.log('order_status',result);
  });
  privateBitstamp.cancel_order(id).then(result => {
    console.log('cancel_order',result);
  });
  privateBitstamp.cancel_all_orders().then(result => {
    console.log('cancel_all_orders',result);
  });
  privateBitstamp.buy('btcusd', amount, price, limit_price).then(result => {
    console.log('buy btcusd',result);
  });
  privateBitstamp.sell('btcusd', amount, price, limit_price).then(result => {
    console.log('sell btcusd',result);
  });
  privateBitstamp.withdrawal_requests().then(result => {
    console.log('withdrawal_requests',result);
  });
  privateBitstamp.bitcoin_withdrawal(amount, address).then(result => {
    console.log('bitcoin_withdrawal',result);
  });
  privateBitstamp.bitcoin_deposit_address().then(result => {
    console.log('bitcoin_deposit_address',result);
  });
  privateBitstamp.unconfirmed_btc().then(result => {
    console.log('unconfirmed_btc',result);
  });
  privateBitstamp.ripple_withdrawal(amount, address, currency);
  privateBitstamp.ripple_address().then(result => {
    console.log('ripple_address',result);
  });
  privateBitstamp.transfer_to_main(amount, currency, subAccount).then(result => {
    console.log('transfer_to_main',result);
  });
  privateBitstamp.transfer_from_main(amount, currency, subAccount).then(result => {
    console.log('transfer_from_main',result);
  });*/
}
