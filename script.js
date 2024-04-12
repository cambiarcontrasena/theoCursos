let timeout = null;

document.addEventListener('DOMContentLoaded', function() {
    //keys de supabase
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZnFoc2lhaXZwc3RtZ3V1YWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI3MTQ4NzgsImV4cCI6MjAyODI5MDg3OH0.RdlyxY2ee8JVLgpLU8739HseP9v40qFGqozVeTcrofQ";

    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const buttonSubmit = document.getElementById('buttonSubmit');

    let url = "";
    let email = "";

    //Se obtienen los parámetros hash
    const result = {};
    if (window.location.hash.split("#").length > 1) {

        window.location.hash.split("#")[1].split('&').forEach(item => {
            result[item.split('=')[0]] = decodeURIComponent(item.split('=')[1]);
        });
        
    }
    const token = result.access_token;
    try {
        var decoded = jwt_decode(token);

        url = decoded.iss;
        email = decoded.email;
    } catch (error) {
        mostrarAlerta("Hubo un error, por favor vuelve a solicitar el correo de recuperación.");
        buttonSubmit.setAttribute("disabled", "disabled");
        passwordInput.setAttribute("readonly", "true");
        confirmPasswordInput.setAttribute("readonly", "true");
    }

    passwordForm.addEventListener('submit', function(event) {
        event.preventDefault();


        //Deshabilitar el botón en lo que termina el envio del formulario
        buttonSubmit.setAttribute("disabled", "disabled");
        passwordInput.setAttribute("readonly", "true");
        confirmPasswordInput.setAttribute("readonly", "true");


        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password.length < 6) {
            mostrarAlerta("La contraseña debe tener al menos 6 caracteres.");
            buttonSubmit.removeAttribute("disabled");
            passwordInput.removeAttribute("readonly");
            confirmPasswordInput.removeAttribute("readonly");
            return;
        }

        if (password === confirmPassword) {

            fetch(`${url}/user`, {
                method: 'PUT',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization' : 'Bearer ' + token
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg && data.msg.includes("expired")) {
                    mostrarAlerta("El link ha expirado, por favor vuelve a solicitar el correo de recuperación.");
                } else if (data.msg && data.msg.includes("different")) {
                    mostrarAlerta("La contraseña debe de ser diferente a  la anterior.");
                } else if (data && data.id) {
                    mostrarAlerta("La contraseña ha sido cambiada.");
                    passwordInput.value = "";
                    confirmPasswordInput.value = "";
                } else {
                    mostrarAlerta("Hubo un error, por favor vuelve a solicitar el correo de recuperación.");
                }
            })
            .catch(error => {
                console.log(error);
                mostrarAlerta("Hubo un error, por favor vuelve a solicitar el correo de recuperación.");
            }).finally(() => {
                buttonSubmit.removeAttribute("disabled");
                passwordInput.removeAttribute("readonly");
                confirmPasswordInput.removeAttribute("readonly");
            });
        } else {
            mostrarAlerta('Las contraseñas no coinciden.');
            buttonSubmit.removeAttribute("disabled");
            passwordInput.removeAttribute("readonly");
            confirmPasswordInput.removeAttribute("readonly");
        }
    });
});

function mostrarAlerta(texto) {

    clearTimeout(timeout);
    cerrarAlerta();

    const body = document.getElementById("body");

    const div = document.createElement('div');
    div.classList.add("alerta");
    div.id = "alerta";
    div.textContent = texto;

    body.append(div);

    timeout = setTimeout(() => {
        cerrarAlerta();
    }, 5000);
}

function cerrarAlerta() {
    const body = document.getElementById("alerta");
    if (body) {
        body.remove();
    }
}