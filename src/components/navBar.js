export const renderHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
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
                        <a href="/profile" data-link class="text-gray-800 hover:text-gray-600 transition duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </a>
                        <div class="flex items-center text-gray-800 text-sm">
                            <span id="userBalance" class="ml-2">1000$</span>
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
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        });
    }

    document.body.appendChild(header);

    return header;
};
