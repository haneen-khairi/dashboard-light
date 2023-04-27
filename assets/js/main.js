const section = document.querySelector('.side-right-content');
const section2 = document.querySelector('.side-right-content2');
// Add an event listener for scrolling
window.addEventListener('scroll', function () {
    // Check the scroll position
    const scrollPosition = window.scrollY;

    // Define the threshold for changing the CSS
    const threshold = 200;

    // If the scroll position is greater than the threshold, change the CSS
    if (scrollPosition > threshold) {
        section.style.top = '5%'; 
        section2.style.top = '50%'; 
    } else {
        section.style.top = '10%';  
        section2.style.top = '55%';
    }
});


// Function to open a tab
function openTab(tabIndex) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.style.display = 'none';
    });
  
    // Show the selected tab
    const selectedTab = document.getElementById(`tab${tabIndex + 1}`);
    selectedTab.style.display = 'block';
  
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(tabButton => {
      tabButton.classList.remove('active');
    });
    tabButtons[tabIndex].classList.add('active');
  }
  

  document.getElementById('openBtn').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'flex';
});

document.getElementById('closeBtn').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none';
});


// swiper cards
var swiper = new Swiper(".mySwiper", {
  slidesPerView: 3.5,
  spaceBetween: 10,
  breakpoints: {
    640: {
      slidesPerView: 1,
      spaceBetween: 50,
    },
    768: {
      slidesPerView: 2.5,
      spaceBetween: 40,
    },
    1024: {
      slidesPerView: 3.5,
      spaceBetween: 50,
    },
  },
});

//   customer review
// JavaScript can be used to fetch customer reviews from a database or an API and dynamically populate the review section with the retrieved data.
// For example, you can use the Fetch API or Axios to fetch reviews from a backend server.

// Sample code using Fetch API to fetch customer reviews

// Fetch reviews from the backend server
fetch('/api/reviews')
  .then(response => response.json())
  .then(reviews => {
    // Loop through the reviews and create review elements
    const reviewContainer = document.querySelector('.review-container');
    reviews.forEach(review => {
      const reviewElement = document.createElement('div');
      reviewElement.className = 'review';
      reviewElement.innerHTML = `
        <p class="review-text">${review.text}</p>
        <p class="review-author">- ${review.author}</p>
      `;
      reviewContainer.appendChild(reviewElement);
    });
  })
  .catch(error => {
    console.error('Error fetching reviews:', error);
  });
// real time series chart 
