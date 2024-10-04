const express = require('express');
const router = express.Router();

const {
    allCategory
} = require('../controller/categoryController');

router.use(express.json());

router.get('/', allCategory); // 전체 목록 조회

module.exports = router;