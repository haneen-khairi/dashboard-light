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
