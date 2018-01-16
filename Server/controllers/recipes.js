import Validator from 'validatorjs';
import Sequelize from 'sequelize';
import { Recipe, Rating, User } from '../models';
import validations from '../shared/validations';
import paginationData from '../shared/helper';

const recipes = {

  /** Creates new Recipe and stores in the Recipes table
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  addRecipe(request, response) {
    const validator = new Validator(request.body, validations.recipeRules);
    if (validator.passes()) {
      Recipe.findOne({
        where: {
          userId: request.decoded.id,
          name: request.body.name.toLowerCase(),
        },
      })
        .then((userRecipe) => {
          if (userRecipe) {
            return response.status(409).json({
              status: 'Unsuccessful',
              message: 'Cannot Create A Recipe With the Same Name',
            });
          }

          Recipe.create({
            name: request.body.name.toLowerCase().trim(),
            description: request.body.description.trim(),
            prepTime: request.body.prepTime.trim(),
            type: request.body.type,
            ingredients: request.body.ingredients,
            instructions: request.body.instructions,
            image: request.body.image,
            userId: request.decoded.id,
          })
            .then((recipe) => {
              return response.status(201).json({
                status: 'Success',
                recipeId: recipe.dataValues.id,
                recipe,
              });
            });
        });
    } else {
      return response.status(406).json({
        status: 'Unsuccessful',
        message: 'Invalid data input',
        errors: validator.errors.all(),
      });
    }
  },

  /** Retrieves Popular Recipes / all Recipes in the database
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  getAllRecipes(request, response) {
    // returns a list of popular recipes, request has a '?' in it's header paramater
    if (request.query.sort) {
      return Rating.findAll({
        where: {
          vote: 1,
        },
        attributes: ['recipeId', [Sequelize.fn('count', Sequelize.col('vote')), 'Upvotes']],
        include: [{
          model: Recipe,
          attributes: ['name', 'type', 'prepTime'],
        }],
        order: [
          ['vote', 'DESC'],
        ],
        group: ['recipeId', 'vote', 'Recipe.id'],
        limit: 6,
      })
        .then((popularRecipes) => {
          if (popularRecipes.length === 0) {
            response.status(200).json({
              status: 'Successful',
              message: 'There Are Currently No Popular Recipes',
            });
          } else {
            response.status(200).json({
              status: 'Successful',
              drecipes: popularRecipes,
            });
          }
        });

    } else if (request.query.limit && request.query.offset) {
      if (Number.isNaN(request.query.page)) {
        return response.status(406).json({
          status: 'Unsuccessful',
          message: 'Page Must Be A Number',
        });
      }

      return Recipe.findAndCountAll({
        attributes: ['id', 'name', 'description', 'prepTime', 'type', 'image'],
        limit: request.query.limit,
        offset: request.query.offset,
      })
        .then(({ rows, count }) => {
          return response.status(200).json({
            status: 'Successful',
            rows,
            pagination: paginationData(count, request.query.limit, request.query.offset)

          });
        });

    } else if (request.query.type) {
      Recipe.findAll({
        where: {
          type: {
            $iLike: `%${request.query.type}%`,
          },
        },
      })
        .then((recipesFound) => {
          if (recipesFound.length === 0) {
            return response.status(200).json({
              status: 'Successful',
              message: 'No Recipes In That Category Yet',
              recipes: []
            });
          } else {
            return response.status(200).json({
              status: 'Successful',
              recipes: recipesFound,
            });
          }
        });
    }

    return Recipe.findAll({
      attributes: ['id', 'name', 'description', 'prepTime', 'type', 'image'],
      limit: 5,
    }).then((allRecipes) => {
      if (allRecipes.length === 0) {
        response.status(200).json({
          status: 'Successful',
          message: 'There Are Currently No Recipes',
        });
      } else {
        response.status(200).json({
          status: 'Successful',
          recipes: allRecipes,
        });
      }
    })
      .catch(error => response.status(500).send(error));
  },

  /** Updates a recipe according to User's input
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  updateRecipe(request, response) {
    if (Number.isNaN(request.params.recipeId)) {
      response.status(406).json({
        status: 'Unsuccessful',
        message: 'Recipe ID Must Be A Number',
      });
    } else {

      const recipeid = parseInt(request.params.recipeId, 10);
      Recipe.findById(recipeid)
        .then((recipe) => {
          if (!recipe) {
            response.status(404).json({
              status: 'Unsuccessful',
              message: 'Recipe Not Found',
            });
          } else if (recipe.userId === request.decoded.id) {
            if (request.body.name || request.body.description || request.body.prepTime || request.body.image
              || request.body.type || request.body.ingredients || request.body.instructions) {

              const validator = new Validator(request.body, validations.updateRecipeRules);
              if (validator.passes()) {
                recipe.update({
                  name: request.body.name || recipe.name,
                  description: request.body.description || recipe.description,
                  prepTime: request.body.prepTime || recipe.prepTime,
                  type: request.body.type || recipe.type,
                  ingredients: request.body.ingredients || recipe.ingredients,
                  instructions: request.body.instructions || recipe.instructions,
                  image: request.body.image || recipe.image,
                })
                  .then((updatedRecipe) => {
                    response.status(200).json({
                      status: 'Successful',
                      recipe: {
                        name: updatedRecipe.name,
                        description: updatedRecipe.description,
                        prepTime: updatedRecipe.prepTime,
                        type: updatedRecipe.type,
                        ingredients: updatedRecipe.ingredients,
                        instructions: updatedRecipe.instructions,
                        image: updatedRecipe.image,
                      },
                    });
                  });
              } else {
                response.status(406).json({
                  status: 'Unsuccessful',
                  message: 'Invalid data input',
                  errors: validator.errors.all(),
                });
              }
            } else {
              response.status(406).json({
                status: 'Unsuccessful',
                message: 'Must input data',
              });
            }
          } else {
            response.status(403).json({
              status: 'Unsuccessful',
              message: 'You are Not Aauthorized to Update This Recipe',
            });
          }
        })
        .catch(error => response.status(500).send(error));
    }
  },

  /** Deletes a Recipe from the database table
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  deleteRecipe(request, response) {
    if (Number.isNaN(request.params.recipeId)) {
      response.status(406).json({
        status: 'Unsuccessful',
        message: 'Recipe ID Must Be A Number',
      });
    } else {
      const recipeid = parseInt(request.params.recipeId, 10);
      Recipe.findById(recipeid)
        .then((recipe) => {
          if (!recipe) {
            response.status(404).json({
              status: 'Unsuccessful',
              message: 'Recipe Not Found',
            });
          } else if (recipe.userId === request.decoded.id) {
            recipe.destroy()
              .then(() => {
                response.status(200).json({
                  status: 'Successful',
                  message: `${recipe.name} has been deleted`,
                });
              })
              .catch(error => response.status(400).send(error));
          } else {
            response.status(403).json({
              status: 'Unsuccessful',
              message: 'You are Not Aauthorized to Delete This Recipe',
            });
          }
        })
        .catch(error => response.status(500).send(error));
    }
  },

  /** Gets a Recipe from the database table
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  getRecipe(request, response) {
    if (Number.isNaN(request.params.recipeId)) {
      response.status(406).json({
        status: 'Unsuccessful',
        message: 'Recipe ID Must Be A Number',
      });
    } else {
      const requestid = parseInt(request.params.recipeId, 10);
      Recipe.findOne({
        where: { id: requestid },
        include: [{
          model: User,
          attributes: ['firstName', 'surname'],
        }],
      })
        .then((recipe) => {
          if (!recipe) {
            return response.status(404).json({
              status: 'Unsuccessful',
              message: 'Recipe Not Found',
            });
          }
          response.status(200).json({
            status: 'Successful',
            recipe,
          });
        })
        .catch(error => response.status(500).send(error));
    }
  },

  /** Gets all the Recipes a User has submitted
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  getUserRecipes(request, response) {
    if (Number.isNaN(request.params.userId)) {
      response.status(406).json({
        status: 'Unsuccessful',
        message: 'User ID Must Be A Number',
      });
    } else {
      const requestid = parseInt(request.params.userId, 10);
      Recipe.findAll({
        where: { userId: request.decoded.id },
      })
        .then((userRecipes) => {
          if (userRecipes.length === 0) { // checks if list is empty
            response.status(200).json({
              status: 'Successsful',
              message: 'You Currently Have No Recipes',
            });
          } else {
            response.status(200).json({
              status: 'Successful',
              recipes: userRecipes,
            });
          }
        })
        .catch(error => response.status(500).send(error));
    }
  },

  /** Searchs for a recipe by name or ingredients
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  searchRecipe(request, response) {
    Recipe.findAll({
      where: {
        $or: [{
          name: {
            $like: `%${decodeURIComponent(request.query.search)}%`,
          },
          ingredients: {
            $like: `%${decodeURIComponent(request.query.search)}%`,
          },
        }],
      },
    })
      .then((searchFound) => {
        if (searchFound.length === 0) { // checks if search is empty
          response.status(404).json({
            status: 'Unsuccessful',
            message: 'Recipe not found',
          });
        } else {
          response.status(200).json({
            status: 'Successful',
            recipe: searchFound,
          });
        }
      })
      .catch(error => response.status(500).send(error));
  },


  /** Gets the Recipes to a particular category
  * @param {Object} request - request object
  * @param {Object} response - response object
  * @returns {Object} response object
  */
  getCategory(request, response) {
    Recipe.findAll({
      where: {
        type: {
          $like: `%${request.query.type}%`,
        },
      },
    })
      .then((recipesFound) => {
        if (recipesFound.length === 0) {
          response.status(404).json({
            status: 'Unsuccessful',
            message: 'Recipe not found',
          });
        } else {
          response.status(200).json({
            status: 'Successful',
            recipes: recipesFound,
          });
        }
      })
      .catch(error => response.status(500).send(error));
  },
};

export default recipes;
