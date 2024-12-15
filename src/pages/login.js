import { API_AUTH_LOGIN, API_KEY } from '../api/constants.js';
import { handleLocation } from '../router/index.js';
import { renderHeader } from '../components/navBar.js';

export const login = () => {
    const div = document.createElement('div');
    div.classList.add('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-100');

    div.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
            <h1 class="text-center text-2xl font-semibold text-gray-800 mb-6">Login</h1>
            <form id="loginForm" class="space-y-4">
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
                        Login
                    </button>
                </div>
            </form>
            <div class="mt-4 text-center">
                <a href="/register" data-link class="text-purple-600 hover:underline">Register</a>
            </div>
        </div>
    `;

    // legg til event listener for innsending av skjema
    div.querySelector("#loginForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("errorMessage");

        errorMessage.textContent = '';

        authenticateUser(email, password, errorMessage);
    });

    return div;
};

// Funksjon for å autentisere bruker
const authenticateUser = async (email, password, errorMessage) => {
    try {
        const response = await fetch(API_AUTH_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Noroff-API-Key': API_KEY,
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();

            // Handering av feil ved innlogging
            if (errorData.errors && errorData.errors.length > 0) {
                const credentialError = errorData.errors.find(err => err.path && (err.path.includes('email') || err.path.includes('password')));
                if (credentialError) {
                    errorMessage.textContent = credentialError.message; // e.g., "Invalid email or password"
                    return;
                }
            }

            // Handere andre feil
            if (errorData.statusCode === 429) {
                errorMessage.textContent = "Too many attempts. Please try again later.";
                return;
            }

            if (errorData.statusCode >= 500) {
                errorMessage.textContent = "Server error. Please try again later.";
                return;
            }

            throw new Error(errorData.message || 'Failed to authenticate');
        }

        const { data } = await response.json();
        const { accessToken, name } = data;

        // lagre token og brukernavn i localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userName', name);

        // Oppdater header etter innlogging
        const header = document.querySelector('header');
        if (header) header.remove();
        renderHeader();

        // Omdiriger til hjemmesiden etter innlogging
        history.pushState(null, null, '/');
        handleLocation(); // Håndter omdirigering
    } catch (error) {
        errorMessage.textContent = error.message || 'Failed to authenticate';
    }
};
