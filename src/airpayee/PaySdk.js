
import _ from 'lodash';
import axios from 'axios';
import md5 from 'md5-node';

import default_config from './config.js';

import querystring from 'querystringify';

class PaySdk {
    static PAY_CHANNEL_WXPAY = 1;
    static PAY_CHANNEL_ALIPAY = 2;

    //签名方式,固定值
    static sign_type = "MD5";

    //统一的网关接口，定值无需修改
    static unify_gateway_url = "https://pay.ituizhan.com/gateway/unify";

    //扫码枪支付method, 固定值
    static scanpay_method = "airpayee.pay.scanpay";

    //app支付method, 固定值
    static apppay_method = "airpayee.pay.apppay";

    //web支付method，固定值
    static webpay_method = "airpayee.pay.webpay";

    //公众号/生活号支付method，固定值
    static pubpay_method = "airpayee.pay.pubpay";

    //小程序支付method，固定值
    static litepay_method = "airpayee.pay.litepay";

    //H5支付method，固定值
    static h5pay_method = "airpayee.pay.h5pay";

    //预下单method，固定值
    static prepayorder_method = "airpayee.order.prepareorder";
    //查询订单method，固定值
    static queryorder_method = "airpayee.order.query";
    //取消订单method，固定值
    static cancelorder_method = "airpayee.order.refund";
    //退款订单method，固定值
    static refundorder_method = "airpayee.order.cancel";


    static pay_products = ["scan", "web", "app", "pub", "lite", "h5", "qrcode"];

    config = {};

    //errorHandler = Noop
    //successHandler = Noop

    constructor (options = {}) {
        console.log('---------create------', options);
        this.config = _.assign(default_config, options);

        if (_.isEmpty(this.config['mch_no'])) {
            throw new Error("mch_no should not be NULL!")
        }
        if (_.isEmpty(this.config['mch_no'])) {
            throw new Error("secret_key should not be NULL!")
        }
        
    }

    static create(options) {
        return new PaySdk(options)
    }
   
    log (msg, level) {
        console.log('log: start', msg, level)
    }

    /**
     * 扫码枪收款
     * @param {string} body 商品描述
     * @param {number} amount 总费用，单位分
     * @param {string} attach 附加信息，回调或异步通知时原格式回传
     * @param {string} authCode 授权码，付款码的信息
     * @param {function} callback 回调函数
     */
    scanpay(body, amount, attach, authCode, callback) {
        let params = {
            'method': PaySdk.scanpay_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'auth_code': authCode,
            'body': body,
            'amount': amount,
            'attach': attach,
        };

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        this.http_post(this.config['unify_gateway_url'], params, function(err, response) {
            console.log(response);
            callback(err, response);
        });
        
    }

    /**
     * 网页web支付，当前支持PC浏览器，移动浏览器；
     * @param {string} mchOrderId 商户订单号
     * @param {string} body 商品描述
     * @param {number} amount 总费用，单位分
     * @param {string} attach 附加信息，回调或异步通知时原格式回传
     * @param {number} payChannel 支付渠道
     * @param {string} returnUrl 回调同步通知地址，公网可访问
     * @param {string} notifyUrl 异步通知地址，公网可访问
     * @param {object} response http response
     */
    webpay(mchOrderId, body, amount, attach, payChannel, returnUrl, notifyUrl, response) {
        let params = {
            'method': PaySdk.webpay_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'mch_order_id': mchOrderId,
            'pay_channel': payChannel,
            'pay_product': 'web',
            'body': body,
            'amount': amount,
            'attach': attach,            
            'return_url': returnUrl,
            'notify_url': notifyUrl
        };

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        let redirectUrl = this.config['unify_gateway_url'] + '?' + querystring.stringify(params);
        response.redirect(redirectUrl);
        response.end();
    }

    /**
     * 公众号/生活号支付，当前支持微信、支付宝内部浏览器；
     * @param {string} mchOrderId 商户订单号
     * @param {string} body 商品描述
     * @param {number} amount 总费用，单位分
     * @param {string} attach 附加信息，回调或异步通知时原格式回传
     * @param {number} payChannel 支付渠道
     * @param {string} returnUrl 回调同步通知地址，公网可访问
     * @param {string} notifyUrl 异步通知地址，公网可访问
     * @param {string} openId 公众号/生活号的openid/buyerid
     * @param {object} response http response
     */
    pubpay(mchOrderId, body, amount, attach, payChannel, returnUrl, notifyUrl, openId, response) {
        let params = {
            'method': PaySdk.pubpay_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'mch_order_id': mchOrderId,
            'pay_channel': payChannel,
            'pay_product': 'pub',
            'body': body,
            'amount': amount,
            'attach': attach,            
            'return_url': returnUrl,
            'notify_url': notifyUrl
        };
        if (openId != null && openId.length() != 0) {
            bizParams['open_id'] = openId;
        }

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        let redirectUrl = this.config['unify_gateway_url'] + '?' + querystring.stringify(params);
        response.redirect(redirectUrl);
        response.end();
    }

    /**
     * 小程序支付, 微信小程序/支付宝小程序
     * @param {*} mchOrderId 
     * @param {*} body 
     * @param {*} amount 
     * @param {*} attach 
     * @param {*} payChannel 
     * @param {*} notifyUrl 
     * @param {*} openId 
     * @param {*} callback 
     */
    litpPay(mchOrderId, body, amount, attach , payChannel, notifyUrl, openId, callback) {
        let params = {
            'method': PaySdk.litepay_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'mch_order_id': mchOrderId,
            'pay_channel': payChannel,
            'pay_product': 'lite',
            'body': body,
            'amount': amount,
            'attach': attach,            
            'return_url': returnUrl,
            'notify_url': notifyUrl
        };
        if (openId != null && openId.length() != 0) {
            bizParams['open_id'] = openId;
        }

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        this.http_post(this.config['unify_gateway_url'], params, function(err, response) {
            console.log(response);
            callback(err, response);
        });
    }

    /**
     * App支付
     * @param {string} mchOrderId 
     * @param {string} body 
     * @param {number} amount 
     * @param {string} attach 
     * @param {number} payChannel 
     * @param {string} notifyUrl 
     * @param {function} callback 
     */
    apppay(mchOrderId, body, amount, attach, payChannel, notifyUrl, callback) {
        let params = {
            'method': PaySdk.apppay_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'mch_order_id': mchOrderId,
            'pay_channel': payChannel,
            'pay_product': 'app',
            'body': body,
            'amount': amount,
            'attach': attach,
            'notify_url': notifyUrl
        };

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        this.http_post(this.config['unify_gateway_url'], params, function(err, response) {
            console.log(response);
            callback(err, response);
        });
    }

    /**
     * h5支付，
     * @param {*} mchOrderId 
     * @param {*} body 
     * @param {*} amount 
     * @param {*} attach 
     * @param {*} payChannel 
     * @param {*} notifyUrl 
     * @param {*} openId 
     * @param {*} response 
     */
    h5pay(mchOrderId, body, amount, attach, payChannel, notifyUrl, openId, response) {
        let params = {
            'method': PaySdk.h5pay_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'mch_order_id': mchOrderId,
            'pay_channel': payChannel,
            'pay_product': 'h5',
            'body': body,
            'amount': amount,
            'attach': attach,            
            'notify_url': notifyUrl
        };
        if (openId != null && openId.length() != 0) {
            bizParams['open_id'] = openId;
        }

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        let redirectUrl = this.config['unify_gateway_url'] + '?' + querystring.stringify(params);
        response.redirect(redirectUrl);
        response.end();
    }

    /**
     * 预下单接口
     * @param {*} mchOrderId 
     * @param {*} body 
     * @param {*} amount 
     * @param {*} attach 
     * @param {*} payChannel 
     * @param {*} payProduct 
     * @param {*} returnUrl 
     * @param {*} notifyUrl 
     * @param {*} openId 
     * @param {function} callback 
     */
    prepareOrder(mchOrderId, body, amount, attach , payChannel, payProduct, returnUrl, notifyUrl, openId = '', callback) {
        let params = {
            'method': PaySdk.prepayorder_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'mch_order_id': mchOrderId,
            'pay_channel': payChannel,
            'pay_product': payProduct,
            'body': body,
            'amount': amount,
            'attach': attach,            
            'returnUrl': returnUrl,   
            'notify_url': notifyUrl
        };
        if (openId != null && openId.length() != 0) {
            bizParams['open_id'] = openId;
        }

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        this.http_post(this.config['unify_gateway_url'], params, function(err, response) {
            console.log(response);
            callback(err, response);
        });
    }

    /**
     * 查询订单
     * @param string ourOrderId 
     * @param {function} callback 
     */
    queryOrder(ourOrderId, callback) {
        let params = {
            'method': PaySdk.queryorder_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'our_order_id': ourOrderId,
        };

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        this.http_post(this.config['unify_gateway_url'], params, function(err, response) {
            console.log(response);
            callback(err, response);
        });
    }

    refundOrder(ourOrderId, callback) {
        let params = {
            'method': PaySdk.refundorder_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'our_order_id': ourOrderId,
        };

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        this.http_post(this.config['unify_gateway_url'], params, function(err, response) {
            console.log(response);
            callback(err, response);
        });
    }

    cancelOrder(ourOrderId, callback) {
        let params = {
            'method': PaySdk.cancelorder_method,
            'mch_no': this.config['mch_no'],
            'request_time': this.createRequestTime(),
            'sign': '',
        };

        let bizParams = {
            'our_order_id': ourOrderId,
        };

        params = _.assign(params, bizParams);
        let sign = this.sign_params(params, this.config['secret_key']);
        params['sign'] = sign;

        this.http_post(this.config['unify_gateway_url'], params, function(err, response) {
            console.log(response);
            callback(err, response);
        });
    }

    http_post(url, params, callback) {
        axios.post(url, params).then(response => {
            console.log(response.data);
            callback(null, response.data);
        }).catch((error) => {
            console.log(error);
            callback(error, null);
        });
        
    }

    http_get(url, params, callback) {
        axios.get(url, params).then(response => {
            console.log(response.data);
            callback(null, response.data);
        }).catch((error) => {
            console.log(error);
            callback(error, null);
        });
        
    }

    sign_params(params, secret_key) {
        if (_.isEmpty(params) || _.isEmpty(secret_key)) {
            return '';
        }

        var keys = Object.keys(params);
        keys = keys.sort()
      
        var paramString = '';
        for (var k in keys) {
          paramString += '&' + k + '=' + params[k];
        }
        paramString = paramString.substring(1);

        paramString = paramString + secret_key;
        let signString = md5(paramString);

        return signString;        
    }

    createNonceStr = function () {
        return Math.random().toString(36).substring(2, 15);
    };
      
    createRequestTime() { 
        Date.prototype.Format = function(fmt) {       
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "H+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };

            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substring(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substring(("" + o[k]).length)));
            }

            return fmt;    
        }

        return new Date().Format("yyyy-MM-dd HH:mm:ss");
    };
}

export default PaySdk