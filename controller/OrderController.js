// const conn = require('../mariadb');
const mysql = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes');

const order = async (req, res) => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'book-shop',
        dateStrings: true
    });

    const {items, delivery, totalQuantity, totalPrice, userId, firstBookTitle} = req.body;

    // delivery
    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
    let values = [delivery.address, delivery.receiver, delivery.contact];
    let [results] = await conn.execute(sql, values);
    let delivery_id = results.insertId;

    // orders
    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
            VALUES (?, ?, ?, ?, ?)`
    values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id]
    let orderResults = await conn.execute(sql, values);
    let order_id = orderResults[0].insertId;

    console.log(orderResults);
    console.log(order_id);


    // orderedBook
    sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?` // 벌크로 insert 를 한다
    // items.. 배열: 요소들을 하나씩 꺼내서 (forEach문 돌려서) > 
    values = [];
    items.forEach((item) => {
        values.push([order_id, item.book_id, item.quantity]);
    })
    results = await conn.query(sql, [values]);

    return res.status(StatusCodes.OK).json(results[0]);
};

const getOrders = (req, res) => {
    res.json(`주문 목록 조회`);
};

const getOrderDetail = (req, res) => {
    res.json(`주문 상세 상품 조회`);
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
}