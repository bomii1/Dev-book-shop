const { body } = require('express-validator');
const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');

const addlike = (req, res) => {
    // 카테고리 전체 목록 리스트
    const {liked_book_id} = req.params;
    const {user_id} = req.body;

    let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?);`;
    let values = [user_id, liked_book_id];
    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end()
            }
            return res.status(StatusCodes.OK).json(results);
        }
    )
}

const removeLike = (req, res) => {
    // 좋아요 제거(취소)
    const {liked_book_id} = req.params;
    const {user_id} = req.body;

    let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?;`;
    let values = [user_id, liked_book_id];

    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.OK).json(results);
        }
    )
}

module.exports = {
    addlike,
    removeLike
}