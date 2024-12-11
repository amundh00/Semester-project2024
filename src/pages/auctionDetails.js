import { API_BASE } from '../api/constants.js';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
Chart.register(...registerables);

// Function to dynamically load Chart.js
const loadChartJs = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Chart.js'));
        document.head.appendChild(script);
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
        console.log('Fetched auction:', auction); // Debugging: Log the fetched auction

        const title = auction.title || 'No title available';
        const media = auction.media || [];
        const description = auction.description || 'No description available';
        const bids = auction.bids || [];
        const bidsCount = bids.length;
        const latestBid = bids.length > 0 ? bids[bids.length - 1].amount : 'No bids yet';
        const seller = auction.seller ? auction.seller.name : 'Unknown seller';

        // Check if the user is logged in
        const isLoggedIn = !!localStorage.getItem('accessToken');

        // Build the HTML content
        div.innerHTML = `
            <div class="bg-gray-100 p-8 rounded-lg shadow-lg">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <!-- Slider Section -->
                    <div class="relative">
                        <div class="slider overflow-hidden rounded-md shadow-md">
                            <div class="slider-track flex transition-transform">
                                ${media
                                    .map(
                                        (img) =>
                                            `<div class="slider-item min-w-full">
                                                <img src="${img.url}" alt="${img.alt || 'Auction Image'}" class="w-full h-auto object-cover">
                                            </div>`
                                    )
                                    .join('')}
                            </div>
                        </div>
                        <button class="prev hidden absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"><</button>
                        <button class="next hidden absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">></button>
                    </div>
                    <!-- Details Section -->
                    <div>
                        <h1 class="text-2xl font-bold mb-4">${title}</h1>
                        <p class="text-gray-700 mb-4">${description}</p>
                        <p class="text-gray-700 mb-4">Seller: ${seller}</p>
                        <p class="text-gray-700 mb-4">Bids: ${bidsCount}</p>
                        <p class="text-gray-700 mb-4">Latest Bid: $${latestBid}</p>
                        ${isLoggedIn ? '<button id="makeBidButton" class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition">Make Bid</button>' : ''}
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
                    <input type="number" id="bidAmount" class="w-full px-4 py-2 border rounded-md mb-4" placeholder="Enter your bid amount">
                    <button id="submitBidButton" class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition">Submit Bid</button>
                    <button id="closeBidModal" class="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Cancel</button>
                </div>
            </div>
        `;

        // Append the div to the body or a specific container
        document.body.appendChild(div);

        // Add slider functionality
        const slider = div.querySelector('.slider-track');
        const items = div.querySelectorAll('.slider-item');
        const prevButton = div.querySelector('.prev');
        const nextButton = div.querySelector('.next');

        let currentIndex = 0;

        // Show buttons only if there are 2 or more images
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

        // Load Chart.js and create the bids graph
        await loadChartJs();
        const ctx = document.getElementById('bidsGraph').getContext('2d');
        const labels = bids.map(bid => new Date(bid.created));
        const data = bids.map(bid => bid.amount);

        const bidsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Bid Amounts',
                    data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    tension: 0.4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                        },
                        title: {
                            display: true,
                            text: 'Time',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Bid Amount',
                        },
                    },
                },
            },
        });

        // Function to update the bids graph dynamically
        const updateBidsGraph = async () => {
            try {
                const response = await fetch(`${API_BASE}/auction/listings/${auctionId}?_bids=true`);
                if (!response.ok) {
                    throw new Error('Failed to fetch updated bids');
                }
                const { data: updatedAuction } = await response.json();
                const updatedBids = updatedAuction.bids || [];
                const updatedLabels = updatedBids.map(bid => new Date(bid.created));
                const updatedData = updatedBids.map(bid => bid.amount);

                bidsChart.data.labels = updatedLabels;
                bidsChart.data.datasets[0].data = updatedData;
                bidsChart.update();
            } catch (error) {
                console.error('Error fetching updated bids:', error);
            }
        };

        // Update the graph every 30 seconds
        setInterval(updateBidsGraph, 30000);

        // Add event listener for the "Make Bid" button
        if (isLoggedIn) {
            const makeBidButton = document.getElementById('makeBidButton');
            const bidModal = document.getElementById('bidModal');
            const closeBidModal = document.getElementById('closeBidModal');
            const submitBidButton = document.getElementById('submitBidButton');
            const bidAmountInput = document.getElementById('bidAmount');

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
                    const API_KEY = import.meta.env.VITE_API_KEY;
                    if (!accessToken) {
                        throw new Error('No access token found');
                    }

                    console.log('Placing bid with amount:', bidAmount); // Debugging: Log the bid amount
                    console.log('Using access token:', accessToken); // Debugging: Log the access token

                    const response = await fetch(`${API_BASE}/auction/listings/${auctionId}/bids`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                            'X-Noroff-API-Key': API_KEY,
                        },
                        body: JSON.stringify({ amount: bidAmount })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to place bid');
                    }

                    const result = await response.json();
                    console.log('Bid placed successfully:', result);

                    // Hide the modal and refresh the bids graph
                    bidModal.classList.add('hidden');
                    updateBidsGraph();
                } catch (error) {
                    console.error('Error placing bid:', error);
                    alert('Failed to place bid. Please try again.');
                }
            });
        }
    } catch (error) {
        console.error('Error fetching auction details:', error);
        div.innerHTML = '<p class="text-red-500">Failed to load auction details.</p>';
    }

    return div;
};
