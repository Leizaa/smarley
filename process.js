const Pool = require('pg').Pool;
const pool = new Pool({
	user: 'erulhswwrfoqcv',
	host: 'ec2-3-211-48-92.compute-1.amazonaws.com',
  	database: 'd2vf832boemnrp',
  	password: 'b9164f01862a74e06a4776afd82f4c9eaca6bc6463d12190742509627b13701b',
  	port: 5432,
});

const getTransactionID = (req) => {
	cartId = req.body.cartId;
	return selectTxnIdByCartId(cartId);
};

const selectTxnIdByCartId = (cartId) => {
	return new Promise((resolve, reject) => {
		pool.query(`select "ID_TRANSACTION" from "TRANSACTION" where "IS_OPEN" = true and "ID_CART" = ${cartId}`,
			(error, results) => {
				if (error) {
					console.log(error)
				}

				if (results.rows.length > 0) {
					txnId = results.rows[0].ID_TRANSACTION;
					output = {"STATUS":"ok","ID_TRANSACTION":txnId, "flag":"01"};
				} else {
					output = {"STATUS":"failed"};
				} 
				resolve(output);
			})
	})
}

const generateRandomOtp = () => {
	return Math.floor(1000 + Math.random() * 9000);
};

const createNewTxnID = function(req) {
	cartId = req.body.cartId;
	otp = generateRandomOtp();
	return new Promise((resolve, reject) => {
		pool.query(
			`insert into "TRANSACTION" 
			("ID_CART", "OTP", "AMOUNT", "CREATED", "IS_OPEN") values
			(${cartId}, ${otp}, null, current_date, true) 
			returning "ID_TRANSACTION"`,
			(error, results) => {
				if (error) {
					console.log(error)
				}

				if (results.rows.length > 0) {
					txnId = results.rows[0].ID_TRANSACTION;
					output = {"status":"ok","txnId":txnId};
				} else {
					output = {"status":"failed"};
				} 
				resolve(output);
			})
	})
}

const insertNewTxnForCart = function(cartId) {
	otp = generateRandomOtp();
	return new Promise((resolve,reject) => {
		pool.query(`insert into "TRANSACTION" ("ID_CART","OTP","AMOUNT","CREATED","IS_OPEN") values(${cartId}, ${otp}, null, current_date, true)`, 
			(error, result) => {
				if (error)
					return reject(error)
				resolve(result)
			})
	})
}

const getTransactionOTP = (req) => {
	txnId = req.body.txnId;
	return new Promise((resolve, reject) => {
		pool.query(`update "TRANSACTION" set "IS_CHECKOUT" = true where "ID_TRANSACTION" = ${txnId}
				returning "OTP"`,
			(error, results) => {
				if (error) {
					console.log(error)
				}

				if (results.rows.length > 0) {
					otp = results.rows[0].OTP;
					output = {"status":"ok","OTP":otp};
				} else {
					output = {"status":"failed"};
				} 
				resolve(output);
			})
	})
}

const getTransactionDetailFromOTP = (req) => {
	otp = req.body.OTP;
	return new Promise((resolve, reject) => {
		pool.query(
			`select i."BASE_PRICE", i."ITEM_DESC", td.*
			from "TRANSACTION_DETAIL" td join "ITEM" i on td."ID_ITEM" = i."ID_ITEM" 
			where "ID_TRANSACTION" = (
				select "ID_TRANSACTION"
				from "TRANSACTION"
				where "TRANSACTION"."OTP" = ${otp}::character varying 
				and "TRANSACTION"."IS_OPEN" = true and "TRANSACTION"."IS_CHECKOUT" = true
			)`,
			(error, results) => {
				if (error) {
					console.log(error)
				}

				if (results.rows.length > 0) {
					txnId = results.rows[0].ID_TRANSACTION

					output = {"STATUS":"ok","ID_TRANSACTION":txnId,"TRANSACTION_DETAIL":results.rows}
				} else {
					output = {"STATUS":"failed"}
				}
				resolve(output);
			})
	})
}

const getTransactionDetailFromTransacionID = (req) => {
	txnId = req.body.txnId;
	return new Promise((resolve, reject) => {
		pool.query(
			`select i."BASE_PRICE", i."ITEM_DESC", td.*
			from "TRANSACTION_DETAIL" td join "ITEM" i on td."ID_ITEM" = i."ID_ITEM" 
			where "ID_TRANSACTION" = ${txnId}`,
			(error, results) => {
				if (error) {
					console.log(error)
				}

				if (results.rows.length > 0) {
					output = {"ID_TRANSACTION":txnId,"TRANSACTION_DETAIL":results.rows}
				} else {
					output = {"ID_TRANSACTION":txnId,"TRANSACTION_DETAIL":[]}
				}
				resolve(output);
			}
		)
	})
}

const getTransactionStatus = (req) => {
	txnId = req.body.txnId;
	return new Promise((resolve, reject) => {
		pool.query (`select "CLOSE_STATUS"
					from "TRANSACTION"
					where "ID_TRANSACTION" = ${txnId}`,
					(error, results) => {
						if (error) {
							console.log(error)
						}

						if (results.rows.length > 0) {
							closeStatus = results.rows[0].CLOSE_STATUS
							output = {"status":closeStatus}
						} else {
							output = {"status":"unknown"}
						}
						resolve(output)
					}
				)
			})
}

const closeTransaction = (req) => {
	txnId = req.body.txnId;
	grandPrice = req.body.grandPrice;
	closeStatus = req.body.closeStatus;
	return new Promise((resolve, reject) => {
		pool.query(
			`update "TRANSACTION" 
			set 
				"AMOUNT" = ${grandPrice}, 
				"CLOSE_STATUS" = ${closeStatus}::character varying,
				"IS_OPEN" = false
			where "ID_TRANSACTION" = ${txnId}`,
			(error, results) => {
				if (error) {
					console.log(error)
				}
				output = {status:"ok"}
				resolve(output);
			})
	})
}

const insertNewTransactionDetail = (txnId, itemId) => {

	return new Promise((resolve, reject) => {
		pool.query(
			`insert into "TRANSACTION_DETAIL"
			("ID_TRANSACTION","QUANTITY","ID_ITEM") values
			(${txnId},1,${itemId})`,
			(error, results) => {
				if(error) {
					console.log(error)
					output = {"status":"failed"}
				} else {
					output = {"status":"ok"}
				}
				resolve(output);
			})
	})
}

const updateTransactionDetailQuantity = (itemId, txnId, quantity) => {
	return new Promise((resolve, reject) => {
			pool.query(
				`update "TRANSACTION_DETAIL"
				set  "QUANTITY" = ${quantity}
				where "ID_TRANSACTION" = ${txnId} and "ID_ITEM" = ${itemId}`,
				(error, results) => {
					if(error) {
						console.log(error)
						output = {"status":"failed"}
					} else {
						output = {"status":"ok"}
					}
					resolve(output);
				})
		})	
}

const selectTransactionDetail = (itemId, cartId) => {
	return new Promise((resolve, reject) => {
		pool.query(
			`select "QUANTITY", "ID_TRANSACTION"
			from "TRANSACTION_DETAIL"
			where "ID_ITEM" = ${itemId} 
				and "ID_TRANSACTION" = (
					select "ID_TRANSACTION" 
					from "TRANSACTION" 
					where "ID_CART" = ${cartId} and "IS_OPEN" = true
				)`,
				(error, results) => {
					if(error) {
						console.log(error)
						output = {"status":"failed"}
						resolve(output)
					} else {
						if (results.rows.length > 0) {
							output = 
							{
								"status":"ok",
								"QUANTITY":results.rows[0].QUANTITY,
								"txnId":results.rows[0].ID_TRANSACTION,
								"flag":"02"
							}
							resolve(output)
						} else {
							resolve(selectTxnIdByCartId(cartId))
						}
					}
				}
			)
	})
}

const manipulateTransactionData = (req) => {
	flag = req.body.flag;
	itemId = req.body.itemId

	if (flag == 1) {
		cartId = req.body.cartId

		return selectTransactionDetail(itemId, cartId)
		.then((result) => {
			txnId = result.txnId
			if (isDetailExist(result)) {
				quantity = result.QUANTITY
				quantity++
				return updateTransactionDetailQuantity(itemId, txnId, quantity)
			} else {
				txnId = result.ID_TRANSACTION
				console.log(result)
				console.log("txnId: " + txnId + " " + itemId)
				return insertNewTransactionDetail(txnId, itemId)
			}
		}).catch((error) => {
			console.log(error);
		})
	} else if (flag == 2) {
		txnId = req.body.txnId
		quantity = req.body.quantity

		return updateTransactionDetailQuantity(itemId, txnId, quantity)
	} else {

		return new Promise((resolve, reject) => {
			pool.query(
				`delete from "TRANSACTION_DETAIL" 
				where "ID_TRANSACTION" = ${txnId} and "ID_ITEM" = ${itemId}`,
				(error, results) => {
					if(error) {
						console.log(error)
						output = {"status":"failed"}
					} else {
						output = {"status":"ok"}
					}
					resolve(output);
				})
		})
	}
}

const isDetailExist = (result) => {
	console.log(result)
	return result.QUANTITY != null
}

module.exports = {getTransactionID, createNewTxnID, getTransactionDetailFromTransacionID, 
	getTransactionOTP, getTransactionDetailFromOTP, closeTransaction, manipulateTransactionData,
	insertNewTransactionDetail, getTransactionStatus};