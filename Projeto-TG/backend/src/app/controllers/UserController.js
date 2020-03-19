import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });
        
    if (userExist) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email
    });
  
  }

  async index(req, res) {
    const user = await User.findAll({
      attributes: ['id', 'name', 'email', 'name_file', 'path', 'url'],
    });
    
    return res.json(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string(),
      password: Yup.string().when('oldPassword', (oldPassword, field) => 
        oldPassword ? field.required() : field
      ),
      confirmPassword : Yup.string().when('password', (password, field) => 
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email != user.email) {
      const userExist = await User.findOne({ where: { email: req.body.email } });

      if (userExist) {
        return res.status(401).json({ error: 'User already exist' });
      }
    }

    if ( oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }


    if (req.file == undefined) {
      const { id, name, url } = await user.update(req.body);

      return res.json({
        id,
        name,
        email,
        url,
      });

    } else {
      const { originalname: name_file, filename: path } = req.file;

      req.body.name_file = name_file;
      req.body.path = path;

      const { id, name, url } = await user.update(req.body);

      return res.json({
        id,
        name,
        email,
        name_file,
        url,
      });
    }
     /* Recupero os arquivos */

    /*
    req.file.name_file = name_file;
    req.file.path = path;

    await user.update(req.file);
    */
    

    /*
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
    */
  }

}

export default new UserController();