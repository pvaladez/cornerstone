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

export function getCart() {
    return fetch('/api/storefront/carts?include=lineItems.digitalItems.options,lineItems.physicalItems.options', {
        method: 'GET',
        credentials: 'same-origin',
    })
        .then(response => response.json());
}

export function deleteCart(cartId) {
    return fetch(`/api/storefront/carts/${cartId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
    });
}

export function createCart(cartItems) {
    return fetch('/api/storefront/carts', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItems),
    })
        .then(response => response.json());
}

export function addCartItem(cartId, cartItems) {
    return fetch(`/api/storefront/carts/${cartId}/items`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItems),
    })
        .then(response => response.json());
}

export default { getCart, deleteCart, createCart, addCartItem };
