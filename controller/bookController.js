const { body } = require('express-validator');
const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');

// 개별 도서 조회
const bookDetail = (req, res) => {
    const {user_id} = req.body;
    const book_id = req.params.id;

    let sql = `SELECT *,
                    (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes,
                    (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked
                FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id
                WHERE books.id=?;`;

    let values = [user_id, book_id, book_id];

    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results[0])
                return res.status(StatusCodes.OK).json(results[0]);
            else
                return res.status(StatusCodes.NOT_FOUND).end();   
        }
    )
}

// (카테고리 별, 신간 여부) 전체 도서 목록 조회
// 전체 도서 목록에는 도서의 상세 정보를 포함합니다. 필요한 데이터만 선별하여 구현 부탁드립니다. 
const allBooks = (req, res) => {
    const {category_id, news, limit, currentPage} = req.query;

    let offset = limit * (currentPage-1);
    
    let sql = `SELECT *, (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes FROM books`;
    let values = [];

    if (category_id && news) {
        sql += ` WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
        values.push(category_id);
    }
    else if (category_id) {
        sql += ` WHERE category_id=?`;
        values.push(category_id);
    }
    if (news) {
        sql += ` WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    }

    sql += ` LIMIT ? OFFSET ?`
    values.push(parseInt(limit), offset);

    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            if (results.length) 
                res.status(StatusCodes.OK).json({results});
            else
                res.status(StatusCodes.NOT_FOUND).end();
        }
    )   
}

module.exports = {
    allBooks,
    bookDetail,
}