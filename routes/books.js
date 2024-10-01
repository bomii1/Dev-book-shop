const express = require('express');
const router = express.Router();

router.use(express.json());

// 전체 도서 조회
router.get('/', (req, res) => {
    res.json('전체 도서 조회');
});

// 개별 도서 조회
router.get('/:id', (req, res) => {
    res.json(`개별 도서 조회: ${req.params.id}`);
});

// 카테고리별 도서 목록 조회
router.get('/:catagoryId', (req, res) => {
    res.json(`카테고리별 도서 목록 조회: ${req.params.catagoryId}`);
});

module.exports = router;