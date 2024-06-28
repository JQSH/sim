let isProcessing = false;

const apiConfigs = {
    // ... (keep existing apiConfigs)
};

function initializeAPI() {
    // ... (keep existing initializeAPI function)
}

function sendRequest(userRequest, targetElement = null) {
    if (isProcessing) return;

    isProcessing = true;
    const loadingSpinner = document.getElementById('websim-loading-spinner');
    const popupLoading = document.getElementById('websim-popup-loading');
    const sendButton = document.getElementById('websim-send-button');
    const popupSubmit = document.getElementById('websim-popup-submit');
    const overlay = document.querySelector('.websim-overlay');
    const sentInfo = document.getElementById('websim-sent-info');
    const receivedInfo = document.getElementById('websim-received-info');

    loadingSpinner.style.display = 'block';
    popupLoading.style.display = 'block';
    sendButton.disabled = true;
    popupSubmit.disabled = true;
    overlay.style.display = 'block';

    const apiSelector = document.getElementById('websim-api-selector');
    const selectedApi = apiSelector.value;
    const config = apiConfigs[selectedApi];

    const requestBody = {
        request: userRequest,
        preserveTransformMenu: true,
        uniqueWebsimIds: true,
        fullPageControl: true,
        clickCoords: clickCoords,
        currentContent: document.getElementById('content').innerHTML,
        ...config
    };

    if (targetElement) {
        requestBody.targetElementId = targetElement.id;
        requestBody.targetElementClass = targetElement.className;
        requestBody.targetElementTag = targetElement.tagName.toLowerCase();
        requestBody.targetElementText = targetElement.innerText;
        
        requestBody.request = requestBody.request.replace(/\bthis\b/g, `the ${requestBody.targetElementTag} element with id "${requestBody.targetElementId}" and class "${requestBody.targetElementClass}"`);
    }

    requestBody.request = requestBody.request.replace(/\bhere\b/g, `at coordinates (${clickCoords.x}, ${clickCoords.y})`);

    sentInfo.textContent = JSON.stringify(requestBody, null, 2);

    fetch('/api/intelligent-model-changes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        const escapedData = JSON.parse(JSON.stringify(data, (key, value) => {
            if (typeof value === 'string') {
                return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            }
            return value;
        }));
        receivedInfo.textContent = JSON.stringify(escapedData, null, 2);
        applyChanges(escapedData);
        saveStateToHistory();
    })
    .catch(error => {
        console.error('Error:', error);
        receivedInfo.textContent = 'Error: ' + error.message;
    })
    .finally(() => {
        loadingSpinner.style.display = 'none';
        popupLoading.style.display = 'none';
        sendButton.disabled = false;
        popupSubmit.disabled = false;
        overlay.style.display = 'none';
        document.getElementById('websim-text-input').value = '';
        document.getElementById('websim-popup').style.display = 'none';
        isProcessing = false;
    });
}

function applyChanges(data) {
    const contentDiv = document.getElementById('content');

    // Handle new format
    if (data.htmlContent || data.cssContent || data.jsContent) {
        if (data.htmlContent) {
            contentDiv.innerHTML = data.htmlContent;
        }

        if (data.cssContent) {
            let styleElement = document.getElementById('demo-style');
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = 'demo-style';
                document.head.appendChild(styleElement);
            }
            styleElement.textContent = data.cssContent;
        }

        if (data.jsContent) {
            const existingScripts = document.querySelectorAll('script:not([src])');
            existingScripts.forEach(script => script.remove());

            const scriptElement = document.createElement('script');
            scriptElement.textContent = data.jsContent;
            document.body.appendChild(scriptElement);
        }
    }

    // Handle original format
    if (data.html) {
        contentDiv.innerHTML = data.html;
    }

    if (data.css) {
        let styleElement = document.getElementById('demo-style');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'demo-style';
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = data.css;
    }

    if (data.javascript) {
        const existingScripts = document.querySelectorAll('script:not([src])');
        existingScripts.forEach(script => script.remove());

        const scriptElement = document.createElement('script');
        scriptElement.textContent = data.javascript;
        document.body.appendChild(scriptElement);
    }

    // Apply theme changes
    if (data.theme) state.theme = data.theme;
    if (data.bgColor) state.bgColor = data.bgColor;
    if (data.textColor) state.textColor = data.textColor;
    if (data.accentColor) state.accentColor = data.accentColor;
    if (data.fontSize) state.fontSize = data.fontSize;
    if (data.fontFamily) state.fontFamily = data.fontFamily;

    if (data.customCSS) {
        const styleElement = document.createElement('style');
        styleElement.textContent = data.customCSS;
        document.head.appendChild(styleElement);
    }

    if (data.addElement) {
        data.addElement.forEach(element => {
            const newElement = document.createElement(element.tag);
            newElement.innerHTML = element.content;
            if (element.attributes) {
                Object.keys(element.attributes).forEach(attr => {
                    newElement.setAttribute(attr, element.attributes[attr]);
                });
            }
            if (element.style) {
                Object.assign(newElement.style, element.style);
            }
            if (element.parent) {
                const parentElement = document.querySelector(element.parent);
                if (parentElement) {
                    parentElement.appendChild(newElement);
                } else {
                    contentDiv.appendChild(newElement);
                }
            } else {
                contentDiv.appendChild(newElement);
            }
        });
    }

    if (data.removeElements) {
        data.removeElements.forEach(selector => {
            const elementsToRemove = document.querySelectorAll(selector);
            elementsToRemove.forEach(el => el.remove());
        });
    }

    if (data.modifyElement) {
        data.modifyElement.forEach(mod => {
            const element = document.querySelector(mod.selector);
            if (element) {
                if (mod.newContent !== undefined) element.innerHTML = mod.newContent;
                if (mod.attributes) {
                    Object.keys(mod.attributes).forEach(attr => {
                        element.setAttribute(attr, mod.attributes[attr]);
                    });
                }
                if (mod.style) {
                    Object.assign(element.style, mod.style);
                }
                if (mod.addClass) {
                    mod.addClass.split(' ').forEach(cls => element.classList.add(cls));
                }
                if (mod.removeClass) {
                    mod.removeClass.split(' ').forEach(cls => element.classList.remove(cls));
                }
            }
        });
    }

    if (data.addScript) {
        data.addScript.forEach(script => {
            const scriptElement = document.createElement('script');
            if (script.src) {
                scriptElement.src = script.src;
            } else if (script.content) {
                scriptElement.textContent = script.content;
            }
            if (script.attributes) {
                Object.keys(script.attributes).forEach(attr => {
                    scriptElement.setAttribute(attr, script.attributes[attr]);
                });
            }
            document.body.appendChild(scriptElement);
        });
    }

    updateStyles();
    saveState();
}