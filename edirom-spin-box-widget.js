import '../edirom-core-web-components/src/edirom-icon.js';

class SpinBoxWidgetElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._steps = [];
        this._currentStep = null;
        this._currentIndex = -1;
        this._carrousel = false;
        this._label = '';
    }

    static get observedAttributes() {
        return ['steps-data', 'current-step', 'carrousel', 'label'];
    }

    connectedCallback() {
        console.log('Spin box widget connected!');
        this._render();
    }

    disconnectedCallback() {
        console.log('Spin box widget disconnected!');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute: ${name} changed from ${oldValue} to ${newValue}`);
        if (oldValue === newValue) return;
        if (name === 'steps-data') {
            try {
                this._steps = JSON.parse(newValue) || [];
            } catch (e) {
                console.error('edirom-spin-box-widget: could not parse steps-data attribute.', e);
                this._steps = [];
            }
            this._update();
        } else if (name === 'current-step') {
            this._currentStep = newValue;
            this._update();
        } else if (name === 'carrousel') {
            this._carrousel = newValue === 'true';
            this._update();
        } else if (name === 'label') {
            this._label = newValue ?? '';
            this._render();
        }
    }

    /**
     * Finds the index of the occurrence of `value` in `_steps` (compared as
     * strings) that is nearest to `referenceIndex`. On tie, the earlier index
     * wins. Returns -1 when no match is found.
     */
    _findNearestIndex(value, referenceIndex) {
        const stepsAsStrings = this._steps.map(String);
        let bestIndex = -1;
        let bestDistance = Infinity;
        for (let i = 0; i < stepsAsStrings.length; i++) {
            if (stepsAsStrings[i] === value) {
                const distance = Math.abs(i - referenceIndex);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = i;
                }
            }
        }
        return bestIndex;
    }

    _render() {
        const hasLabel = !!this._label;

        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: flex;
                height: 100%;
                align-items: center;
                box-sizing: border-box;
            }
            .spin-box-inner {
                display: flex;
                align-items: center;
                height: 100%;
                gap: var(--spin-box-gap, 0);
                background-color: var(--primary-color, #ffffff00);
                transition: background-color 0.2s ease;
                border-radius: 4px;
            }
            .nav-icon {
                height: 100%;
                aspect-ratio: 1 / 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                user-select: none;
                -webkit-user-select: none;
            }
            .input-wrapper {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-end;
                height: 100%;
                width: var(--spin-box-input-width, 4ch);
            }
            .spin-box-label {
                height: 40%;
                width: 100%;
                display: block;
                text-align: center;
                font-size: 0.6em;
                line-height: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ".";
                box-sizing: border-box;
                margin-bottom: 1px;
                user-select: none;
                -webkit-user-select: none;
            }
            .text-input {
                width: 100%;
                text-align: center;
                border: 1px solid var(--spin-box-border-color, #ccc);
                border-radius: var(--spin-box-border-radius, 4px);
                font: inherit;
                box-sizing: border-box;
                padding: var(--spin-box-input-padding, 0 2px);
                ${hasLabel
                ? 'height: 75%; font-size: 0.75em;'
                : 'height: 100%;'
            }
            }
        `;

        const inner = document.createElement('div');
        inner.className = 'spin-box-inner';

        // Previous icon
        const prevContainer = document.createElement('div');
        prevContainer.className = 'nav-icon';
        const prevIcon = document.createElement('edirom-icon');
        prevIcon.setAttribute('name', 'eo_previous');
        prevIcon.setAttribute('size', 'fill');
        prevContainer.appendChild(prevIcon);
        prevContainer.addEventListener('click', this._handlePrev);
        inner.appendChild(prevContainer);

        // Text input (wrapped so a label can stack above it)
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';

        if (hasLabel) {
            const labelEl = document.createElement('span');
            labelEl.className = 'spin-box-label';
            labelEl.textContent = this._label;
            labelEl.title = this._label;
            inputWrapper.appendChild(labelEl);
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'text-input';
        input.addEventListener('keydown', this._handleInputKeydown);
        inputWrapper.appendChild(input);
        inner.appendChild(inputWrapper);

        // Next icon
        const nextContainer = document.createElement('div');
        nextContainer.className = 'nav-icon';
        const nextIcon = document.createElement('edirom-icon');
        nextIcon.setAttribute('name', 'eo_next');
        nextIcon.setAttribute('size', 'fill');
        nextContainer.appendChild(nextIcon);
        nextContainer.addEventListener('click', this._handleNext);
        inner.appendChild(nextContainer);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(inner);

        this._update();
    }

    _update = () => {
        const input = this.shadowRoot.querySelector('.text-input');
        if (!input) return;

        const prevContainer = this.shadowRoot.querySelectorAll('.nav-icon')[0];
        const nextContainer = this.shadowRoot.querySelectorAll('.nav-icon')[1];
        if (!prevContainer || !nextContainer) return;

        if (!this._steps.length || this._currentStep === null) {
            input.value = '';
            prevContainer.style.visibility = 'hidden';
            nextContainer.style.visibility = 'hidden';
            return;
        }

        // Resolve current index: nearest to previous _currentIndex
        const referenceIndex = this._currentIndex >= 0 ? this._currentIndex : 0;
        const resolvedIndex = this._findNearestIndex(this._currentStep, referenceIndex);

        if (resolvedIndex === -1) {
            console.warn(`edirom-spin-box-widget: current-step "${this._currentStep}" not found in steps-data.`);
            return;
        }

        this._currentIndex = resolvedIndex;
        input.value = this._currentStep;

        // Update icon visibility
        // Use '' (inherit) instead of 'visible' so host-level visibility: hidden is not overridden
        if (this._carrousel) {
            prevContainer.style.visibility = '';
            nextContainer.style.visibility = '';
        } else {
            prevContainer.style.visibility = this._currentIndex === 0 ? 'hidden' : '';
            nextContainer.style.visibility = this._currentIndex === this._steps.length - 1 ? 'hidden' : '';
        }
    }

    _handlePrev = () => {
        if (!this._steps.length || this._currentIndex === -1) return;

        let targetIndex;
        if (this._currentIndex === 0) {
            if (this._carrousel) {
                targetIndex = this._steps.length - 1;
            } else {
                return;
            }
        } else {
            targetIndex = this._currentIndex - 1;
        }

        this.dispatchEvent(new CustomEvent('spin-box-step-requested', {
            bubbles: true,
            composed: true,
            detail: { requestedStep: String(this._steps[targetIndex]) }
        }));
    }

    _handleNext = () => {
        if (!this._steps.length || this._currentIndex === -1) return;

        let targetIndex;
        if (this._currentIndex === this._steps.length - 1) {
            if (this._carrousel) {
                targetIndex = 0;
            } else {
                return;
            }
        } else {
            targetIndex = this._currentIndex + 1;
        }

        this.dispatchEvent(new CustomEvent('spin-box-step-requested', {
            bubbles: true,
            composed: true,
            detail: { requestedStep: String(this._steps[targetIndex]) }
        }));
    }

    _handleInputKeydown = (event) => {
        if (event.key !== 'Enter') return;

        const input = this.shadowRoot.querySelector('.text-input');
        const typedValue = input.value;

        const matchIndex = this._findNearestIndex(typedValue, this._currentIndex >= 0 ? this._currentIndex : 0);

        if (matchIndex !== -1) {
            this.dispatchEvent(new CustomEvent('spin-box-step-requested', {
                bubbles: true,
                composed: true,
                detail: { requestedStep: typedValue }
            }));
        } else {
            // Revert to current step
            if (this._currentStep !== null) {
                input.value = this._currentStep;
            }
        }

        input.blur();
    }
}

if (!customElements.get('edirom-spin-box-widget')) {
    customElements.define('edirom-spin-box-widget', SpinBoxWidgetElement);
}
