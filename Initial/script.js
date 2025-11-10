document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const inputLine = document.getElementById('input-line');
    const passwordInput = document.getElementById('password-input');
    const terminalDiv = document.getElementById('terminal');
    const sceneDiv = document.getElementById('escena-3d');
    
    // El mensaje que se escribirá automáticamente, como en el video
    const messages = [
        "tina", 
        "today is your birthday", 
        "so i made you this computer program"
    ];

    let messageIndex = 0;

    // Función para simular el efecto de 'máquina de escribir'
    function typeWriter(text, callback) {
        let i = 0;
        const speed = 70; // Velocidad de escritura (milisegundos)

        function typing() {
            if (i < text.length) {
                // Usamos innerHTML para mantener la clase 'prompt' sin que se borre
                output.innerHTML += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            } else if (callback) {
                callback();
            }
        }
        typing();
    }

    // Procesa y escribe el siguiente mensaje
    function processMessages() {
        if (messageIndex < messages.length) {
            output.innerHTML += '<div class="prompt">> ' + messages[messageIndex].substring(0, 0) + '</div>';
            
            // Pasamos el texto a escribir a la última línea agregada
            const currentLine = output.lastElementChild;
            typeWriter(messages[messageIndex], () => {
                messageIndex++;
                // Pausa antes de la siguiente línea
                setTimeout(processMessages, 500); 
            });
        } else {
            // Todos los mensajes escritos, ahora pedimos la contraseña
            inputLine.style.display = 'flex';
            passwordInput.focus();
        }
    }

    // Inicia el proceso de escritura
    setTimeout(processMessages, 1000); 

    // ** Lógica de Contraseña **
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const password = passwordInput.value.trim().toLowerCase();
            
            // Simulación de la 'contraseña' del video: 1(๑◕‿◕๑)?
            if (password === '1(๑◕‿◕๑)?' || password === 'torta') { 
                inputLine.style.display = 'none';
                
                // Transición a la escena 3D
                setTimeout(() => {
                    terminalDiv.style.display = 'none';
                    sceneDiv.style.display = 'block';
                    // Aquí iría la llamada a la función para inicializar A-Frame
                    // initAFrameScene(); 
                }, 500);

            } else {
                // Mensaje de error (puedes personalizarlo)
                const errorLine = document.createElement('div');
                errorLine.innerHTML = `<span class="prompt">></span> <span style="color: red;">ERROR: Contraseña incorrecta. Intenta de nuevo.</span>`;
                output.appendChild(errorLine);
                
                passwordInput.value = '';
            }
        }
    });
});