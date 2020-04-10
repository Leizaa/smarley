const express = require('express');
const app = express();
const proc = require('./process');
const port = 6969;
const cors = require('cors');

app.use(express.json());
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
app.set('json spacer', 2);

app.get('/dummy', (req, res) => {
	console.log('hit dummy');
	res.json({status:"ok"});
});

app.post('/getTransactionID',(req, res) => {	
	console.log('Hit getTransactionID! The request is');
	console.log(req.body);

	proc.getTransactionID(req).then((result) => {
		res.json(result);
	}).catch(function(error){
		console.log(error)
	})
});

app.post('/createTransactionID',(req, res) => {	
	console.log('Hit createTransactionID! The request is');
	console.log(req.body);

	proc.createNewTxnID(req).then((result) => {
		res.json(result);
	}).catch(function(error){
		console.log(error)
	})
});

app.post('/manipulateTransactionData',(req, res) =>{
	console.log('Hit manipulateTransactionData! The request is');
	console.log(req.body);

	proc.manipulateTransactionData(req).then((result) => {
		res.json(result);
	}).catch(function(error){
		console.log(error)
	})
});

app.post('/inquiryTransactionList',(req, res) =>{
	console.log('Hit inquiryTransactionList! The request is');
	console.log(req.body);

	proc.getTransactionDetailFromTransacionID(req).then((result) => {
		res.json(result);
	}).catch(function(error){
		console.log(error)
	})
});

app.post('/getOTP',(req, res) => {
	console.log('Hit getOTP! The request is');
	console.log(req.body);

	proc.getTransactionOTP(req).then((result) => {
		res.json(result);
	}).catch((error) => {
		console.log(error)
	})

});

app.post('/getTransactionDetail',(req, res) => {
	console.log('Hit getTransactionDetail! The request is');
	console.log(req.body);

	proc.getTransactionDetailFromOTP(req).then((result) => {
		res.json(result);
	}).catch((error) => {
		console.log(error)
	})

});

app.post('/closeTransaction',(req, res) => {
	console.log('Hit closeTransaction! The request is');
	console.log(req.body);

	proc.closeTransaction(req).then((result) => {
		res.json(result);
	}).catch((error) => {
		console.log(error)
	})

});

app.post('/getTransactionStatus',(req, res) => {
	console.log('Hit getTransactionStatus! The request is');
	console.log(req.body);

	proc.getTransactionStatus(req).then((result) => {
		res.json(result);
	}).catch((error) => {
		console.log(error)
	})

});

app.listen(port, () => console.log(`Server up listening at port ${port}!`));