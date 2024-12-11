import { API_AUCTION_LISTINGS } from "../api/constants.js";

// Fetch Listings Function
export async function fetchListings(searchTerm = "", sortOption = "newest") {
  try {
    const url = new URL(API_AUCTION_LISTINGS);

    // Add query parameters
    url.searchParams.append("_active", "true");
    url.searchParams.append("_bids", "true");
    url.searchParams.append("_seller", "true");
    url.searchParams.append("_limit", "100"); // Fetch top 100
    url.searchParams.append("sort", "created"); // Sort by creation date
    url.searchParams.append("sortOrder", "desc"); // Descending order for newest

    // Add search term if provided
    if (searchTerm.trim()) {
      url.searchParams.append("q", searchTerm);
    }

    console.log("Fetching listings from:", url.toString());

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchListings:", error);
    throw error;
  }
}

// Display Listings Function
export async function displayListings(searchTerm = "", sortOption = "newest") {
  const postsContainer = document.getElementById("posts-container");

  if (!postsContainer) {
    console.error("Error: posts-container element not found.");
    return;
  }

  try {
    const listingsData = await fetchListings(searchTerm, sortOption);
    const listings = listingsData.data || listingsData; // Normalize response

    // Clear the container
    postsContainer.innerHTML = "";

    if (!listings || listings.length === 0) {
      postsContainer.innerHTML = `<p class="text-center text-gray-500">No listings available at the moment.</p>`;
      return;
    }

    // Update the container's styling for grid layout
    postsContainer.className =
      "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

    listings.forEach((listing) => {
      const highestBid = listing.bids && listing.bids.length > 0
        ? Math.max(...listing.bids.map((bid) => bid.amount))
        : "No bids yet";

      const imageUrl =
        listing.media && listing.media.length > 0
          ? listing.media[0].url
          : null;

      const endsAt = new Date(listing.endsAt).toLocaleString();

      const listingDiv = document.createElement("div");
      listingDiv.classList.add(
        "border",
        "rounded-md",
        "shadow-md",
        "bg-white",
        "hover:shadow-lg",
        "transition",
        "transform",
        "hover:-translate-y-1",
        "cursor-pointer"
      );

      listingDiv.innerHTML = `
        <div class="h-48 overflow-hidden flex items-center justify-center bg-gray-200">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${listing.title}" class="w-full h-full object-cover">`
              : '<span class="text-black">No image</span>'
          }
        </div>
        <div class="p-4 text-center">
          <h3 class="text-lg font-semibold truncate" title="${listing.title}">${listing.title}</h3>
          <p class="text-gray-600 mt-2">Highest bid: <span class="font-bold">${highestBid}</span></p>
          <p class="text-gray-600 mt-2">Ends at: <span class="font-bold">${endsAt}</span></p>
        </div>
      `;

      listingDiv.addEventListener("click", () => {
        window.location.href = `/auctionDetails?id=${listing.id}`;
      });

      postsContainer.appendChild(listingDiv);
    });
  } catch (error) {
    console.error("Error displaying listings:", error);
    postsContainer.innerHTML = `<p class="text-red-500 text-center">Failed to load listings. Please try again later.</p>`;
  }
}

// Home Page Component
export const home = () => {
  const div = document.createElement("div");
  div.classList.add("p-4");

  div.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-4 flex items-center gap-4">
        <input
          type="text"
          id="searchInput"
          placeholder="Search auctions..."
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          id="sortSelect"
          class="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="newest">Newest</option>
          <option value="highestBid">Highest to Lowest Bid</option>
          <option value="lowestBid">Lowest to Highest Bid</option>
          <option value="endingSoon">Ending Soon</option>
          <option value="notEndingSoon">Not Ending Soon</option>
        </select>
      </div>
      <div id="posts-container"></div>
    </div>
  `;

  const searchInput = div.querySelector("#searchInput");
  const sortSelect = div.querySelector("#sortSelect");

  // Add event listener for search input
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.trim();
    clearTimeout(window.searchTimeout); // Use a global timeout for debouncing
    window.searchTimeout = setTimeout(() => {
      displayListings(searchTerm, sortSelect.value);
    }, 300);
  });

  // Add event listener for sort dropdown
  sortSelect.addEventListener("change", (e) => {
    displayListings(searchInput.value.trim(), e.target.value);
  });

  // Append to the DOM and trigger initial display
  document.body.appendChild(div);
  displayListings();

  return div;
};
