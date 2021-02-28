import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';
import swal from './global/sweet-alert';
import categoryCart from './categoryCart';
import cartPreview from './global/cart-preview';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();

        /*
            // ============================================================================
            // oBundle Code Task #2: Add category buttons to add and remove all products
            //                       to and from cart.
            // ============================================================================
            //
            // - Clicking categoryCart-add adds all products in the category to Cart
            //   - Products in category with options will not be added automatically
            //   - Notification after add gives option to view cart
            // - Clicking categoryCart-remove empties the cart
            //   - Notification after removing items shown as "toast" alert in top right
            // - All notifications use sweet-alert
            // - Cart quantity countPill is updated via ./global/cart-preview
            // ============================================================================
        */
        $('.categoryCart-add').on('click', this.addCategoryProductsToCart.bind(this));
        $('.categoryCart-remove').on('click', this.emptyCart.bind(this));
        this.isCartEmpty();
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }

    /*
        // ============================================================================
        // oBundle Code Task #2: Add category buttons to add and remove all products
        //                       to and from cart.
        // ============================================================================
        //
        // - Clicking categoryCart-add adds all products in the category to Cart
        //   - Products in category with options will not be added automatically
        //   - Notification after add gives option to view cart
        // - Clicking categoryCart-remove empties the cart
        //   - Notification after removing items shown as "toast" alert in top right
        // - All notifications use sweet-alert
        // - Cart quantity countPill is updated via ./global/cart-preview
        // ============================================================================
    */
    errorAlert(message) {
        swal.fire({
            title: 'Sorry... Something Went Wrong!',
            html: message,
            icon: 'error',
        });
    }

    isCartEmpty() {
        categoryCart.getCart().then(cart => {
            if (cart.length > 0) {
                $('.categoryCart-remove').show();
            } else {
                $('.categoryCart-remove').hide();
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
        const successAlert = (cartId) => {
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
                    } else cartPreview(this.context.secure_base_url, cartId);
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
                    } else cartPreview(this.context.secure_base_url, cartId);
                });
            }
            $addToCartBtn.text(originalBtnText).prop('disabled', false);
        };

        $addToCartBtn.text(waitMessage).prop('disabled', true);

        categoryCart.getCart().then(cart => {
            if (cart.length > 0) {
                const { id: cartId } = cart[0];
                categoryCart.addCartItem(cartId, { lineItems }).then(() => {
                    successAlert(cartId);
                    this.isCartEmpty();
                }).catch(error => this.errorAlert(error));
            } else {
                categoryCart.createCart({ lineItems }).then(({ id: cartId }) => {
                    successAlert(cartId);
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

        categoryCart.getCart().then(cart => {
            if (cart.length > 0) {
                const { id: cartId } = cart[0];
                categoryCart.deleteCart(cartId).then(resp => {
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
                            cartPreview(this.context.secure_base_url, cartId);
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
