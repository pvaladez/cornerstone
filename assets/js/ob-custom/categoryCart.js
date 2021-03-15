/*
    // ============================================================================
    // oBundle Code Task #2: Add category buttons to add and remove all products
    //                       to and from cart.
    // ============================================================================
    //
    // - categoryCart.js contains helper functions for making fetch calls to
    //   the bigcommerce storefront api's.
    //
    // - We could have used stencil-utils cart functions, but the code specified
    //   that we "utilize the Storefront API", and maybe utilizing the api's
    //   a little more directly.  Also I don't see a delete cart function in utils.
    // ============================================================================
*/
import { api, tools } from '@bigcommerce/stencil-utils';
import swal from '../theme/global/sweet-alert';
import cartApi from './u-cartApiHelpers';

export default class categoryCart {
  constructor(context) {
    this.$body = $('body');
    this.$cart = $('[data-cart-preview]');
    this.cartId = '';
    this.context = context;
  }

  init() {
    $('.categoryCart-add').on('click', this.addCategoryProductsToCart.bind(this));
    $('.categoryCart-remove').on('click', this.emptyCart.bind(this));
    this.isCartEmpty();

    this.$body.on('cart-quantity-update', this.cartQtyUpdate.bind(this));

    // Get existing quantity from localStorage if found
    if (tools.storage.localStorageAvailable()) {
      if (localStorage.getItem('cart-quantity')) {
        this.quantity = Number(localStorage.getItem('cart-quantity'));
        this.$body.trigger('cart-quantity-update', this.cartQty);
      }
    }
  }

  errorAlert(message) {
    swal.fire({
      title: 'Sorry... Something Went Wrong!',
      html: message,
      icon: 'error',
    });
  }

  isCartEmpty() {
    cartApi.getCart().then(cart => {
      if (cart.length > 0) {
        $('.categoryCart-remove').show();
      } else {
        $('.categoryCart-remove').hide();
      }
    });
  }

  cartQtyUpdate() {
    const cartQtyPromise = new Promise((resolve, reject) => {
      api.cart.getCartQuantity({ baseUrl: this.context.secureBaseUrl, cartId: this.cartId }, (err, qty) => {
        if (err) {
          // If this appears to be a 404 for the cart ID, set cart quantity to 0
          if (err === 'Not Found') {
            resolve(0);
          } else {
            reject(err);
          }
        }
        resolve(qty);
      });
    });
    cartQtyPromise.then(qty => {
      this.cartQty = qty;
      this.$cart.attr('aria-label', (_, prevValue) => prevValue.replace(/\d+/, this.cartQty));

      if (!this.cartQty) {
        this.$cart.addClass('navUser-item--cart__hidden-s');
      } else {
        this.$cart.removeClass('navUser-item--cart__hidden-s');
      }

      $('.cart-quantity')
        .text(this.cartQty)
        .toggleClass('countPill--positive', this.cartQty > 0);
      if (tools.storage.localStorageAvailable()) {
        localStorage.setItem('cart-quantity', this.cartQty);
      }
    });
  }

  addCategoryProductsToCart() {
    const $addToCartBtn = $('.categoryCart-add');
    const originalBtnText = $addToCartBtn.text();
    const waitMessage = $addToCartBtn.data('waitMessage');
    const products = this.context.allProductsInCategory;
    const lineItems = products
      .filter(product => product.has_options === false)
      .map((product) => (
        {
          quantity: 1,
          productId: product.id,
        }
      ));
    const hasOptions = products.filter(product => product.has_options === true);
    const successAlert = () => {
      if (hasOptions.length > 0) {
        let productList = '';

        for (let i = 0; i < hasOptions.length; i++) {
          productList += `<a href="${hasOptions[i].url}">${hasOptions[i].name}</a>`;
        }

        swal.fire({
          title: 'Products Have Options!',
          html: `Sorry but we couldn\'t add some of the products automatically because the products have options you need to choose from.
                        <br/><br/><strong>All products without options were added to your cart successfully!</strong>
                        <br/><br/>Please see list of products with options below.  We recommended opening each link in a new tab.
                        <br/><br/>
                        ${productList}
                        <br/><br/>`,
          icon: 'info',
          confirmButtonText: 'View Cart',
          showCancelButton: true,
          cancelButtonText: 'Dismiss',
        }).then(result => {
          if (result.isConfirmed) {
            window.location.href = '/cart.php';
          } else {
            /* cartPreview(this.context.secure_base_url, cartId); */
            this.$body.trigger('cart-quantity-update');
          }
        });
      } else {
        swal.fire({
          title: 'Success!',
          text: 'You\'ve got some products in your cart!',
          confirmButtonText: 'View Cart',
          icon: 'success',
          showCancelButton: true,
          cancelButtonText: 'Dismiss',
        }).then(result => {
          if (result.isConfirmed) {
            window.location.href = '/cart.php';
          } else {
            /* cartPreview(this.context.secure_base_url, cartId); */
            this.$body.trigger('cart-quantity-update');
          }
        });
      }
      $addToCartBtn.text(originalBtnText).prop('disabled', false);
    };

    $addToCartBtn.text(waitMessage).prop('disabled', true);

    cartApi.getCart().then(cart => {
      if (cart.length > 0) {
        const { id: cartId } = cart[0];
        this.cartId = cartId;
        cartApi.addCartItem(cartId, { lineItems }).then(() => {
          successAlert();
          this.isCartEmpty();
        }).catch(error => this.errorAlert(error));
      } else {
        cartApi.createCart({ lineItems }).then(({ id: cartId }) => {
          this.cartId = cartId;
          successAlert();
          this.isCartEmpty();
        }).catch(error => this.errorAlert(error));
      }
    }).catch(error => this.errorAlert(error));
  }

  emptyCart() {
    const $removeItemsBtn = $('.categoryCart-remove');
    const originalBtnText = $removeItemsBtn.text();
    const waitMessage = $removeItemsBtn.data('waitMessage');

    $removeItemsBtn.text(waitMessage).prop('disabled', true);

    cartApi.getCart().then(cart => {
      if (cart.length > 0) {
        const { id: cartId } = cart[0];
        cartApi.deleteCart(cartId).then(resp => {
          if (resp.status === 204) {
            swal.fire({
              title: 'Cart Empty!',
              html: '<span>I\'m not crying you\'re crying &#128557;</span>',
              icon: 'info',
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              toast: true,
            }).then(() => {
              this.$body.trigger('cart-quantity-update');
            });
          }
          $('.categoryCart-remove').hide();
          $removeItemsBtn.text(originalBtnText).prop('disabled', false);
        }).catch(error => this.errorAlert(error));
      } else {
        swal.fire({
          text: 'You can\'t delete a ghost cart. The dead don\'t die.',
          icon: 'error',
        });
      }
    }).catch(error => this.errorAlert(error));
  }
}
