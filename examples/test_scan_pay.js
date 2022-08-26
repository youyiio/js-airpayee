
import default_config from './config.js';

import airpayee from '../src/index.js'

const paySdk = new airpayee.PaySdk(default_config);

const body = '商品body';
const amount = 1;
const attach = 'attach信息';
const authCode = '';


paySdk.scanPay(body, amount, attach, authCode, function(err, response) {
    console.log('扫码收款：', response);
});