# Semester-project2024

# Auction App

## Overview

Auction App is a web application that allows users to create, view, and bid on auction listings. Users can register, log in, and manage their profiles. The application is built using modern web technologies including Vite, Tailwind CSS, and Chart.js.

## Features

- **User Authentication**: Register, log in, and log out.
- **Profile Management**: View and edit user profiles.
- **Auction Listings**: Create, view, and manage auction listings.
- **Bidding System**: Place bids on auction listings.
- **Responsive Design**: Mobile-friendly and responsive UI.
- **Data Visualization**: Display bid history using Chart.js.

  
## Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/your-username/auction-app.git
    cd auction-app
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Create a [.env](http://_vscodecontentref_/26) file in the root directory and add the following:
    ```env
    VITE_API_KEY=your-api-key
    VITE_API_BASE=https://v2.api.noroff.dev
    VITE_API_AUTH=https://v2.api.noroff.dev/auth
    VITE_API_AUTH_LOGIN=https://v2.api.noroff.dev/auth/login
    VITE_API_AUTH_REGISTER=https://v2.api.noroff.dev/auth/register
    VITE_API_AUTH_KEY=https://v2.api.noroff.dev/auth/create-api-key
    VITE_API_SOCIAL=https://v2.api.noroff.dev/social
    VITE_API_SOCIAL_POSTS=https://v2.api.noroff.dev/social/posts
    VITE_API_SOCIAL_PROFILES=https://v2.api.noroff.dev/social/profiles
    VITE_API_AUCTION_LISTINGS=https://v2.api.noroff.dev/auction/listings
    VITE_API_AUCTION_LISTING=https://v2.api.noroff.dev/auction/listings
    VITE_API_AUCTION_ACTIVE_LISTINGS=https://v2.api.noroff.dev/auction/listings?_active=true
    ```

4. **Run the development server**:
    ```sh
    npm run dev
    ```

5. **Build for production**:
    ```sh
    npm run build
    ```

6. **Preview the production build**:
    ```sh
    npm run preview
    ```

## Usage

- **Home Page**: View all active auction listings and search for specific auctions.
- **Auction Details**: View details of a specific auction, including bid history and place new bids.
- **Profile Page**: View and edit user profile, including avatar, banner, and bio.
- **Create Listing**: Create a new auction listing with title, description, media URLs, and end date.
- **Edit Listing**: Edit or delete an existing auction listing.

## Technologies Used

- **Vite**: Build tool for modern web projects.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Chart.js**: JavaScript library for data visualization.
- **JavaScript**: Core programming language for the application.
- **HTML**: Markup language for structuring the web pages.
- **CSS**: Styling language for designing the web pages.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Noroff API](https://docs.noroff.dev/docs/v2/auth/login) for providing the backend services.
- [Chart.js](https://www.chartjs.org/) for the data visualization library.
- [Tailwind CSS](https://tailwindcss.com/) for the CSS framework.
