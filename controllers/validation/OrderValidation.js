const { check } = require('express-validator')
const models = require('../../models')
const order = require('../../models/order')
const Order = models.Order

module.exports = {
  create: () => {
    return [
      check('products')
        .custom((value, { req }) => {
          // TODO: Check that the order includes some products (at least one) and each product quantity is greater than 0
          const products = req.body.products
          let todosMayorCero = true
          for (const producto of products) {
            if (producto.quantity <= 0) {
              todosMayorCero = false
            }
          }
          if (products.length > 0 && todosMayorCero) {
            return true
          } else return false
        })
        .withMessage('Order should have products, and all of them with quantity greater than zero'),
      check('products')
        .custom(async (value, { req }) => {
          const products = req.body.products.map(e => e.productId)
          try {
            const productosRestaurante = await Product.findAll({
              model: Product,
              as: 'products',
              attributes: ['id'],
              where: { restaurantId: req.body.restaurantId }
            })
            let todosSonDelRestaurante = true
            const idsProductos = productosRestaurante.map(e => e.id)
            for (const producto of products) {
              if (!idsProductos.includes(producto)) {
                todosSonDelRestaurante = false
              }
            }
            if (todosSonDelRestaurante) {
              return Promise.resolve('ok')
            } else {
              return Promise.reject(new Error('Los productos no son de ese restaurante'))
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  confirm: () => {
    return [
      check('startedAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt']
              })
            if (order.startedAt) {
              return Promise.reject(new Error('The order has already been started'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  send: () => {
    return [
      check('sentAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt', 'sentAt']
              })
            if (!order.startedAt) {
              return Promise.reject(new Error('The order is not started'))
            } else if (order.sentAt) {
              return Promise.reject(new Error('The order has already been sent'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  deliver: () => {
    return [
      check('deliveredAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt', 'sentAt', 'deliveredAt']
              })
            if (!order.startedAt) {
              return Promise.reject(new Error('The order is not started'))
            } else if (!order.sentAt) {
              return Promise.reject(new Error('The order is not sent'))
            } else if (order.deliveredAt) {
              return Promise.reject(new Error('The order has already been delivered'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  }
}
