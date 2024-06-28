document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('websim-menu-toggle');
    const resetButton = document.getElementById('websim-reset-button');
    const transformMenu = document.getElementById('websim-transform-menu');
    const sendButton = document.getElementById('websim-send-button');
    const textInput = document.getElementById('websim-text-input');
    const loadingSpinner = document.getElementById('websim-loading-spinner');
    const popup = document.getElementById('websim-popup');
    const popupInput = document.getElementById('websim-popup-input');
    const popupSubmit = document.getElementById('websim-popup-submit');
    const popupLoading = document.getElementById('websim-popup-loading');
    const popupClose = document.getElementById('websim-popup-close');
    const overlay = document.querySelector('.websim-overlay');
    const content = document.getElementById('content');
    const toggleClickMenuButton = document.getElementById('websim-toggle-click-menu');
    const sentInfo = document.getElementById('websim-sent-info');
    const receivedInfo = document.getElementById('websim-received-info');
    const apiSelect = document.getElementById('websim-api-select');

    let state = {
        theme: 'light',
        bgColor: '#f0f0f0',
        textColor: '#333333',
        accentColor: '#4CAF50',
        fontSize: '16',
        fontFamily: 'Arial, sans-serif'
    };

    let currentElement = null;
    let clickCoords = { x: 0, y: 0 };
    let isProcessing = false;
    let clickMenuEnabled = true;

    const originalContent = content.innerHTML;
    const originalState = JSON.parse(JSON.stringify(state));

    const apiInstructions = {
        general: {
            positioning: "If the user requests something in a specific position, please reorganize or create structure to achieve that effect. Use absolute positioning or other CSS techniques as necessary.",
            api: "You have the capability to generate any type of content, structure, or functionality. Feel free to use web libraries or frameworks if needed to fulfill the user's request. Be creative and don't hesitate to implement advanced features or designs."
        },
        layout: {
            positioning: "Focus on creating responsive and visually appealing layouts. Use CSS Grid, Flexbox, or other modern layout techniques to achieve the desired structure.",
            api: "You specialize in creating and modifying page layouts. Consider responsive design principles and ensure the layout works well on various screen sizes."
        },
        content: {
            positioning: "When generating content, consider its placement within the existing page structure. If necessary, create new structural elements to house the content appropriately.",
            api: "You excel at generating relevant, engaging, and well-structured content. Focus on creating high-quality text, including appropriate HTML tags for headings, paragraphs, lists, etc."
        },
        functionality: {
            positioning: "When adding new functional elements, consider their placement for optimal user experience. Ensure interactive elements are easily accessible.",
            api: "You specialize in adding interactivity and functionality to the page. Generate JavaScript code to create dynamic and interactive features. Ensure to handle potential errors and edge cases."
        },
        style: {
            positioning: "When applying styles, consider the overall visual hierarchy and balance of the page. Ensure that styled elements work harmoniously with existing content.",
            api: "You excel at creating and modifying styles. Generate CSS code to achieve the desired visual effects. Consider using CSS variables for easy theme management."
        },
        backend: {
            positioning: "When integrating backend functionality, consider the placement of UI elements that will interact with the backend. Ensure that these elements are easily accessible and logically positioned within the page layout.",
            api: "You specialize in connecting front-end elements to backend services. Generate the necessary JavaScript code to make API calls, handle responses, and update the UI accordingly. Consider error handling, loading states, and data validation. If needed, suggest modifications to the HTML structure to accommodate new features."
        }
    };

    menuToggle.addEventListener('click', function() {
        transformMenu.classList.toggle('open');
    });

    resetButton.addEventListener('click', function() {
        content.innerHTML = originalContent;
        state = JSON.parse(JSON.stringify(originalState));
        updateStyles();
        saveState();
    });

    toggleClickMenuButton.addEventListener('click', function() {
        clickMenuEnabled = !clickMenuEnabled;
        this.textContent = clickMenuEnabled ? 'Disable Click Menu' : 'Enable Click Menu';
    });

    function updateStyles() {
        document.documentElement.style.setProperty('--bg-color', state.bgColor);
        document.documentElement.style.setProperty('--text-color', state.textColor);
        document.documentElement.style.setProperty('--accent-color', state.accentColor);
        document.documentElement.style.setProperty('--font-size', `${state.fontSize}px`);
        document.documentElement.style.setProperty('--font-family', state.fontFamily);

        if (state.theme === 'dark') {
            document.body.style.backgroundColor = '#333333';
            document.body.style.color = '#ffffff';
        } else if (state.theme === 'neon') {
            document.body.style.backgroundColor = '#000000';
            document.body.style.color = state.accentColor;
            document.body.style.textShadow = `0 0 5px ${state.accentColor}, 0 0 10px ${state.accentColor}`;
        } else {
            document.body.style.backgroundColor = state.bgColor;
            document.body.style.color = state.textColor;
            document.body.style.textShadow = 'none';
        }
    }

    function saveState() {
        localStorage.setItem('websiteTransformerState', JSON.stringify(state));
    }

    function loadState() {
        const savedState = localStorage.getItem('websiteTransformerState');
        if (savedState) {
            state = JSON.parse(savedState);
            updateStyles();
        }
    }

    function applyChanges(data) {
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

        if (data.newElements) {
            data.newElements.forEach(element => {
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
                document.getElementById('content').appendChild(newElement);
            });
        }

        if (data.removeElements) {
            data.removeElements.forEach(selector => {
                const elementsToRemove = document.querySelectorAll(selector);
                elementsToRemove.forEach(el => el.remove());
            });
        }

        if (data.modifyElements) {
            data.modifyElements.forEach(mod => {
                const element = document.querySelector(mod.selector);
                if (element) {
                    if (mod.newContent) element.innerHTML = mod.newContent;
                    if (mod.attributes) {
                        Object.keys(mod.attributes).forEach(attr => {
                            element.setAttribute(attr, mod.attributes[attr]);
                        });
                    }
                    if (mod.style) {
                        Object.assign(element.style, mod.style);
                    }
                }
            });
        }

        if (data.scripts) {
            data.scripts.forEach(script => {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = script;
                document.body.appendChild(scriptElement);
            });
        }

        updateStyles();
        saveState();
    }

    function sendRequest(userRequest, targetElement = null, isFromTransformMenu = false) {
        if (isProcessing) return;

        isProcessing = true;
        loadingSpinner.style.display = 'block';
        popupLoading.style.display = 'block';
        sendButton.disabled = true;
        popupSubmit.disabled = true;
        overlay.style.display = 'block';

        const selectedApi = isFromTransformMenu ? apiSelect.value : apiSelect.value;

        const requestBody = {
            request: userRequest,
            preserveTransformMenu: true,
            uniqueWebsimIds: true,
            fullPageControl: true,
            apiType: selectedApi,
            positioningInstructions: apiInstructions[selectedApi].positioning,
            apiInstructions: apiInstructions[selectedApi].api
        };

        if (!isFromTransformMenu) {
            requestBody.clickCoords = clickCoords;
        }

        if (targetElement) {
            requestBody.targetElementId = targetElement.id;
            requestBody.targetElementClass = targetElement.className;
            requestBody.targetElementTag = targetElement.tagName.toLowerCase();
            requestBody.targetElementText = targetElement.innerText;
            
            requestBody.request = requestBody.request.replace(/\bthis\b/g, `the ${requestBody.targetElementTag} element with id "${requestBody.targetElementId}" and class "${requestBody.targetElementClass}"`);
        }

        requestBody.request = requestBody.request.replace(/\bhere\b/g, `at coordinates (${clickCoords.x}, ${clickCoords.y})`);

        sentInfo.textContent = JSON.stringify(requestBody, null, 2);

        let apiEndpoint = '/api/intelligent-model-changes';
        switch(selectedApi) {
            case 'layout':
                apiEndpoint = '/api/layout-design-changes';
                break;
            case 'content':
                apiEndpoint = '/api/content-generation';
                break;
            case 'functionality':
                apiEndpoint = '/api/functionality-interactivity';
                break;
            case 'style':
                apiEndpoint = '/api/style-theming';
                break;
            case 'backend':
                apiEndpoint = '/api/backend-integration';
                break;
        }

        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            receivedInfo.textContent = JSON.stringify(data, null, 2);
            applyChanges(data);
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
            textInput.value = '';
            popup.style.display = 'none';
            isProcessing = false;
        });
    }

    sendButton.addEventListener('click', function() {
        const userRequest = textInput.value;
        if (userRequest.trim() === '') return;
        sendRequest(userRequest, null, true);
    });

    document.addEventListener('click', function(e) {
        if (!clickMenuEnabled || isProcessing || e.target.id === 'websim-menu-toggle' || e.target.id === 'websim-reset-button' || transformMenu.contains(e.target) || popup.contains(e.target)) {
            return;
        }

        currentElement = e.target;
        clickCoords = { x: e.clientX, y: e.clientY };
        popup.style.left = `${e.clientX}px`;
        popup.style.top = `${e.clientY}px`;
        popup.style.display = 'block';
        popupInput.focus();
    });

    popupSubmit.addEventListener('click', function() {
        const userRequest = popupInput.value;
        if (userRequest.trim() === '') return;
        sendRequest(userRequest, currentElement);
    });

    popupClose.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    loadState();
});