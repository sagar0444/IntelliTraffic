// Sidebar functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navItems = document.querySelectorAll('.sidebar nav li');
const contentSections = document.querySelectorAll('.content-section');

// Toggle sidebar collapse
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebarToggle.querySelector('i').classList.toggle('fa-chevron-left');
    sidebarToggle.querySelector('i').classList.toggle('fa-chevron-right');
});

// Mobile menu toggle
mobileMenuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Navigation functionality
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        navItems.forEach(navItem => navItem.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Show corresponding content section
        const target = item.getAttribute('data-target');
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === target) {
                section.classList.add('active');
            }
        });
        
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 576) {
            sidebar.classList.remove('open');
        }
    });
});

// Time & Date
function updateDateTime() {
    const now = new Date();

    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
    document.getElementById('current-time').textContent = formattedTime;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('current-date').textContent = formattedDate;
}

// 🚦 Green Time Signal Popup Alert
function showGreenTimeAlert(data) {
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'green-time-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3><i class="fas fa-traffic-light"></i> Traffic Signal Alert</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="popup-body">
                <div class="alert-item">
                    <strong>Traffic Pattern</strong>
                    <span>${data.traffic_pattern}</span>
                </div>
                <div class="alert-item">
                    <strong>Green Light Duration</strong>
                    <span>${data.light_instruction}</span>
                </div>
                <div class="alert-item">
                    <strong>Vehicle Count</strong>
                    <span>${data.vehicle_count}</span>
                </div>
                <div class="alert-item">
                    <strong>Traffic Density</strong>
                    <span>${data.density.toFixed(2)}%</span>
                </div>
                <div class="alert-item">
                    <strong>Timestamp</strong>
                    <span>${data.timestamp}</span>
                </div>
            </div>
            <div class="popup-footer">
                <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-check"></i> Acknowledge
                </button>
            </div>
        </div>
    `;
    
    // Add popup to body
    document.body.appendChild(popup);
    
    // Auto-remove popup after 10 seconds
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 10000);
}

// Initialize charts
function initializeCharts() {
    // Vehicle Count Chart
    const vehicleCtx = document.getElementById('vehicleChart').getContext('2d');
    new Chart(vehicleCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [{
                label: 'Vehicle Count',
                data: [120, 80, 350, 420, 380, 450, 600, 320],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Density Chart
    const densityCtx = document.getElementById('densityChart').getContext('2d');
    new Chart(densityCtx, {
        type: 'bar',
        data: {
            labels: ['Cars', 'Trucks', 'Buses', 'Motorcycles'],
            datasets: [{
                label: 'Traffic Density by Type',
                data: [65, 20, 10, 5],
                backgroundColor: [
                    'rgba(67, 97, 238, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(156, 39, 176, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Pattern Chart
    const patternCtx = document.getElementById('patternChart').getContext('2d');
    new Chart(patternCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Traffic Level',
                data: [2, 3, 2, 3, 3, 1, 1],
                borderColor: '#00c853',
                backgroundColor: 'rgba(0, 200, 83, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: function(context) {
                    const value = context.parsed.y;
                    if (value === 1) return '#4caf50';
                    if (value === 2) return '#ff9800';
                    if (value === 3) return '#f44336';
                    return '#4caf50';
                },
                pointBorderColor: '#fff',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === 1) return 'Level: Low Traffic';
                            if (value === 2) return 'Level: Medium Traffic';
                            if (value === 3) return 'Level: High Traffic';
                            return 'Level: Unknown';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            if (value === 1) return 'Low';
                            if (value === 2) return 'Medium';
                            if (value === 3) return 'High';
                            return '';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Analytics Charts
    const peakHoursCtx = document.getElementById('peakHoursChart').getContext('2d');
    new Chart(peakHoursCtx, {
        type: 'bar',
        data: {
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
            datasets: [{
                label: 'Vehicle Count',
                data: [350, 600, 450, 500, 750, 300],
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const vehicleTypeCtx = document.getElementById('vehicleTypeChart').getContext('2d');
    new Chart(vehicleTypeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Cars', 'Trucks', 'Motorcycles', 'Buses'],
            datasets: [{
                data: [65, 15, 12, 8],
                backgroundColor: [
                    '#4361ee',
                    '#4cc9f0',
                    '#3f37c9',
                    '#7209b7'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update metrics with random data
function updateMetrics() {
    // Generate random values
    const totalVehicles = Math.floor(Math.random() * 1000) + 500;

  
    const trafficDensity = Math.floor(Math.random() * 30) + 40;
    const avgSpeed = Math.floor(Math.random() * 30) + 40;
    
    // Update DOM elements
    document.getElementById('total-vehicles').textContent = totalVehicles;
    document.getElementById('traffic-density').textContent = trafficDensity + '%';
    document.getElementById('avg-speed').textContent = avgSpeed + ' km/h';
    
    // Update traffic status
    const trafficLevel = document.getElementById('traffic-level');
    const statusIndicator = document.getElementById('status-indicator');
    
    if (trafficDensity < 50) {
        trafficLevel.textContent = 'Low';
        statusIndicator.style.backgroundColor = '#4caf50';
    } else if (trafficDensity >= 50 && trafficDensity < 70) {
        trafficLevel.textContent = 'Moderate';
        statusIndicator.style.backgroundColor = '#ff9800';
    } else {
        trafficLevel.textContent = 'High';
        statusIndicator.style.backgroundColor = '#f44336';
    }
}

// Simulate data refresh
function refreshData() {
    updateMetrics();
    
    // Simulate receiving traffic data
    const trafficPatterns = ['Smooth Flow', 'Moderate Congestion', 'Heavy Congestion', 'Standstill'];
    const lightInstructions = ['Extended Green Time', 'Normal Cycle', 'Reduced Green Time'];
    
    const simulatedData = {
        traffic_pattern: trafficPatterns[Math.floor(Math.random() * trafficPatterns.length)],
        light_instruction: lightInstructions[Math.floor(Math.random() * lightInstructions.length)],
        vehicle_count: Math.floor(Math.random() * 100) + 50,
        density: Math.random() * 100,
        timestamp: new Date().toLocaleTimeString()
    };
    
    // Show alert only for certain conditions
    if (simulatedData.density > 70 || simulatedData.traffic_pattern === 'Heavy Congestion') {
        showGreenTimeAlert(simulatedData);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    initializeCharts();
    updateMetrics();
    
    // Refresh data every 30 seconds
    setInterval(refreshData, 30000);
    
    // Simulate initial data load
    setTimeout(refreshData, 2000);
});

