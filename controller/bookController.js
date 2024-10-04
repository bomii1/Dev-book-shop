const { body } = require('express-validator');
const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');

// 개별 도서 조회
const bookDetail = (req, res) => {
    const {id} = req.params; 
    //id = parseInt(id); // 어차피 sql에는 문자열로 들어가지만 언젠가 쓰일 수 있기 때문에
    let sql = `SELECT * FROM books WHERE id = ?`;
    conn.query(sql, id,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results[0])
                return res.status(StatusCodes.OK).json(results);
            else
                return res.status(StatusCodes.NOT_FOUND).end();   
        }
    )
}

// 전체 도서 조회 & 카테고리별 도서 조회
// 전체 도서 목록에는 도서의 상세 정보를 포함합니다. 
// 필요한 데이터만 선별하여 구현 부탁드립니다. 
const allBooks = (req, res) => {
    const {category_id} = req.query;

    if (category_id) {
        let sql = `SELECT * FROM books WHERE catagory_id = ?`;
        conn.query(sql, category_id,
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
    } else {
        // (요약된) 전체 도서 리스트
    let sql = `SELECT * FROM books`;
        conn.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            res.status(StatusCodes.OK).json(results);
            }
        )
    }    
}

module.exports = {
    allBooks,
    bookDetail,
}