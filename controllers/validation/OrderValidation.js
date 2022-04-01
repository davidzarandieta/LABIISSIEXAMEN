const { check } = require('express-validator')
const models = require('../../models')
const order = require('../../models/order')
const Order = models.Order

module.exports = {
  create: () => {
    return [
      check('products')
        .custom((value, { req }) => {
          try {
            const order = Order.findByPk(req.params.orderId,
{
                attributes: ['quantity']
              })
              if (order.quatity=0) {
                return Promise.reject(new Error('Order should have products, and all of them with quantity greater than zero'))
              } else {
                return Promise.resolve('ok')
              }
            } catch (err) {
              return Promise.reject(err)
            }
          }),
      check('products')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['productsId']
              })
            if (order.productsId) {
              return Promise.reject(new Error('The products doesn`t exist in the database.'))
            } else {
              return Promise.resolve('ok')
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
