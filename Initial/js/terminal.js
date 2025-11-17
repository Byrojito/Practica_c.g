// js/terminal.js - Lógica del terminal

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const inputLine = document.getElementById('input-line');
    const passwordInput = document.getElementById('password-input');
    const terminalDiv = document.getElementById('terminal');
    const sceneDiv = document.getElementById('escena-3d');
    
    const messages = ["tina", "today is your birthday", "so i made you this computer program"];
    let messageIndex = 0;

    function typeWriter(text, element, callback) {
        let i = 0;
        const speed = 70;
        function typing() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            } else if (callback) {
                setTimeout(callback, 500);
            }
        }
        typing();
    }

    function processMessages() {
        if (messageIndex < messages.length) {
            const line = document.createElement('div');
            line.innerHTML = '<span class="prompt">> </span><span class="text"></span>';
            output.appendChild(line);
            
            const textSpan = line.querySelector('.text');
            typeWriter(messages[messageIndex], textSpan, () => {
                messageIndex++;
                processMessages();
            });
        } else {
            const passwordLine = document.createElement('div');
            passwordLine.innerHTML = '<span class="prompt">> </span><span class="text">enter password:</span>';
            output.appendChild(passwordLine);
            
            setTimeout(() => {
                inputLine.style.display = 'flex';
                passwordInput.focus();
            }, 500);
        }
    }

    setTimeout(processMessages, 1000);

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const password = passwordInput.value.trim().toLowerCase();
            
            if (password === '1(๑◕‿◕๑)?' || password === 'torta' || password === 'tina') {
                const successLine = document.createElement('div');
                successLine.innerHTML = '<span class="prompt">> </span><span style="color: #FFD700;">access granted. loading scene...</span>';
                output.appendChild(successLine);
                
                inputLine.style.display = 'none';
                
                setTimeout(() => {
                    terminalDiv.classList.add('fade-out');
                    
                    setTimeout(() => {
                        terminalDiv.style.display = 'none';
                        sceneDiv.style.display = 'block';
                        init3DScene(); // Definida en main.js
                    }, 1000);
                }, 1000);
            } else {
                const errorLine = document.createElement('div');
                errorLine.innerHTML = '<span class="prompt">> </span><span style="color: #FF0000;">ERROR: incorrect password.</span>';
                output.appendChild(errorLine);
                
                terminalDiv.classList.add('glitch');
                setTimeout(() => terminalDiv.classList.remove('glitch'), 300);
                
                passwordInput.value = '';
                output.scrollTop = output.scrollHeight;
            }
        }
    });
});