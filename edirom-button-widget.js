import '../edirom-core-web-components/src/edirom-icon.js';

class ButtonWidgetElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon-name'];
    }

    connectedCallback() {
        this._render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === 'icon-name') {
            const icon = this.shadowRoot.querySelector('edirom-icon');
            if (icon) icon.setAttribute('name', newValue || '');
        }
    }

    _render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                height: 100%;
                aspect-ratio: 1 / 1;
                cursor: pointer;
                box-sizing: border-box;
            }
            .button-inner {
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                border-radius: 4px;
                background-color: var(--secondary-color, #ffffff00);
                padding: var(--button-widget-padding, 2px);

            }
        `;

        const inner = document.createElement('div');
        inner.className = 'button-inner';

        const icon = document.createElement('edirom-icon');
        const iconName = this.getAttribute('icon-name');
        if (iconName) icon.setAttribute('name', iconName);
        icon.setAttribute('size', 'fill');
        inner.appendChild(icon);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(inner);
    }
}

if (!customElements.get('edirom-button-widget')) {
    customElements.define('edirom-button-widget', ButtonWidgetElement);
}
