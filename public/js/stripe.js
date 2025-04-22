const stripe = Stripe(
  'pk_test_51RGdGPAUOAvGF4gwdhtefEhfhnsQN0Z2GNvU2ixlOPbfPSXvyfCgc006BMAYLptqIpuhViHPoKsuCg3AS8Kb4hQm00Otk3MnIp'
);
const bookTour = async (tourId) => {
  try {
    //1. Get checkout session from API
    const session = await fetch(
      ` /api/v1/bookings/checkout-session/${tourId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    // console.log(session);
    const sessionData = await session.json();
    console.log(sessionData);
    //2. Create checkout form + charge credit card
    const result = await stripe.redirectToCheckout({
      sessionId: sessionData.session.id,
    });
    if (result.error) {
      showAlert('error', result.error.message);
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert(
      'error',
      'An error occurred while processing your request. Please try again.'
    );
  }
};

const bookBtn = document.getElementById('book-tour');
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    // console.log('Book button clicked');
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    // console.log('Tour ID from button:', tourId);
    bookTour(tourId);
  });
} else {
  console.log('Book button not found');
}
