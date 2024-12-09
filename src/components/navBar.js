import { API_BASE } from '../api/constants.js';

export const renderHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const isLoggedIn = !!accessToken;

    const header = document.createElement('header');
    header.classList.add('relative', 'z-50'); // Add z-index class to header
    header.innerHTML = `
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Left Side -->
                    <div class="flex items-center space-x-4 flex-1">
                        ${isLoggedIn ? `
                        <a href="/sell" class="bg-[#8F87B8] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-600 transition duration-150">
                            Sell
                        </a>` : ''}
                        <a href="${isLoggedIn ? '#' : '/login'}" id="authButton" class="${isLoggedIn ? 'text-red-500' : 'text-green-500'} hover:underline text-sm font-medium">
                            ${isLoggedIn ? 'Log out' : 'Log in'}
                        </a>
                    </div>

                    <!-- App Title -->
                    <div class="text-purple-700 text-lg font-bold flex-1 text-center">
                        <a href="/" class="hover:underline">TILSLAGET</a>
                    </div>

                    <!-- Right Side -->
                    <div class="flex items-center space-x-4 flex-1 justify-end">
                        ${isLoggedIn ? `<span class="text-gray-800 text-sm">Welcome, ${userName}</span>` : ''}
                        <a href="/profile" data-link class="text-gray-800 hover:text-gray-600 transition duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </a>
                        <div class="flex items-center text-gray-800 text-sm">
                            <span id="userBalance" class="ml-2">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // Add event listener for logout
    if (isLoggedIn) {
        header.querySelector('#authButton').addEventListener('click', (event) => {
            event.preventDefault();
            const confirmLogout = confirm('Are you sure you want to log out?');
            if (confirmLogout) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userName'); // Remove userName as well
                window.location.href = '/login';
            }
        });

        // Fetch user profile info from the new endpoint
        const apiUrl = `${API_BASE}/auction/profiles/${userName}`;

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }
            return response.json();
        })
        .then(data => {
            console.log('User Profile:', data);
            const profile = data.data; // Extract the profile data
            const balance = profile.credits || 0;  // Default to 0 if credits is undefined
            document.getElementById('userBalance').textContent = `${balance}$`;
        })
        .catch(error => console.error('Error fetching user profile:', error));
    }

    document.body.appendChild(header);

    return header;
};
