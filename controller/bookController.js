const { body } = require('express-validator');
const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const ensureAuthorization = require('../auth');
const jwt = require('jsonwebtoken');

// 개별 도서 조회
const bookDetail = (req, res) => {

    // 로그인 상태가 아니면 => liked 빼고 보냄
    // 로그인 상태이면 => liked 추가해서

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요."
        });
    } 
    else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다."
        });
    } 
    else if (authorization instanceof ReferenceError) {
        const book_id = req.params.id;

        let sql = `SELECT *,
                    (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes
                FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id
                WHERE books.id=?;`;
        response(sql, book_id, res);
    }
    else {
        const book_id = req.params.id;

        let sql = `SELECT *,
                    (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes,
                    (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked
                FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id
                WHERE books.id=?;`;

        let values = [authorization.id, book_id, book_id];
        response(sql, values, res);
    }
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

function response(sql, values, res) {
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

module.exports = {
    allBooks,
    bookDetail,
}