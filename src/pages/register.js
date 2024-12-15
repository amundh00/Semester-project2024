import { API_AUTH_REGISTER, API_AUTH_LOGIN, API_KEY } from '../api/constants.js';
import { handleLocation } from '../router/index.js';
import { renderHeader } from '../components/navBar.js';

export const register = () => {
    const div = document.createElement('div');
    div.classList.add('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-100'); 

    div.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
            <h1 class="text-center text-2xl font-semibold text-gray-800 mb-6">Register</h1>
            <form id="registerForm" class="space-y-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-800">Name:</label>
                    <input type="text" id="name" name="name" required class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700">
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-800">Email:</label>
                    <input type="email" id="email" name="email" required class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-800">Password:</label>
                    <input type="password" id="password" name="password" required class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700">
                </div>
                <div id="errorMessage" class="text-red-500 text-sm"></div> <!-- Error message container -->
                <div>
                    <button type="submit" class="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Register
                    </button>
                </div>
            </form>
            <div class="mt-4 text-center">
                <a href="/login" class="text-purple-600 hover:underline">Login</a>
            </div>
        </div>
    `;

    // Legg til event listener for innsending av skjema
    div.querySelector("#registerForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("errorMessage");

        // Reset error melding
        errorMessage.textContent = '';

        // Kall funksjon for å registrere bruker
        registerUser(name, email, password, errorMessage);
    });

    return div;
};

// Funksjon for å registrere bruker
const registerUser = async (name, email, password, errorMessage) => {
    try {
        const registerResponse = await fetch(API_AUTH_REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Noroff-API-Key': API_KEY,
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!registerResponse.ok) {
            const errorData = await registerResponse.json();
            console.log('API Error Response:', errorData); 

            // Håndtering av feil ved registrering
            if (errorData.errors && errorData.errors.length > 0) {
                const passwordError = errorData.errors.find(err => err.path && err.path.includes('password'));
                if (passwordError) {
                    errorMessage.textContent = passwordError.message; 
                    return;
                }

                const emailError = errorData.errors.find(err => err.path && err.path.includes('email'));
                if (emailError) {
                    errorMessage.textContent = emailError.message; 
                    return;
                }

                const requiredFieldError = errorData.errors.find(err => err.code === 'required');
                if (requiredFieldError) {
                    errorMessage.textContent = requiredFieldError.message; 
                    return;
                }
            }

            // Håndtere andre feil
            if (errorData.statusCode === 429) {
                errorMessage.textContent = "Too many attempts. Please try again later.";
                return;
            }

            if (errorData.statusCode >= 500) {
                errorMessage.textContent = "Server error. Please try again later.";
                return;
            }

            throw new Error(errorData.message || 'Failed to register');
        }

        const registerData = await registerResponse.json();

        // Logg inn bruker etter registrering
        const loginResponse = await fetch(API_AUTH_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Noroff-API-Key': API_KEY,
            },
            body: JSON.stringify({ email, password }),
        });

        if (!loginResponse.ok) {
            throw new Error('Failed to log in after registration');
        }

        const loginData = await loginResponse.json();
        const { accessToken, name: userName } = loginData.data;

        // Lagre token og brukernavn i localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userName', userName);

        // Oppdater header etter innlogging
        const header = document.querySelector('header');
        if (header) header.remove();
        renderHeader();

        // Naviger til startsiden etter innlogging
        history.pushState(null, null, '/');
        handleLocation(); 
    } catch (error) {
        errorMessage.textContent = error.message || 'Failed to register';
    }
};
