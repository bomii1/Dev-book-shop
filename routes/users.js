const express = require('express');
const conn = require('../mariadb');
const router = express.Router();
// const {body, param, validationResult} = require('express-validator');

const {
    join,
    login, 
    passwordResetRequest, 
    passwordReset 
} = require('../controller/userController');

router.use(express.json());

// 회원가입
router.post(
    '/join', join);

// 로그인
router.post('/login', login);

// 비밀번호 초기화 요청
router.post('/reset', passwordResetRequest);

// 비밀번호 초기화
router.put('/reset', passwordReset);

module.exports = router;