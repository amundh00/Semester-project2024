export const renderHeader = () => {
    const header = document.createElement('header');
    header.innerHTML = `
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- User Info -->
                    <div class="flex items-center space-x-4">
                        
                        <div class="flex items-center text-gray-800 text-sm">
                        <a href="/profile" data-link class="text-gray-800 hover:text-gray-600 transition duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </a>
                            <span class="ml-2">1000$</span>
                        </div>
                        <a href="/sell" class="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-600 transition duration-150">
                            Sell
                        </a>
                        <a href="/logout" class="text-red-500 hover:underline text-sm font-medium">
                            Log out
                        </a>
                    </div>

                    <!-- App Title -->
                    <div class="text-purple-700 text-lg font-bold">
                        TILSLAGET
                    </div>

                    <!-- Search Bar -->
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                        <button class="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-gray-500">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a7 7 0 100 14 7 7 0 000-14zm0 0l6 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;
    return header;
};
