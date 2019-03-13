const { SecureTokenView } = require('./secure-token-view');
const { createElement } = require('./utils');

const loadingImage = require('./img/RET-final.gif');

class LoadingView extends SecureTokenView {
    constructor(options = {}) {
        super({ idPrefix: 'pseloadingview', ...options });

        // TODO: Refactor TokenViewBase and/or SecureTokenView so this isn't necessary
        while (this._containerEl.firstChild) { this._containerEl.firstChild.remove(); }

        this.el.appendChild(createElement('img', { src: loadingImage }, { width: '100%' }));
    }
}

module.exports = { LoadingView };
