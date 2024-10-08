const express = require('express');
const { addlike, removeLike } = require('../controller/LikeController');
const router = express.Router();

router.use(express.json());

// 좋아요 추가
router.post('/:liked_book_id', addlike);

// 좋아요 취소
router.delete('/:liked_book_id', removeLike);

module.exports = router;