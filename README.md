# js-airpayee

**壹收银【AirPayee】支付的JavaScript/TypeScript开发库** 支持Nodejs的集成开发及对接。

AirPayee SDK JavaScript版本，包含了SDK开发库和对接案例samples；
支付渠道包含微信、支付和银联等，支持主扫、被扫、App、小程序和网页支付等支付方式。

[github地址](https://github.com/youyiio/js-airpayee)

## 特性

* 简洁的 API 设计，内部集成了支付宝，微信等众多支付通道；
* 囊括了主扫、被扫、App、小程序和网页支付等支付方式；
* 可轻松集成至 Nodejs，vue, reactive 等主流javascript 框架;


## 目录 
* [第一个AirPayee demo](#第一个AirPayee demo) 
* [安装](#安装) 
* [Issues](#Issues)

## 安装
### 使用 npm 安装 (强烈推荐):
支持 `psr-4` 规范, 开箱即用
```
composer require youyiio/php-airpayee
```




## 扫码枪收款 - scanpay

支付配置config.php
```
<?php
ini_set('date.timezone','Asia/Shanghai');

$config = array (	
	//商户编号
	'mch_no' => "",

	//商户密钥
	'secret_key' => "",
	
	//异步通知地址
	'notify_url' => "http://paysdk.airpayee.com/webpay/notify_url.php",
	
	//同步跳转
	'return_url' => "http://paysdk.airpayee.com/webpay/return_url.php",

	//编码格式，定值无需修改
	'charset' => "UTF-8"
);
```

支付SDK调用
```
use beyong\airpayee\PaySdk;

$body = $_POST['body'];
$amount = $_POST['amount'];
$attach = $_POST['attach'];
$authCode = $_POST['auth_code'];

$PaySdk = new PaySdk($config);
$result = $PaySdk->scanPay($body, $amount, $attach, $authCode);
var_dump($result);

```

## 网页支付 - webpay

支付SDK调用
```
use beyong\airpayee\PaySdk;

$mchOrderId = $_POST['mch_order_id'];
$body = $_POST['body'];
$amount = $_POST['amount'];
$attach = $_POST['attach'];
$payChannel = $_POST['pay_channel'];
$returnUrl = $_POST['return_url'];
$notifyUrl = $_POST['notify_url'];

$PaySdk = new PaySdk($config);

$PaySdk->webPay($mchOrderId, $body, $amount, $attach, $payChannel, $returnUrl, $notifyUrl);
```



## Issues
如果有遇到问题请提交 [issues](https://github.com/youyiio/js-airpayee/issues)


## License
MIT
