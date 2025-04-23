// REGISTER FUNCTION
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const aadhaar = document.getElementById('aadhaar').value.trim();
      const password = document.getElementById('password').value;

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const exists = users.some(user => user.aadhaar === aadhaar);

      if (exists) {
        alert("User with this Aadhaar number already exists.");
        return;
      }

      // Add user to localStorage
      users.push({ name, email, aadhaar, password, voted: false });
      localStorage.setItem('users', JSON.stringify(users));

      alert("Registration successful! Please login.");
      window.location.href = "login.html";
    });
  }
});
// LOGIN FUNCTION
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const aadhaar = document.getElementById('aadhaarLogin').value.trim();
      const password = document.getElementById('passwordLogin').value;
      const users = JSON.parse(localStorage.getItem('users')) || [];

      const user = users.find(u => u.aadhaar === aadhaar && u.password === password);

      if (!user) {
        alert("Invalid Aadhaar or Password.");
        return;
      }

      // Store logged-in user temporarily
      sessionStorage.setItem('loggedInUser', JSON.stringify(user));

      // Redirect to mock OTP page
      window.location.href = "otp.html";
    });
  }
});
// OTP GENERATION & VERIFICATION
document.addEventListener('DOMContentLoaded', () => {
  const otpDisplay = document.getElementById('displayOtp');
  const otpForm = document.getElementById('otpForm');

  if (otpDisplay && otpForm) {
    // 1. Generate random 4‑digit OTP and store it
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    sessionStorage.setItem('otpCode', otp);

    // 2. Show OTP on screen (simulating email)
    otpDisplay.textContent = `Your OTP is: ${otp}`;

    // 3. Handle OTP form submission
    otpForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const entered = document.getElementById('otpInput').value.trim();
      const stored = sessionStorage.getItem('otpCode');

      if (entered === stored) {
        // OTP correct → go to voting page
        window.location.href = 'vote.html';
      } else {
        alert('Invalid OTP. Please try again.');
      }
    });
  }
});
// VOTING LOGIC
document.addEventListener('DOMContentLoaded', () => {
  // Only run on vote.html
  if (!document.getElementById('voteForm')) return;

  // 1. Ensure user is logged in
  const userData = sessionStorage.getItem('loggedInUser');
  if (!userData) {
    alert('Please log in first.');
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(userData);

  // 2. Load or initialize candidates
  let candidates = JSON.parse(localStorage.getItem('candidates'));
  if (!candidates) {
    candidates = [
      { id: '1', name: 'Alice Johnson', votes: 0 },
      { id: '2', name: 'Bob Smith', votes: 0 },
      { id: '3', name: 'Catherine Lee', votes: 0 }
    ];
    localStorage.setItem('candidates', JSON.stringify(candidates));
  }

  // 3. Check if user already voted
  if (user.voted) {
    alert('You have already cast your vote.');
    window.location.href = 'result.html';
    return;
  }

  // 4. Render candidate radio buttons
  const listDiv = document.getElementById('candidatesList');
  candidates.forEach(c => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <label>
        <input type="radio" name="candidate" value="${c.id}" required>
        ${c.name}
      </label>
    `;
    listDiv.appendChild(wrapper);
  });

  // 5. Handle vote submission
  document.getElementById('voteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const choice = this.elements['candidate'].value;

    // Increment vote for chosen candidate
    candidates = candidates.map(c =>
      c.id === choice ? { ...c, votes: c.votes + 1 } : c
    );
    localStorage.setItem('candidates', JSON.stringify(candidates));

    // Mark user as having voted
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(u =>
      u.aadhaar === user.aadhaar ? { ...u, voted: true } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update sessionStorage so repeated submission is blocked
    user.voted = true;
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));

    alert('Thank you! Your vote has been recorded.');
    window.location.href = 'result.html';
  });
});
// RESULT DISPLAY LOGIC
document.addEventListener('DOMContentLoaded', () => {
  // Ensure we are on the results page
  if (!document.getElementById('results')) return;

  // Load the candidates and their votes from localStorage
  const candidates = JSON.parse(localStorage.getItem('candidates')) || [];

  // If there are no candidates or no votes, show a message
  if (candidates.length === 0) {
    document.getElementById('results').innerHTML = '<p>No results available yet.</p>';
    return;
  }

  // Generate HTML for the results
  let resultsHTML = '<h3>Voting Results:</h3><ul>';
  candidates.forEach(c => {
    resultsHTML += `<li><strong>${c.name}</strong>: ${c.votes} votes</li>`;
  });
  resultsHTML += '</ul>';

  // Display the results in the results div
  document.getElementById('results').innerHTML = resultsHTML;
 

// WINNER DECLARATION
if (candidates.length > 0) {
  // Find highest vote count
  const maxVotes = Math.max(...candidates.map(c => c.votes));
  const winners = candidates.filter(c => c.votes === maxVotes);

  const winnerText = winners.length > 1
    ? `🏆 It's a tie between: ${winners.map(w => w.name).join(', ')} with ${maxVotes} votes each.`
    : `🏆 Winner: ${winners[0].name} with ${maxVotes} votes!`;

  const winnerDiv = document.getElementById('winnerSection');
  winnerDiv.innerHTML = `<h3 style="color: #00ff99;">${winnerText}</h3>`;
}
}); 