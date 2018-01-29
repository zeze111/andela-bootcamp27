import axios from 'axios';
import { FAVORITE_RECIPE, GET_FAVORITE_RECIPE, DELETE_FAVORITE } from './types';

/**
 * @export {function}
 * @param {any} recipeId
 * @returns {object} any
 */
export function favoriteRecipe(recipeId) {
  return dispatch => axios.post(`/api/v1/recipe/${recipeId}/favorite`)
    .then((response) => {
      dispatch({
        type: FAVORITE_RECIPE,
        payload: response.data,
      });
    })
    .catch(error => error);
}

/**
 * @param {any} limit
 * @param {any} offset
 * @export {function}
 * @returns {object} any
 */
export function getFavoriteRecipes(limit, offset) {
  return dispatch => axios.get(`/api/v1/user/favorites?limit=${limit}&offset=${offset}`)
    .then((response) => {
      dispatch({
        type: GET_FAVORITE_RECIPE,
        payload: response.data,
      });
    });
}

/**
 *  @export {function}
 * @param {any} recipeId
 * @returns {object} any
 */
export function deleteFavorite(recipeId) {
  return dispatch => axios.delete(`/api/v1/favorites/${recipeId}/recipe`)
    .then((response) => {
      Materialize.toast(`<span> ${response.data.message}</span>`, 2000);
      response.data.recipeId = recipeId;

      dispatch({
        type: DELETE_FAVORITE,
        payload: response.data,
      });
    });
}
