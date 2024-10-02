const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // node.js 기본 내장 모듈
const dotenv = require('dotenv');
dotenv.config();

const join = (req, res) => {
    const {email, password} = req.body;

    // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와 salt 값을 같이 DB에 저장
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    let sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;
    let values = [email, hashPassword, salt];
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

            // 로그인 시, 이메일/비밀번호가 날 것의 상태로 들어옴
            // DB에서 salt 값을 꺼내서 날 것으로 들어온 비밀번호 암호화
            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');
            
            // DB에 암호화되어 있는 비밀번호와 비교
            if (login && loginUser.password === hashPassword) {
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

    let sql = `UPDATE users SET password = ?, salt = ?  WHERE email = ?`;

    // 암호화된 비밀번호와 salt 값을 같이 DB에 저장
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
    
    let values = [hashPassword, salt, email]
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