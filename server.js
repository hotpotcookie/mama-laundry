#!javascript

// Import Modules & Dependencies
//------------------------------------------
const fs = require('fs');
const http = require('http');
const express = require('express');
const path = require('path');
const bash_exec = require('shelljs');
const app = express();
const route = require('route');
const moment = require('moment');
const exp = require('./server.js')

// Load Sub-Directory
//------------------------------------------
app.use(express.static('source'));
app.use('/bash', express.static(__dirname + 'source/bash'));
app.use('/css', express.static(__dirname + 'source/css'));
app.use('/js', express.static(__dirname + 'source/js'));

app.use(express.static('asset'));
app.use('/images', express.static(__dirname + 'asset/images'));
app.use('/fonts', express.static(__dirname + 'asset/fonts'));
app.use('/vendor', express.static(__dirname + 'asset/vendor'));
app.use('/notifyjs', express.static(__dirname + 'asset/notifyjs'));

app.use(express.static('database'));
app.use(express.static('node_modules'));

// Set Page
//------------------------------------------
app.set('views','./page');
app.set('view engine','ejs');
app.use(express.urlencoded({extended: false}));

app.get('/',(req,res) => {
	res.render('index');
});

app.get('/login', (req,res) => {
	res.render('login');
});

app.get('/register', (req,res) => {
	res.render('register');
});

app.post('/', (req,res) => {
	var timestamp = moment().format('l') + ', ' + moment().format('LTS'); 
	timestamp = ('00'+timestamp).slice(-23);
	var datestamp = timestamp.split(',');
	const prod_arr = {'1':'Laundry & Dry Cleaning','2':'Super Chemical Laundry','3':'Stationery & Le Mineral'};	
	const item_ldry_arr = {'1':'Pakaian','2':'Sprei S','3':'Sprei S Full-set','4':'Sprei M','5':'Sprei M Full-set','6':'Sprei XL','7':'Sprei XL Full-set','8':'Bedcover S','9':'Bedcover M','10':'Bedcover XL','11':'Jas / Kebaya','12':'Invent. Mushola','13':'Hordeng','14':'Vitrase'};
	const srvc_ldry_arr = {'1':'Cuci Reg','2':'Cuci Exp','3':'Setrika Reg','4':'Setrika Exp','5':'Dry Clean Reg','6':'Dry Clean Exp'};
	const item_chem_arr = {'1':'Parfum','2':'Pelicin','3':'Pelembut','4':'Deterjen','5':'Pemutih','6':'Pemb. Noda'};
	const liqd_chem_arr = {'1':'Molto B','2':'Ocean F','3':'GGS','4':'Snappy','5':'Paris H','6':'G Rose','7':'Daily'};
	const jugg_chem_arr = {'1':'','2':'Jug 1L','3':'Jug 5L'}
	const item_stat_arr = {'1':'Buku Tulis Campus','2':'Pensil Warna Faber-Castelle','3':'Cat Warna Acrylic','4':'Perangko Rp 6.000','5':'Karton / Kertas Kado Roll','6':'Kanvas 40 x 60 cm'};

	var cust_name = req.body["in-custname"].toUpperCase();
	var prefix_name = cust_name;
	prefix_name = prefix_name.split(' ').join('.');	
	while (prefix_name.length < 15) {
		prefix_name += '_';
	}
	var cust_phone = req.body["in-phonenum"];
	var prod_val = req.body["li-prodtype"];
	var prod_name = prod_arr[prod_val].toUpperCase();
	//global.order_no = bash_exec.exec('cat database/counter_ldry', { silent: true});
	//var curdate = bash_exec.exec('date +'"%d_%b_%Y"', { silent: true});
	var order_no = req.body["invoice_ctr"];
	console.log('');
	console.log('['+prefix_name+' '+datestamp[0]+'] invoice   : #' + order_no);
	console.log('['+prefix_name+' '+datestamp[0]+'] timestamp : ' + timestamp);
	console.log('['+prefix_name+' '+datestamp[0]+'] customer  : ' + cust_name);
	console.log('['+prefix_name+' '+datestamp[0]+'] phone     : ' + cust_phone);
	console.log('['+prefix_name+' '+datestamp[0]+'] --------  : --------');			
	console.log('['+prefix_name+' '+datestamp[0]+'] product   : ' + prod_name);
	switch(prod_val) {
		case '1':
			var check_in = req.body["in-laundry-checkin"].toUpperCase();
			var check_out = req.body["in-laundry-checkout"].toUpperCase();
			var countr_item = req.body["ctr_ldry"];
			var x = 0;
			console.log('['+prefix_name+' '+datestamp[0]+'] deadline  : ' + check_in + ' -- ' + check_out);
			console.log('['+prefix_name+' '+datestamp[0]+'] --------  : --------');
			for (var j = 0; j <= countr_item; j++) {
				try {
					var baseprice = req.body['in-laundry-baseprice'+j];					
					var qty_val = req.body['in-laundry-qty-conv'+j];
					var toteach_val = req.body['in-laundry-totaleach'+j];					
					var item_val = req.body['li-laundry-itemtype'+j];
					var srvc_val = req.body['li-laundry-servicetype'+j];
					var item_name = item_ldry_arr[item_val].toUpperCase();
					var srvc_name = srvc_ldry_arr[srvc_val].toUpperCase();
					++x;
					var ctr = ('0'+x).slice(-2);			
					console.log('['+prefix_name+' '+datestamp[0]+'] -- ' + ctr + ' --  : ' + item_name + ' (' + srvc_name + ') | ' + qty_val + 'x ' + baseprice + '  >>  ' + toteach_val);
				} catch(err) {var dump = 0;}
			}
			var totall_val = req.body['in-laundry-totalall'];
			console.log('['+prefix_name+' '+datestamp[0]+'] --------  : --------');
			console.log('['+prefix_name+' '+datestamp[0]+'] total     : Rp ' + totall_val);				
			break;
		case '2':
			var countr_item = req.body["ctr_chem"];
			var x = 0;
			console.log('['+prefix_name+' '+datestamp[0]+'] --------  : --------');
			for (var j = 0; j <= countr_item; j++) {
				try {
					var baseprice = req.body['in-chemical-baseprice'+j];
					var qty_val = req.body['in-chemical-qty-conv'+j];
					var toteach_val = req.body['in-chemical-totaleach'+j];
					var item_val = req.body['li-chemical-itemtype'+j];
					var liquid_val = req.body['li-chemical-liquidtype'+j];
					var jug_val = req.body['li-chemical-jugtype'+j];
					var ceil_val = req.body['in-chemical-ceil'+j];
					var jugadd_val = req.body['in-chemical-jugadd'+j];
					var item_name = item_chem_arr[item_val].toUpperCase();
					var liquid_name = liqd_chem_arr[liquid_val].toUpperCase();
					var jug_name = jugg_chem_arr[jug_val].toUpperCase();
					++x;
					var ctr = ('0'+x).slice(-2);			
					console.log('['+prefix_name+' '+datestamp[0]+'] -- ' + ctr + ' --  : ' + liquid_name + ' (' + item_name +') ' + ceil_val + ' ' + jug_name + ' | ' + qty_val + 'x ' + baseprice + ' ' + jugadd_val + ' >> ' + toteach_val);
				} catch(err) {var dump = 0;}
			}
			var totall_val = req.body['in-chemical-totalall'];
			console.log('['+prefix_name+' '+datestamp[0]+'] --------  : --------');
			console.log('['+prefix_name+' '+datestamp[0]+'] total     : Rp ' + totall_val);							
			break;
		case '3':
			var countr_item = req.body["ctr_stat"];
			var x = 0;
			console.log('['+prefix_name+' '+datestamp[0]+'] --------  : --------');
			for (var j = 0; j <= countr_item; j++) {
				try {
					var baseprice = req.body['in-stationery-baseprice'+j];
					var qty_val = req.body['in-stationery-qty-conv'+j];
					var toteach_val = req.body['in-stationery-totaleach'+j];
					var item_val = req.body['li-stationery-itemtype'+j];
					var item_name = item_stat_arr[item_val];
					++x;
					var ctr = ('0'+x).slice(-2);								
					console.log('['+prefix_name+' '+datestamp[0]+'] -- ' + ctr + ' --  : ' + item_name + ' | ' + qty_val + 'x ' + baseprice + ' >> ' + toteach_val)
				} catch(err) {var dump = 0;}
			}
			var totall_val = req.body['in-stationery-totalall'];
			console.log('['+prefix_name+' '+datestamp[0]+'] --------  : --------');
			console.log('['+prefix_name+' '+datestamp[0]+'] total     : Rp ' + totall_val);					
			break;
	}
	var paid_val = req.body['in-amountpaid'];
	paid_val = parseInt(paid_val).toLocaleString();
	var change_val = req.body['in-amountchange'];
	console.log('['+prefix_name+' '+datestamp[0]+'] paid      : Rp ' + paid_val);
	console.log('['+prefix_name+' '+datestamp[0]+'] change    : Rp ' + change_val);
	console.log('['+prefix_name+' '+datestamp[0]+'] ==================================================');				
	console.log('');
	res.render('index');
});

/*app.post('/home', (req,res) => {
	console.log('[SERVER]: Order have been placed');
	res.redirect('../');
})*/

// Create Listener : 8080
//------------------------------------------
const port = 8080;
app.listen(port, () => console.log('[nodemon] listening on port ' + port + ' ...'));

// Scripting Counter
//------------------------------------------