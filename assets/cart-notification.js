class CartNotification extends HTMLElement {
    constructor() {
        super();

        this.notification = document.getElementById('cart-notification');
        this.cartToggle = document.querySelector('.js-cart-toggle');
        this.onBodyClick = this.handleBodyClick.bind(this);
        this.bindEvents();
    }

    bindEvents() {

        this.querySelectorAll('.js-close').forEach((closeButton) =>
            closeButton.addEventListener('click', this.close.bind(this))
        );

        const self = this;
        this.cartToggle.addEventListener('click', (e) => {
            e.preventDefault();
            self.open();
        })
    }

    open() {
        this.notification.classList.add('is-active');
        document.body.addEventListener('click', this.onBodyClick);
        document.body.classList.add('overflow-hidden');
    }

    close() {
        this.notification.classList.remove('is-active');
        document.body.removeEventListener('click', this.onBodyClick);
        document.body.classList.remove('overflow-hidden');
    }

    renderContents(parsedState) {
        this.getSectionsToRender().forEach((section => {
            document.getElementById(section.id).innerHTML =
                this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
        }));

        this.open();
    }

    getSectionsToRender() {
        return [
            {
                id: 'cart-notification-product',
                section: 'cart-notification-product',
                selector: '.cart-notification-product'
            }
        ];
    }

    getSectionInnerHTML(html, selector = '.shopify-section') {
        return new DOMParser()
            .parseFromString(html, 'text/html')
            .querySelector(selector).innerHTML;
    }

    handleBodyClick(evt) {
        const target = evt.target;
        if ( target !== this.notification && !target.closest('cart-notification') &&  target !== this.cartToggle &&  !target.closest('.js-cart-toggle')) {
            this.close();
        }
    }


}

customElements.define('cart-notification', CartNotification);
