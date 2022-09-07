const { check } = require('express-validator')
const models = require('../../models')
const FileValidationHelper = require('./FileValidationHelper')
const Product = models.Product

const maxFileSize = 10000000 // around 10Mb

const solo1Producto = async (restaurant, promotedValue) => {
  let buleano = false
  if (promotedValue === true || promotedValue==='true'){
    try {
      const productPromoted = await Product.findAll({where:{restaurantId: restaurant, promoted: true ||'true'}})
      if (productPromoted.length !==0){
        buleano=true
      }
    }catch (error){
      buleano=true
    }
  }
  return buleano ? Promise.reject(new Error('Ya hay un producto promocionado')): Promise.resolve()
}

// Solution
const checkSum100 = (fat, proteins, carbo) => {
  fat = parseFloat(fat)
  proteins = parseFloat(proteins)
  carbo = parseFloat(carbo)

  if ((fat < 0 || proteins < 0 || carbo < 0) || (fat + proteins + carbo) !== 100) {
    return false
  }

  return true
}

// Solution
const checkCalories = (fat, proteins, carbo) => {
  fats = parseFloat(fat)
  proteins = parseFloat(proteins)
  carbohydrates = parseFloat(carbo)

  const calories = fat * 9 + proteins * 4 + carbo * 4

  return calories <= 1000
}

module.exports = {
  create: () => {
    return [
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileIsImage(req.file)
        })
        .withMessage('Please only submit image files (jpeg, png).'),
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileMaxSize(req.file, maxFileSize)
        })
        .withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
      // Solution
      check('fats').custom((values, { req }) => {
        const { fat, proteins, carbo } = req.body
        return checkSum100(fat, proteins, carbo)
      }).withMessage('The values of fat, protein and carbohydrates must be in the range [0, 100] and the sum must be 100.'),
      check('fats').custom((values, { req }) => {
        return checkCalories(req.body.fat, req.body.proteins, req.body.carbo)
      }).withMessage('The number of calories must not be greater than 1000.'),
      check('promoted')
      .custom(async (value,{req})=>{
      return solo1Producto(req.body.restaurantId, value)
      }).withMessage('Ya hay un articulo promocionado')
    ]
  },

  update: () => {
    return [
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileIsImage(req.file)
        })
        .withMessage('Please only submit image files (jpeg, png).'),
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileMaxSize(req.file, maxFileSize)
        })
        .withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
      check('restaurantId')
        .custom(async (value, { req }) => {
          try {
            const product = await Product.findByPk(req.params.productId,
              {
                attributes: ['restaurantId']
              })
            // eslint-disable-next-line eqeqeq
            if (product.restaurantId != value) {
              return Promise.reject(new Error('The restaurantId cannot be modified'))
            } else { return Promise.resolve() }
          } catch (err) {
            return Promise.reject(new Error(err))
          }
        }),
      // Solution
      check('fats').custom((values, { req }) => {
        return checkSum100(req.body.fat, req.body.proteins, req.body.carbo)
      }).withMessage('The values of fat, protein and carbohydrates must be in the range [0, 100] and the sum must be 100.'),
      check('fats').custom((values, { req }) => {
        const { fat, proteins, carbo } = req.body
        return checkCalories(fat, proteins, carbo)
      }).withMessage('The number of calories must not be greater than 1000.'),
      check('promoted')
      .custom(async (value,{req})=>{
      return solo1Producto(req.body.restaurantId, value)
      }).withMessage('Ya hay un articulo promocionado')
    ]
  }
}