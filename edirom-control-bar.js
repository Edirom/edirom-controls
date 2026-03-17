const templates = {
    desktop: `
<style>

:host {
    display: block;
    width: 100%;
    height: 100%;
}

.bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: var(--secondary-color, #e0e0e0);
    box-sizing: border-box;
    padding: 0 8px;
}

</style>
<div class="bar">
    <slot></slot>
</div>
`,

    mobile: `
<style>

:host {
    display: block;
    width: 100%;
    height: 100%;
}

.bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: var(--secondary-color, #e0e0e0);
    box-sizing: border-box;
    padding: 0 4px;
}

</style>
<div class="bar">
    <slot></slot>
</div>
`
};


class controlBarElement extends HTMLElement {
    constructor() {
        super();
        this.mode = this.getLayoutMode(this.getAttribute('layout-mode'));
        this.shadow = this.attachShadow({ mode: "open", delegatesFocus: true });
    }

    static get observedAttributes() {
        return ["layout-mode", "gap"];
    }

    connectedCallback() {
        console.log("Control bar connected!");
        this.mode = this.getLayoutMode(this.getAttribute('layout-mode'));
        this.applyTemplate();
        this.applyGap();
    }

    disconnectedCallback() {
        console.log("Control bar disconnected!");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute: ${name} changed from ${oldValue} to ${newValue}`);
        if (oldValue === newValue) return;
        if (name === "layout-mode") {
            this.mode = this.getLayoutMode(newValue);
            this.applyTemplate();
            this.applyGap();
        } else if (name === "gap") {
            this.applyGap();
        }
    }

    getLayoutMode = (layoutMode) => layoutMode === 'mobile' ? 'mobile' : 'desktop';

    applyTemplate = () => {
        const template = document.createElement("template");
        template.innerHTML = templates[this.mode];
        this.shadow.innerHTML = '';
        this.shadow.append(template.content.cloneNode(true));
    }

    applyGap = () => {
        const bar = this.shadow.querySelector('.bar');
        if (!bar) return;
        const gap = this.getAttribute('gap') || '0';
        bar.style.gap = gap;
    }
}

customElements.define("edirom-control-bar", controlBarElement);
