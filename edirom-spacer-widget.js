class spacerElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._styleEl = document.createElement('style');
        this.shadowRoot.appendChild(this._styleEl);
        this.applyGrow();
    }

    static get observedAttributes() {
        return ["grow"];
    }

    connectedCallback() {
        this.applyGrow();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "grow" && oldValue !== newValue) {
            this.applyGrow();
        }
    }

    applyGrow = () => {
        const grow = this.getAttribute('grow') || '1';
        this._styleEl.textContent = `:host { display: block; flex: 1 1 auto; flex-grow: ${grow}; }`;
    }
}

customElements.define("edirom-spacer-widget", spacerElement);
