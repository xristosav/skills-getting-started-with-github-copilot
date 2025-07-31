document.addEventListener('DOMContentLoaded', function() {
    const activitiesList = document.getElementById('activities-list');
    const activitySelect = document.getElementById('activity');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // Fetch and display activities
    async function loadActivities() {
        try {
            const response = await fetch('/activities');
            const activities = await response.json();
            
            displayActivities(activities);
            populateActivitySelect(activities);
        } catch (error) {
            activitiesList.innerHTML = '<p class="error">Failed to load activities</p>';
        }
    }

    function displayActivities(activities) {
        activitiesList.innerHTML = '';
        
        Object.entries(activities).forEach(([name, details]) => {
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            
            const participantsList = details.participants.length > 0 
                ? `<ul class="participants-list">
                     ${details.participants.map(email => `<li>${email}</li>`).join('')}
                   </ul>`
                : '<p class="no-participants">No participants yet</p>';
            
            activityCard.innerHTML = `
                <h4>${name}</h4>
                <p><strong>Description:</strong> ${details.description}</p>
                <p><strong>Schedule:</strong> ${details.schedule}</p>
                <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants} participants</p>
                <div class="participants-section">
                    <h5>Current Participants:</h5>
                    ${participantsList}
                </div>
            `;
            
            activitiesList.appendChild(activityCard);
        });
    }

    function populateActivitySelect(activities) {
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
        
        Object.keys(activities).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            activitySelect.appendChild(option);
        });
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }

    // Handle form submission
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const activity = document.getElementById('activity').value;
        
        if (!email || !activity) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}`
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                signupForm.reset();
                loadActivities(); // Refresh activities to show updated participants
            } else {
                showMessage(result.detail || 'Signup failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });

    // Load activities on page load
    loadActivities();
});
