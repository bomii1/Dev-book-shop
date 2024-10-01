const express = require('express');
const router = express.Router();

router.use(express.json());

// 좋아요 추가
router.post('/:id', (req, res) => {
    res.json(`좋아요 추가: ${req.params.id}`);
});

// 좋아요 취소
router.delete('/:id', (req, res) => {
    res.json(`좋아요 취소: ${req.params.id}`);
});

module.exports = router;