
import _ from 'lodash';
import axios from 'axios';
import md5 from 'md5-node';

import default_config from './config.js';

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
     * @param {string} body 
     * @param {int} amount 
     * @param {string} attach 
     * @param {string} authCode 
     * @param {function} callback 
     */
    scanPay(body, amount, attach, authCode, callback) {
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

    webPay() {

    }

    prepareOrder() {

    }

    queryOrder() {

    }

    refundOrder() {

    }

    cancelOrder() {

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
        return Math.random().toString(36).substr(2, 15);
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