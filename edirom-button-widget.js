import '../edirom-core-web-components/src/edirom-icon.js';

class ButtonWidgetElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._states = [];
        this._currentStateName = null;
    }

    static get observedAttributes() {
        return ['states-data', 'current-state'];
    }

    connectedCallback() {
        console.log('Button widget connected!');
        this._render();
    }

    disconnectedCallback() {
        console.log('Button widget disconnected!');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute: ${name} changed from ${oldValue} to ${newValue}`);
        if (oldValue === newValue) return;
        if (name === 'states-data') {
            try {
                this._states = JSON.parse(newValue) || [];
            } catch (e) {
                console.error('edirom-button-widget: could not parse states-data attribute.', e);
                this._states = [];
            }
            this._updateIcon();
        } else if (name === 'current-state') {
            this._currentStateName = newValue;
            this._updateIcon();
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
        icon.setAttribute('size', 'fill');
        inner.appendChild(icon);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(inner);

        this.addEventListener('click', this._handleClick);

        this._updateIcon();
    }

    _updateIcon = () => {
        const icon = this.shadowRoot.querySelector('edirom-icon');
        if (!icon) return;

        if (!this._states.length || !this._currentStateName) {
            icon.setAttribute('name', '');
            return;
        }

        const state = this._states.find(s => s.name === this._currentStateName);
        if (!state) {
            console.error(`edirom-button-widget: current-state "${this._currentStateName}" not found in states-data.`);
            return;
        }

        icon.setAttribute('name', state.iconName ?? '');
    }

    _handleClick = () => {
        if (!this._states.length) return;
        if (!this._currentStateName) return;

        const currentIndex = this._states.findIndex(s => s.name === this._currentStateName);
        if (currentIndex === -1) {
            console.error(`edirom-button-widget: current-state "${this._currentStateName}" not found in states-data.`);
            return;
        }

        const nextIndex = (currentIndex + 1) % this._states.length;
        const requestedState = this._states[nextIndex].name;

        this.dispatchEvent(new CustomEvent('button-state-requested', {
            bubbles: true,
            composed: true,
            detail: { requestedState }
        }));
    }
}

if (!customElements.get('edirom-button-widget')) {
    customElements.define('edirom-button-widget', ButtonWidgetElement);
}
