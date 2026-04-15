import { Router } from 'express';
import { getTrades, getTradeStats, createTrade, updateTrade, deleteTrade } from '../controllers/trade.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { tradeSchema } from '../utils/schemas';

const router = Router();

router.use(protect);

router.get('/stats', getTradeStats); // MUST BE BEFORE /:id because express router parses linearly
router.route('/')
  .get(getTrades)
  .post(validate(tradeSchema), createTrade);

router.route('/:id')
  .put(updateTrade)
  .delete(deleteTrade);

export default router;
