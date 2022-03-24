class CartRemoveButton extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', (event) => {
            event.preventDefault();
            this.closest('cart-items').updateQuantity(this.dataset.index, 0);
        });
    }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
    constructor() {
        super();


        this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
            .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

        this.debouncedOnChange = debounce((event) => {
            this.onChange(event);
        }, 300);

        this.addEventListener('change', this.debouncedOnChange.bind(this));
    }

    onChange(event) {
        this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
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

    updateQuantity(line, quantity, name) {
        document.getElementById('cart-errors').textContent = '';
        const body = JSON.stringify({
            line,
            quantity,
            sections: this.getSectionsToRender().map((section) => section.section),
            sections_url: window.location.pathname
        });

        fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{body}})
            .then((response) => {
                return response.text();
            })
            .then((state) => {
                const parsedState = JSON.parse(state);

                this.getSectionsToRender().forEach((section => {
                    const elementToReplace =
                        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

                    elementToReplace.innerHTML =
                        this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
                }));

                this.updateLiveRegions(line, parsedState.item_count);
                const lineItem = document.getElementById(`CartItem-${line}`);
                if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus();

            })
            .catch(() => {
                document.getElementById('cart-errors').textContent = window.cartStrings.error;

            });
    }

    updateLiveRegions(line, itemCount) {
        if (this.currentItemCount === itemCount) {
            document.getElementById(`Line-item-error-${line}`)
                .querySelector('.cart-item__error-text')
                .innerHTML = window.cartStrings.quantityError.replace(
                '[quantity]',
                document.getElementById(`Quantity-${line}`).value
            );
        }

        this.currentItemCount = itemCount;
    }

    getSectionInnerHTML(html, selector) {
        return new DOMParser()
            .parseFromString(html, 'text/html')
            .querySelector(selector).innerHTML;
    }


}

customElements.define('cart-items', CartItems);
