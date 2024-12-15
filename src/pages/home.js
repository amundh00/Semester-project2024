import { API_AUCTION_LISTINGS } from "../api/constants.js";

// Hent auksjonslister
export async function fetchListings(searchTerm = "", sortOption = "newest") {
  try {
    let url;

    if (searchTerm.trim()) {
      // Bruk dedikert søke-endepunkt
      url = new URL(`${API_AUCTION_LISTINGS}/search`);
      url.searchParams.append("q", searchTerm); // Legg til søkestreng
    } else {
      // Bruk standard endepunkt for lister
      url = new URL(API_AUCTION_LISTINGS);

      // Legg til standard spørringsparametere
      url.searchParams.append("_active", "true");
      url.searchParams.append("_bids", "true");
      url.searchParams.append("_seller", "true");
      url.searchParams.append("_limit", "100");

      // Legg til sorteringsparametere
      switch (sortOption) {
        case "newest":
          url.searchParams.append("sort", "created");
          url.searchParams.append("sortOrder", "desc");
          break;
        case "highestBid":
        case "lowestBid":
          // Sortering etter bud håndteres klient-side
          break;
        case "endingSoon":
          url.searchParams.append("sort", "endsAt");
          url.searchParams.append("sortOrder", "asc");
          break;
        case "notEndingSoon":
          url.searchParams.append("sort", "endsAt");
          url.searchParams.append("sortOrder", "desc");
          break;
        default:
          url.searchParams.append("sort", "created");
          url.searchParams.append("sortOrder", "desc");
      }
    }

    console.log("Henter lister fra:", url.toString());

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kunne ikke hente lister: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Vis auksjonslister
export async function displayListings(searchTerm = "", sortOption = "newest") {
  const postsContainer = document.getElementById("posts-container");

  if (!postsContainer) {

    return;
  }

  try {
    const listingsData = await fetchListings(searchTerm, sortOption);
    let listings = listingsData.data || listingsData; // Normaliser responsen

    // Klient-side sortering etter bud
    if (sortOption === "highestBid" || sortOption === "lowestBid") {
      listings = listings.sort((a, b) => {
        const aHighestBid = a.bids && a.bids.length > 0 ? Math.max(...a.bids.map((bid) => bid.amount)) : 0;
        const bHighestBid = b.bids && b.bids.length > 0 ? Math.max(...b.bids.map((bid) => bid.amount)) : 0;

        if (sortOption === "highestBid") {
          return bHighestBid - aHighestBid; // Synkende rekkefølge
        } else if (sortOption === "lowestBid") {
          return aHighestBid - bHighestBid; // Stigende rekkefølge
        }
        return 0;
      });
    }

    // Tøm containeren
    postsContainer.innerHTML = "";

    if (!listings || listings.length === 0) {
      postsContainer.innerHTML = `<p class="text-center text-gray-500">No listings available at the moment.</p>`;
      return;
    }

    // Oppdater containerens stil til rutenett
    postsContainer.className =
      "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

    // Generer HTML for hver oppføring
    listings.forEach((listing) => {
      const highestBid = listing.bids && listing.bids.length > 0
        ? Math.max(...listing.bids.map((bid) => bid.amount))
        : "No bids yet";

      const imageUrl =
        listing.media && listing.media.length > 0
          ? listing.media[0].url
          : null;

      // Håndter sluttidspunkt
      const endsAtDate = listing.endsAt ? new Date(listing.endsAt) : null;
      const currentTime = new Date();
      const isEnded = endsAtDate && endsAtDate < currentTime;

      const endsAtText = isEnded
        ? `Ended at: ${endsAtDate.toLocaleString()}`
        : `Ends at: ${endsAtDate ? endsAtDate.toLocaleString() : "No end date specified"}`;

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
          <p class="text-gray-600 mt-2">${endsAtText}</p>
        </div>
      `;

      listingDiv.addEventListener("click", () => {
        window.location.href = `/auctionDetails?id=${listing.id}`;
      });

      postsContainer.appendChild(listingDiv);
    });
  } catch (error) {
    postsContainer.innerHTML = `<p class="text-red-500 text-center">Failed to load listings. Please try again later.</p>`;
  }
}

// Startside-komponent
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

  // Event listener for søkefeltet
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.trim();

    // Tilbakestill filteret til standardverdi når du søker
    sortSelect.value = "newest";

    // Debounce søket
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      displayListings(searchTerm, "newest"); // Søk med standard filter
    }, 300);
  });

  // Event listener for sorteringsmenyen
  sortSelect.addEventListener("change", (e) => {
    const sortOption = e.target.value;

    // Tilbakestill søkefeltet når du filtrerer
    searchInput.value = "";

    displayListings("", sortOption); // Filtrer uten søkeord
  });

  // Legg til DOM-en og vis initiale oppføringer
  document.body.appendChild(div);
  displayListings();

  return div;
};
