var model = require('../models').model('user');

/**
 * 
 {
     "email": "string",
     "password": "string"
 }
 * @param {*} ctx 
 * @param {*} next 
 */
const auth = async (ctx, next) => {
    // console.log('in auth', model.findOne)
    const body = ctx.request.body
    var doc = await model.findOne({
        email: body.email
    })

    if (!doc) {
        ctx.status = 404
        return ctx.body = {message: 'could not login user'};
    }
     var isMatch = await doc.comparePassword(body.password)
     console.log(isMatch)
        
    if(isMatch){
        ctx.body = doc;
    }else{
        ctx.status = 401
        ctx.body = {message: 'login failed'};
    }
}

module.exports = {
  auth
};