import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import AllReviews from './AllReviews'
import LeaveReview from './single-review'
import { fetchSingleProduct, addToOrder, removeFromOrder, fetchReviewsByProductId, fetchCart } from '../store'

const Product = props => {

  const {product, handleCartAddClick, handleCartRemovalClick, order, numInCart} = props
  const cart = order && order.find(a => a.isCart === true)
  const cartId = cart && cart.id
  return (<div id="single-product-view">
      <h1 id="view-product-title">{product.title}</h1>
      <br />
      <img src={product.photoUrl} alt="product photoUrl loading fail" id="view-product-img" />
      <br />
      <div>price: ${(product.price / 100).toFixed(2)}</div>
      <br />

      <button onClick={handleCartAddClick(product.id, cartId)}>
        Add to cart
      </button>
      <button onClick={handleCartRemovalClick(product.id, cartId)}>
        remove from cart
      </button>
          
      {numInCart ? `(${numInCart} in cart)` : ''}

      <br />
      <div id="view-product-desc">
        Product Description:
        <br />
        {product.description}
        <br />
      <br />
    
        Product Categories:
        <br />
        {product.categories}
      </div>
      <AllReviews />
      {/* Add isLoggedIn check to conditionally render LeaveReview (only for authenticated users) */}
      <LeaveReview productId={product.id} />
    </div>);
}


const mapState = state => {

  let itemInCart = state.cart.find(item => item.id === state.product.viewingProduct.id) || {quantity: 0}

  // let itemInCart = state.cart.find(item => item.ProductOrders.productId === state.product.viewingProduct.id) || {quantity: 0}

  // let count = itemInCart.ProductOrders.quantity

  let count = itemInCart.ProductOrders ? itemInCart.ProductOrders.quantity : 0


  return {
    order: state.user.orders,
    product: state.product.viewingProduct,
    numInCart: count,
    cart: state.cart,
    user: state.user
  }

}


const mapDispatch = (dispatch, ownProps) => {

  dispatch(fetchSingleProduct(ownProps.match.params.productId))
  dispatch(fetchCart(ownProps.match.params.userId))
  return {
    handleCartAddClick: (productId, orderId) => {
      return function() {
        dispatch(addToOrder(orderId, productId))
      }
    },

    handleCartRemovalClick: (productId, orderId) => {
      return function() {
        dispatch(removeFromOrder(orderId, productId))
      }
    }
  }
}

export default withRouter(connect(mapState, mapDispatch)(Product))
