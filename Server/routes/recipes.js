import express from 'express';

import recipe from '../controllers/recipes';
import review from '../controllers/reviews';
import rating from '../controllers/ratings';
import favorite from '../controllers/favorites';
import confirmAuth from '../middleware/index';
import checkToken from '../middleware/checkToken';

const router = express.Router();

router.post(
  '/',
  confirmAuth.authenticate,
  recipe.create
);

router.get(
  '/',
  recipe.getAll
);

router.get(
  '/favorites',
  recipe.getMostFavorited
);

router.get(
  '/search/:search',
  recipe.search
);

router.get(
  '/categories/:type',
  recipe.getCategory
);

router.get(
  '/:recipeId',
  checkToken.authenticate,
  recipe.getDetails
);

router.delete(
  '/:recipeId',
  confirmAuth.authenticate,
  recipe.delete
);

router.put(
  '/:recipeId',
  confirmAuth.authenticate,
  recipe.update
);

router.post(
  '/:recipeId/favorite',
  confirmAuth.authenticate,
  favorite.favoriteRecipe
);

router.get(
  '/:recipeId/upvotes',
  rating.getUpvotes
);

router.get(
  '/:recipeId/downvotes',
  rating.getDownvotes
);

router.post(
  '/:recipeId/upvote',
  confirmAuth.authenticate,
  rating.upvote
);

router.post(
  '/:recipeId/downvote',
  confirmAuth.authenticate,
  rating.downvote
);

router.post(
  '/:recipeId/review',
  confirmAuth.authenticate,
  review.reviewRecipe
);

router.delete(
  '/reviews/:reviewId',
  confirmAuth.authenticate,
  review.delete
);

router.get(
  '/:recipeId/reviews',
  review.getAll
);

export default router;
