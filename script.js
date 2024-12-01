class FitnessTracker {
    constructor() {
        this.activities = JSON.parse(localStorage.getItem('activities')) || [];
        this.form = document.getElementById('activity-form');
        this.activityList = document.getElementById('activity-list');
        this.chart = null;

        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addActivity();
        });

        // Set default date to today
        document.getElementById('date').valueAsDate = new Date();
    }

    addActivity() {
        const activity = {
            id: Date.now(),
            type: document.getElementById('activity-type').value,
            duration: parseInt(document.getElementById('duration').value),
            intensity: document.getElementById('intensity').value,
            date: document.getElementById('date').value,
        };

        this.activities.push(activity);
        this.saveActivities();
        this.updateUI();
        this.form.reset();
        document.getElementById('date').valueAsDate = new Date();
    }

    deleteActivity(id) {
        this.activities = this.activities.filter(activity => activity.id !== id);
        this.saveActivities();
        this.updateUI();
    }

    saveActivities() {
        localStorage.setItem('activities', JSON.stringify(this.activities));
    }

    updateUI() {
        this.updateStats();
        this.updateActivityList();
        this.updateChart();
    }

    updateStats() {
        const totalActivities = this.activities.length;
        const totalMinutes = this.activities.reduce((sum, activity) => sum + activity.duration, 0);

        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const thisWeekActivities = this.activities.filter(activity =>
            new Date(activity.date) >= weekStart
        ).length;

        document.getElementById('total-activities').textContent = totalActivities;
        document.getElementById('total-minutes').textContent = totalMinutes;
        document.getElementById('this-week').textContent = thisWeekActivities;
    }

    updateActivityList() {
        this.activityList.innerHTML = '';

        const sortedActivities = [...this.activities].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        sortedActivities.forEach(activity => {
            const div = document.createElement('div');
            div.className = 'activity-item';

            div.innerHTML = `
                <div class="activity-info">
                    <strong>${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</strong> -
                    ${activity.duration} minutes,
                    ${activity.intensity} intensity,
                    ${new Date(activity.date).toLocaleDateString()}
                </div>
                <button onclick="fitnessTracker.deleteActivity(${activity.id})">Delete</button>
            `;

            this.activityList.appendChild(div);
        });
    }

    updateChart() {
        const ctx = document.getElementById('activity-chart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        const activityTypes = [...new Set(this.activities.map(a => a.type))];
        const datasets = activityTypes.map(type => {
            const typeActivities = this.activities
                .filter(a => a.type === type)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            return {
                label: type.charAt(0).toUpperCase() + type.slice(1),
                data: typeActivities.map(a => ({
                    x: a.date,
                    y: a.duration
                })),
                fill: false,
                tension: 0.1
            };
        });

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Duration (minutes)'
                        },
                        min: 0
                    }
                }
            }
        });
    }
}

// Initialize the fitness tracker
const fitnessTracker = new FitnessTracker();
