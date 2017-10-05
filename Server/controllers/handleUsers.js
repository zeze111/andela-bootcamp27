import models from '../models';
import Validator from 'validatorjs';

const User = models.User;

/**const userRules = {
  firstName: 'required|between:2,35',
  surname: 'required|between:2,50',
  email: 'required|email'
};

const signInRules = {
  email: 'required|email'
};*/

class HandleUser {

  static newUser = (req, res) => {
    //const validator = new Validator(req.body, userRules);
    //if (validator.passes()) {
    const userFName = req.body.firstName;
    const userSurname = req.body.surname;
    const userEmail = req.body.email.toLowerCase();
    const userPassword = req.body.password;
    if (userFName && userSurname && userEmail && userPassword) {
      User.findOne({
        where: { email: userEmail }
      })
        .then((user) => {
          if (!user) {
            User.create({
              firstName: userFName,
              surname: userSurname,
              email: userEmail,
              password: userPassword,
            }).then((userCreated) => {
              res.status(201).json({
                status: 'Success',
                data: {
                  userName: `${userCreated.firstName} ${userCreated.surname}`,
                },
              })
            });
          } else {
            res.status(400).json({
              status: 'Unsuccessful', message: 'Email already exist'
            });
          }
        }) //if unsuccessful
        .catch(error => res.status(400).send(error));
    } else {
      res.status(400).json({
        status: 'Unsuccessful', message: 'Missing data input'
      });
    }
    //} 
  }

  static userSignIn = (req, res) => {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    //const validator = new Validator(req.body, signInRules);
    //if (validator.passes()) {
    if (userEmail && userPassword) {
      User.findOne({
        where: {
          email: userEmail,
        }
      })
        .then((user) => {
          if (user.password !== req.body.password) {
            response.status(400).json({
              status: 'Unsuccessful', message: 'Authentification failed, Wrong password'
            });
          } else if (bcrypt.compareSync(req.body.password, user.password)) {
            const payload = { id: user.id };
            const token = jwt.signIn(payload, process.env.SECRET_KEY,
              { expireIn: 60 * 60 * 48 })
            res.status(201).json({
              status: 'Success',
              message: 'You are now signed in',
              token: token
            });
          }
        }) //if unsuccessful
        .catch(error => res.status(400).send(error));
    } else {
      response.status(400).json({
        status: 'Unsuccessful', message: 'Missing data input'
      });
    }
  } /** else {
      res.status(400).json({
        status: 'Unsuccessful', message: 'Wrong input format'
      });
    } */
//}
}

export default HandleUser;
