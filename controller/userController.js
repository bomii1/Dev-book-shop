const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // node.js 기본 내장 모듈
const dotenv = require('dotenv');
dotenv.config();

const join = (req, res) => {
    const {email, password} = req.body;

    let sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    let values = [email, password];
    conn.query(sql, values,
        (err, results) =>  {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            res.status(StatusCodes.CREATED).json({ message: `환영합니다.` });
        }
    )     
}

const login = (req, res) => {
    const { email, password } = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`;
    
    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            
            let loginUser = results[0];
            
            if (login && loginUser.password === password) {
                // 토큰 발행
                const token = jwt.sign({
                    email: loginUser.email,
                    password: loginUser.password,
                }, process.env.PRIVATE_KEY, {
                    expiresIn: '5m',
                    issuer: 'bomi'
                });

                res.cookie("token", token, {
                    httpOnly: true
                }); // 토큰 쿠키에 담음
                console.log(token);

                res.status(StatusCodes.OK).json(results);
                
            } else {
                // 401: Unauthorized, 403: Forbidden (접근 권리 없음)
                // 접근 권리가 없다는 것은 서버가 그 사람이 누군지 알고 있다는 것
                // Unauthorized 는 서버가 그 사람이 누군지 모른다는 것
                res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
};

const passwordResetRequest = (req, res) => {
    const {email} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST);
            }
            // 이메일로 유저가 있는지 찾음
            const user = results[0];
            if (user) {
                return res.status(StatusCodes.OK).json({
                    email: email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
};

const passwordReset = (req, res) => {
    // 이전 페이지에서 입력했던 이메일
    const {email, password} = req.body;

    let sql = `UPDATE users SET password = ? WHERE email = ?`;
    let values = [password, email]
    conn.query(sql, values, 
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results.affectedRows)
                return res.status(StatusCodes.OK).json(results);
            else
                return res.status(StatusCodes.BAD_REQUEST).end();
        }
    )
};

module.exports = {
    join,
    login,
    passwordResetRequest,
    passwordReset 
};