import {
  CREATE_RECIPE,
  GET_USER_RECIPES,
  GET_ALL_RECIPES,
  DELETE_RECIPE,
  UPDATE_RECIPE,
  GET_RECIPE,
  GET_PAGED_RECIPES,
  GET_RECIPES_CATEGORY,
  MOST_UPVOTED_RECIPES,
  SEARCH_RECIPE,
  POPULAR_RECIPES
} from '../actions/types';

const initialState = {
  recipes: [],
  upvotedRecipes: [],
  popularRecipes: [],
  currentRecipe: {},
  message: '',
  pagination: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload.recipe],
      };
    case GET_USER_RECIPES:
      return {
        ...state,
        recipes: action.payload.recipes,
        pagination: action.payload.pagination,
        message: action.payload.message,
      };
    case GET_ALL_RECIPES:
      return {
        ...state,
        recipes: action.payload.recipes,
        message: action.payload.message
      };
    case GET_PAGED_RECIPES:
      return {
        ...state,
        recipes: action.payload.recipes,
        pagination: action.payload.pagination
      };
    case GET_RECIPES_CATEGORY:
      return {
        ...state,
        recipes: action.payload.recipes,
        pagination: action.payload.pagination,
        message: action.payload.message
      };
    case MOST_UPVOTED_RECIPES:
      return {
        ...state,
        upvotedRecipes: action.payload.recipes,
        message: action.payload.message,
      };
    case POPULAR_RECIPES:
      return {
        ...state,
        popularRecipes: action.payload.recipes,
        message: action.payload.message,
      };
    case SEARCH_RECIPE:
      return {
        ...state,
        recipes: action.payload.recipes,
        pagination: action.payload.pagination,
        message: action.payload.message
      };
    case GET_RECIPE:
      return {
        ...state,
        currentRecipe: action.payload.recipe,
        fave: action.payload.fave
      };
    case UPDATE_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload.recipe],
      };
    case DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.id !== action.payload),
      };
    default: return state;
  }
};
