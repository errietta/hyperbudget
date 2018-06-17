import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { UserModel, User, IUserModel } from '../lib/schema/user';
import { Utils } from '../lib/utils';

export const validateRegistration = [
  check('email').isEmail().custom((value) => (
    UserModel.findOne({ email: value })
    .then((user: User) => (
      user ? Promise.reject('email in use') : Promise.resolve(true))
    )
  )),
  check('password').isLength({ min: 8 }),
  check('firstname').optional().isAlphanumeric(),
];

export const validateLogin = [
  check('email').isEmail(),
  check('password'),
];

export const register = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  let { email, password, firstname } = req.body;

  bcrypt.hash(password, 10)
  .then((hashed_password) => UserModel.create({
      email: email,
      password: hashed_password,
      firstName: firstname,
    })
  )
  .then(() => UserModel.findOne({
    email: email
  }))
  .then((user: User) => {
    res.json({
      success: true,
      userId: user.id,
    });
  });
};

export const login = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  let { email, password } = req.body;

  return UserModel
  .findOne({
    email: email
  })
  .then((user: User) => {
    return new Promise((resolve, reject) => {
      if (!user) {
        return reject();
      }

      return bcrypt.compare(password, user.password).then((isPasswordCorrect: boolean) => (
        isPasswordCorrect ? resolve() : reject()
      ));
    })
    .then(() => {
      let token = Utils.JWTSign({
        user: user.forAPI(),
      });

      return res.json({
        success: true,
        token: token,
        userId: user.id,
      })
    },
    () => (
      res.status(422).json({
        error: [{ msg: "Incorrect login" }]
      })
    ))
  })
}

export const accountInfo = (req: Request, res: Response) => {
  let token = req.get('x-jwt');

  Utils.UserFromJWT(token).then((user: User) => {
    res.json({
      authenticated: true,
      user: user.forAPI(),
    });
  });
};


export const updateCategories = (req: Request, res: Response) => {
  console.log(req.body.categories);
  Utils.UserFromJWT(req.get('x-jwt')).then((user: IUserModel) => {
    console.log(user);
    user.set({
      firstName: 'whataf',
      preferences: { categories: req.body.categories },
    });
    user.preferences.categories.push(req.body.categories);
    user.markModified('preferences.categories');
    user.save().then(
      () => res.json({ ok: true }),
      (err) => { console.log(err) }
    )
  });
};