import { API_BASE } from '../api/constants.js';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { handleLocation } from '../router/index.js';
Chart.register(...registerables);

// funksjon for å hente chart data og vise det i en graf
const loadChartJs = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Chart.js'));
        document.head.appendChild(script);
    });
};

// funksjon for å bygge grafen
const renderChart = (bids) => {
    // Sort bids by creation date in ascending order
    bids.sort((a, b) => new Date(a.created) - new Date(b.created));

    const ctx = document.getElementById('bidsGraph').getContext('2d');
    const labels = bids.map(bid => new Date(bid.created).toLocaleString());
    const data = bids.map(bid => bid.amount);

    new Chart(ctx, {
        type: 'bar', 
        data: {
            labels,
            datasets: [{
                label: 'Bid Amounts',
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Time',
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Bid Amount',
                    },
                },
            },
        },
    });
};

export const auctionDetails = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const auctionId = urlParams.get('id');

    const div = document.createElement('div');
    div.classList.add('p-4', 'max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    if (!auctionId) {
        div.innerHTML = '<p class="text-red-500">Auction ID not found.</p>';
        return div;
    }

    try {
        const response = await fetch(`${API_BASE}/auction/listings/${auctionId}?_seller=true&_bids=true`);
        if (!response.ok) {
            throw new Error('Failed to fetch auction details');
        }
        const { data: auction } = await response.json();

        const title = auction.title || 'No title available';
        const media = auction.media || [];
        const description = auction.description || 'No description available';
        const bids = auction.bids || [];
        const bidsCount = bids.length;
        const latestBid = bids.length > 0 ? bids[bids.length - 1].amount : 'No bids yet';
        const seller = auction.seller ? auction.seller.name : 'Unknown seller';
        const endsAt = new Date(auction.endsAt);
        const now = new Date();

        const isExpired = now > endsAt;

        // sjekke om bruker er logget inn
        const isLoggedIn = !!localStorage.getItem('accessToken');
        const currentUser = localStorage.getItem('userName');

        // Bygge HTML elementet
        div.innerHTML = `
            <div class="bg-gray-100 p-8 rounded-lg shadow-lg">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <!-- Slider Section -->
                    <div class="relative">
                        <div class="slider overflow-hidden rounded-md shadow-md h-72 flex items-center justify-center relative">
                            <div class="slider-track flex transition-transform h-full">
                                ${media
                                    .map(
                                        (img) =>
                                            `<div class="slider-item flex items-center justify-center min-w-full h-full">
                                                <img src="${img.url}" alt="${img.alt || 'Auction Image'}" class="max-h-full max-w-full object-contain">
                                            </div>`
                                    )
                                    .join('')}
                            </div>
                            <button class="prev hidden absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"><</button>
                            <button class="next hidden absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">></button>
                        </div>
                        <!-- Bid History Section -->
                        <div id="bidListContainer" class="mt-4">
                            <h2 class="text-xl font-bold mb-2">Bid History</h2>
                            <ul class="bg-white p-4 rounded-lg shadow-md">
                                ${bids.length > 0
                                    ? bids
                                        .sort((a, b) => new Date(b.created) - new Date(a.created))
                                        .map(bid => `
                                            <li class="py-3 flex justify-between items-center">
                                                <span class="font-medium text-gray-800">${bid.bidder.name}</span>
                                                <span class="text-green-600 font-bold">$${bid.amount.toFixed(2)}</span>
                                                <span class="text-gray-500 text-sm">${new Date(bid.created).toLocaleString()}</span>
                                            </li>
                                        `).join('')
                                    : '<li class="text-gray-500">No bids yet</li>'
                                }
                            </ul>
                        </div>
                    </div>
                    <!-- Details Section -->
                    <div>
                        <h1 class="text-2xl font-bold mb-4">${title}</h1>
                        <p class="text-gray-700 mb-4">${description}</p>
                        <p class="text-gray-700 mb-4">Seller: ${seller}</p>
                        <p class="text-gray-700 mb-4">Bids: ${bidsCount}</p>
                        <p class="text-gray-700 mb-4">Latest Bid: $${latestBid}</p>
                        <p class="text-gray-700 mb-4">${isExpired ? 'Ended:' : 'Ends At:'} ${endsAt.toLocaleString()}</p>
                        <p id="countdown" class="text-green-700 font-bold mb-4"></p>
                        ${!isExpired && isLoggedIn && currentUser !== seller ? '<button id="makeBidButton" class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition">Make Bid</button>' : ''}
                        ${!isExpired && isLoggedIn && currentUser === seller ? '<button id="editListingButton" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">Edit Listing</button>' : ''}
                        <div class="mb-4">
                            <canvas id="bidsGraph" class="w-full h-64"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Bid Modal -->
            <div id="bidModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden">
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-bold mb-4">Place Your Bid</h2>
                    <input type="number" id="bidAmount" class="border border-gray-300 p-2 rounded-md w-full mb-4" placeholder="Enter your bid amount">
                    <div class="flex justify-end">
                        <button id="submitBidButton" class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition">Submit Bid</button>
                        <button id="closeBidModal" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition ml-2">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // Append the div to the body
        document.body.appendChild(div);

        // Countdown funksjonalitet
        if (!isExpired) {
            const countdownElement = div.querySelector('#countdown');

            const updateCountdown = () => {
                const now = new Date();
                const timeRemaining = endsAt - now;

                if (timeRemaining <= 0) {
                    countdownElement.textContent = "Auction has ended.";
                    countdownElement.classList.replace('text-green-700', 'text-red-700');
                    return clearInterval(countdownInterval);
                }

                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                countdownElement.textContent = `Time Remaining: ${hours}h ${minutes}m ${seconds}s`;
            };

            const countdownInterval = setInterval(updateCountdown, 1000);
            updateCountdown();
        }

        // Slider funksjonalitet
        const slider = div.querySelector('.slider-track');
        const items = div.querySelectorAll('.slider-item');
        const prevButton = div.querySelector('.prev');
        const nextButton = div.querySelector('.next');

        let currentIndex = 0;

        if (media.length > 1) {
            prevButton.classList.remove('hidden');
            nextButton.classList.remove('hidden');
        }

        const updateSliderPosition = () => {
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        };

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateSliderPosition();
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateSliderPosition();
        });

        // Bygge grafen
        await loadChartJs();
        renderChart(bids);

        // Legge til Event Listener for å åpne og lukke modalen
        if (!isExpired && isLoggedIn && currentUser !== seller) {
            const makeBidButton = div.querySelector('#makeBidButton');
            const bidModal = div.querySelector('#bidModal');
            const closeBidModal = div.querySelector('#closeBidModal');
            const submitBidButton = div.querySelector('#submitBidButton');
            const bidAmountInput = div.querySelector('#bidAmount');

            makeBidButton.addEventListener('click', () => {
                bidModal.classList.remove('hidden');
            });

            closeBidModal.addEventListener('click', () => {
                bidModal.classList.add('hidden');
            });

            submitBidButton.addEventListener('click', async () => {
                const bidAmount = parseFloat(bidAmountInput.value);

                if (isNaN(bidAmount) || bidAmount <= 0) {
                    alert('Please enter a valid bid amount.');
                    return;
                }

                try {
                    const accessToken = localStorage.getItem('accessToken');
                    const response = await fetch(`${API_BASE}/auction/listings/${auctionId}/bids`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                            'X-Noroff-API-Key': import.meta.env.VITE_API_KEY,
                        },
                        body: JSON.stringify({ amount: bidAmount }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to place bid.');
                    }

                    const result = await response.json();

                    bidModal.classList.add('hidden');
                    alert('Bid placed successfully!');
                    location.reload(); // Oppdater siden for å vise den nye budet
                } catch (error) {
                    alert('Failed to place bid. Please try again.');
                }
            });
        }

        // Add event listener for the edit listing button
        if (isLoggedIn && currentUser === seller) {
            const editListingButton = div.querySelector('#editListingButton');
            if (editListingButton) {
                editListingButton.addEventListener('click', () => {
                    history.pushState(null, null, `/editListing?id=${auctionId}`);
                    handleLocation();
                });
            }
        }
    } catch (error) {
        console.error('Error fetching auction details:', error);
        div.innerHTML = '<p class="text-red-500">Failed to load auction details.</p>';
    }

    return div;
};