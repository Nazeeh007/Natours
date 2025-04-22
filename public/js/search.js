document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  // Simple debounce function
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Fetch search results
  async function fetchResults(query) {
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/tours/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.data && data.data.tours) {
        displayResults(data.data.tours);
      }
    } catch (error) {
      console.error('Search error:', error);
      searchResults.innerHTML =
        '<div class="search-result">Error loading results</div>';
      searchResults.style.display = 'block';
    }
  }

  // Display results
  function displayResults(tours) {
    if (!tours || tours.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result">No tours found</div>';
      searchResults.style.display = 'block';
      return;
    }

    searchResults.innerHTML = tours
      .map(
        (tour) => `
            <div class="search-result" onclick="window.location.href='/tour/${
              tour.slug
            }'">
                <h4>${tour.name}</h4>
                <p>${tour.summary || ''}</p>
            </div>
        `
      )
      .join('');

    searchResults.style.display = 'block';
  }

  // Event listeners
  searchInput.addEventListener(
    'input',
    debounce(function () {
      fetchResults(this.value.trim());
    }, 300)
  );

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    fetchResults(searchInput.value.trim());
  });

  // Hide results when clicking outside
  document.addEventListener('click', function (e) {
    if (!searchForm.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
});
