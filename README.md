# BigCommerce Theme Builder Test

## Store Info
### Url = https://petes-obundles.mybigcommerce.com/
### Preview Code: nppstmrj4e


## Setup
### GitHub Fork and Branch
I forked the [bigcommerce cornerstone repo](https://github.com/bigcommerce/cornerstone) and made all of my code changes on a new [test branch of my repo](https://github.com/pvaladez/cornerstone/tree/test).  Please refer to commits on the [test branch of my repo](https://github.com/pvaladez/cornerstone/tree/test) to see my work.

Creating a separate branch for custom development is not only the [practice bigcommerce recommends](https://developer.bigcommerce.com/stencil-docs/deploying-a-theme/theme-updates-and-version-control), but it also makes merging upstream updates from the cornerstone master easier.
### Node and NPM Updates

> Because Node version 10 is almost end of life and the stencil-cli documentation version [recommends version 12](https://developer.bigcommerce.com/stencil-docs/installing-stencil-cli/installing-stencil), I have followed instructions from the cornerstone readme by deleting package-lock.json and installing npm packages with node version 12.21.0 and npm version 6.14.11. I might stick with npm version 6.11.3 if the site were going to actually be used, but why not help test out newer versions :slightly_smiling_face:
### Product and Category Setup
Created the Special Item product with three images and the category Special Items
## Code Tasks
1. Show secondary product image on hover
   1. Handlebars logic preserves which image is chosen as Thumbnail regardless of the image index
   2. A CSS transition on the images' opacity determines which image is visible
2. Add category buttons to add and remove all products to and from cart.
   1. Clicking categoryCart-add adds all products in the category to cart
      1. Products in category with options will not be added automatically
         1. To see this in action, go to the Kitchen category and click "Add All To Cart"
      2. Notification after add gives option to view cart
   2. Clicking categoryCart-remove empties the cart
      1. Notification after removing items shown as "toast" alert in top right
   3. All notifications use sweet-alert
   4. Cart quantity countPill is updated via ./global/cart-preview
   5. Added removing_from_cart to en.json for translations... could have done something similar for all messages, but time is restricted.
3. Bonus Task: Banner in header that shows customer info when a customer is logged in
   1. I put the info in components/navigation.html, which means the customer info shows up on all pages.  If you only wanted it on the category page we would cut and paste into either pages/category.html or components/category/categoryCart.html
   2. To see this in action, log in as my user: jsmith@example.com and use the password I sent to you.