// src/pages/login.js
import { API_AUTH_LOGIN, API_KEY } from '../api/constants.js';

export const login = () => {
    const div = document.createElement('div');
    div.classList.add('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-100'); // Center and style the container

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
                <div>
                    <button type="submit" class="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Login
                    </button>
                </div>
            </form>
            <div class="mt-4 text-center">
                <a href="/register" class="text-purple-600 hover:underline">Register</a>
            </div>
        </div>
    `;

    // Add event listener for form submission
    div.querySelector("#loginForm").addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        authenticateUser(email, password);
    });

    return div;
};

// Function to authenticate user
const authenticateUser = async (email, password) => {
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
            throw new Error('Failed to authenticate');
        }

        const { data } = await response.json();
        const { accessToken, name } = data;

        // Store access token and user name in local storage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userName', name);

        // Redirect to home page or another page
        window.location.href = '/';
    } catch (error) {
        console.error('Error during authentication:', error);
        alert('Failed to log in. Please check your credentials and try again.');
    }
};
