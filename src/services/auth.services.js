const USER = require("../models/User")
const bcrypt = require('bcryptjs')
const { ACCESS_TOKEN_SECRET } = require("../config")
const jwtServices = require("./jwt.services")
const moment = require('moment')
const nodemailer = require('nodemailer')
const register = async (body) => {
  try {
    const { email, username } = body
    console.log("body", body)
    //check if email is already in the database
    const emailExist = await USER.findOne({
      email: body.email
    })
    if (emailExist) return {
      message: 'Email already exist !!',
      success: false
    }

    //check if username is already in the database
    const usernameExist = await USER.findOne({
      username: body.username
    })
    if (usernameExist) return {
      message: 'Username already exist !!',
      success: false
    }

    const hashedPassword = await bcrypt.hash(body.password, 8);
    console.log(`LHA:  ===> file: auth.services.js ===> line 30 ===> hashedPassword`, hashedPassword)


    const newUser = new USER({
      ...body,
      password: hashedPassword
    })
    console.log(`LHA:  ===> file: auth.services.js ===> line 36 ===> newUser`, newUser)

    const token = jwtServices.createToken(newUser._id);
    const tokenExp = moment().add(30, 'days')
    console.log(`LHA:  ===> file: auth.services.js ===> line 39 ===> tokenExp`, tokenExp)

    newUser.token = token
    newUser.tokenExp = tokenExp
    console.log("save")
    await newUser.save()
    sendMail(email, username)
    return {
      message: 'Successfully registered',
      success: true,
      data: newUser
    };

  } catch (err) {
    return {
      message: 'An error occured',
      success: false
    }
  }
}

const login = async (body) => {
  try {
    const {
      email,
      password
    } = body
    const user = await USER.findOne({
      email
    }).lean()
    if (!user) {
      return {
        message: 'Invalid email !!',
        success: false
      }
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      return {
        message: 'Invalid password !!',
        success: false
      }
    }

    return {
      message: 'Successfully login',
      success: true,
      data: user
    };
  } catch (err) {
    return {
      message: 'An error occured',
      success: false
    }
  }
}

const getAuth = async (body) => {
  try {
    console.log("body:", body)
    const user = await USER.find({ ...body })
    if (!user) {
      return {
        message: 'Get Auth Fail',
        success: false
      }
    }
    return {
      message: 'Successfully Get Auth',
      success: true,
      data: user
    };
  }
  catch (err) {
    return {
      message: 'An error occured',
      success: false
    }
  }
}
const findUserNameAndPass = async (_id) => {
  try {
    const user = await User.findById(_id)
    const oldPassword = req.body.oldPassword
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
    if (isPasswordMatch) return user;
    return null
  } catch {
    return null
  }

}
const changePassword = async (body) => {
  try {
    const user = findUserNameAndPass()
    if (!user) {
      return {
        message: 'Dont Found User',
        success: false,
        data: user
      };
    }
    const newPassword = await bcrypt.hash(body.newPassword, 8)
    user.password = newPassword
    await user.save()

    return {
      message: 'Change Password Successfully',
      success: true
    };
  } catch {
    return {
      message: 'An error occured',
      success: false
    }
  }
}

const verifyUser = async (username) => {
  try {
    const user = await User.findOne({ username: username })
    if (user) {
      user.isVerify = true
      await user.save()

      return {
        message: 'Email Confirm',
        success: true
      }

    } else {
      return {
        message: 'User not found',
        success: false
      }
    }

  } catch (error) {
    return {
      message: 'An error occured',
      success: false
    }
  }
}

const sendMail = async (email, username) => {
  // let transport = nodemailer.createTransport({
  //   service: 'hotmail',
  //   auth: {
  //     user: 'holmesz17@outlook.com',
  //     pass: 'phamtandat1712'
  //   }
  // })

  //let transport = nodemailer.createTransport(`smtps://<username>%40gmail.com:<password>@smtp.gmail.com`)
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transport = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  let mailOptions = {
    from: 'phamtandat1479@gmail.com',
    to: "208holmesz@gmail.com",
    subject: 'Email confirmation',
    html: `Press <a href=http://localhost:3000/verify/${username}> here </a> to verify your email.`
  }
  await transport.sendMail(mailOptions, function (err, res) {
    if (err) {
      console.log(err)
    } else {
      console.log('Message sent')
    }
  })
}

module.exports = {
  register,
  login, getAuth, changePassword,
  verifyUser,
  sendMail
}