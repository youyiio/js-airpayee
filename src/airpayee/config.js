
const default_config = {
    	//商户编号
	'mch_no': "",

	//商户密钥
	'secret_key': "",
	
	//异步通知地址，需修改为开发者的地址
	'notify_url': "http://paysdk.airpayee.com/wappay/notify_url.php",

	//同步跳转，需修改为开发者的地址
	'return_url': "http://paysdk.airpayee.com/wappay/return_url.php",

	//编码格式，定值无需修改
	'charset': "UTF-8",

	//统一的网关接口，定值无需修改
	'unify_gateway_url': "https://www.airpayee.com/gateway/unify"
	
};


export default default_config