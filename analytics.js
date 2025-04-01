// Main calendar data processing functions
function updateChartsFromCalendar() {
    // Get date range from inputs
    const fromDate = new Date(document.getElementById('date-from').value);
    const toDate = new Date(document.getElementById('date-to').value);
    toDate.setHours(23, 59, 59, 999); // Include the entire end day
    
    // Load events from localStorage and filter by date range
    const allEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    const events = allEvents.filter(event => {
        const eventStart = new Date(event.start);
        return eventStart >= fromDate && eventStart <= toDate;
    });
    
    // Update all analytics sections
    updateDashboardSummary(events);
    updateTasksAnalytics(events);
    updateTimeAnalytics(events);
    updateProgressAnalytics(events);
}

// Dashboard summary stats
function updateDashboardSummary(events) {
    if (events.length === 0) {
        $('#analytics-container .summary-card').each(function() {
            $(this).find('.summary-value').text('0');
        });
        return;
    }
    
    // Calculate summary statistics
    const totalEvents = events.length;
    const totalDuration = events.reduce((sum, event) => sum + (event.duration || 0), 0);
    const avgDuration = totalEvents > 0 ? totalDuration / totalEvents : 0;
    
    // Completed events count (if you have a status property)
    const completedEvents = events.filter(event => event.status === 'completed').length;
    const completionRate = totalEvents > 0 ? (completedEvents / totalEvents * 100).toFixed(0) : 0;
    
    // Update summary cards
    $('#total-events').text(totalEvents);
    $('#total-hours').text((totalDuration / 60).toFixed(1));
    $('#avg-duration').text((avgDuration / 60).toFixed(1));
    $('#completion-rate').text(completionRate + '%');
}

// Tasks tab analytics
function updateTasksAnalytics(events) {
    // Get filter values
    const categoryFilter = $('#category-filter').val();
    const statusFilter = $('#status-filter').val();
    const sortBy = $('#sort-by').val();
    
    // Apply filters if they exist
    let filteredEvents = events;
    if (categoryFilter && categoryFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.category === categoryFilter);
    }
    
    if (statusFilter && statusFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.status === statusFilter);
    }
    
    // Sort events based on selection
    if (sortBy === 'date') {
        filteredEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    } else if (sortBy === 'duration') {
        filteredEvents.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === 'category') {
        filteredEvents.sort((a, b) => a.category.localeCompare(b.category));
    }
    
    // Update category breakdown chart
    updateCategoryChart(filteredEvents);
    
    // Populate tasks table
    populateTasksTable(filteredEvents);
}

// Create/update category breakdown chart
function updateCategoryChart(events) {
    // Group events by category
    const categorySummary = {};
    events.forEach(event => {
        const category = event.category || 'Uncategorized';
        if (!categorySummary[category]) {
            categorySummary[category] = {
                count: 0,
                totalDuration: 0
            };
        }
        categorySummary[category].count++;
        categorySummary[category].totalDuration += (event.duration || 0);
    });
    
    // Create category data for charts
    const categories = Object.keys(categorySummary);
    const categoryCount = categories.map(cat => categorySummary[cat].count);
    const categoryDuration = categories.map(cat => categorySummary[cat].totalDuration / 60); // Convert to hours
    
    // Colors for charts (extend as needed)
    const backgroundColors = [
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
    ];
    
    // Create/update event count chart
    const categoryChartEl = document.getElementById('category-chart');
    
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    window.categoryChart = new Chart(categoryChartEl.getContext('2d'), {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Number of Tasks by Category',
                data: categoryCount,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.5', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Create/update time distribution chart
    const timeChartEl = document.getElementById('time-distribution-chart');
    
    if (window.timeDistributionChart) {
        window.timeDistributionChart.destroy();
    }
    
    window.timeDistributionChart = new Chart(timeChartEl.getContext('2d'), {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                label: 'Time Spent by Category (hours)',
                data: categoryDuration,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.5', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `${context.label}: ${value.toFixed(1)} hours`;
                        }
                    }
                }
            }
        }
    });
}

// Populate tasks table with filtered events
function populateTasksTable(events) {
    const tableBody = $('#tasks-table tbody');
    tableBody.empty();
    
    if (events.length === 0) {
        tableBody.html('<tr><td colspan="5" class="text-center">No tasks found</td></tr>');
        return;
    }
    
    events.forEach(event => {
        const startDate = new Date(event.start);
        const formattedDate = startDate.toLocaleDateString();
        const duration = event.duration ? (event.duration / 60).toFixed(1) : '-';
        const status = event.status || 'Not set';
        const category = event.category || 'Uncategorized';
        
        // Create row with status-based coloring
        const statusClass = status.toLowerCase() === 'completed' ? 'table-success' : 
                          status.toLowerCase() === 'in progress' ? 'table-warning' : '';
        
        tableBody.append(`
            <tr class="${statusClass}">
                <td>${event.title}</td>
                <td>${formattedDate}</td>
                <td>${duration} hrs</td>
                <td>${category}</td>
                <td>${status}</td>
            </tr>
        `);
    });
}

// Time tab analytics
function updateTimeAnalytics(events) {
    // Daily time distribution
    updateDailyTimeChart(events);
    
    // Hourly distribution
    updateHourlyDistributionChart(events);
    
    // Average time per day of week
    updateWeekdayAnalysisChart(events);
}

// Create daily time distribution chart
function updateDailyTimeChart(events) {
    // Group events by day
    const dailyData = {};
    
    events.forEach(event => {
        const date = new Date(event.start).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = 0;
        }
        dailyData[date] += (event.duration || 0) / 60; // Convert to hours
    });
    
    const dates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
    const values = dates.map(date => dailyData[date]);
    
    // Create/update chart
    const dailyChartEl = document.getElementById('daily-time-chart');
    
    if (window.dailyTimeChart) {
        window.dailyTimeChart.destroy();
    }
    
    window.dailyTimeChart = new Chart(dailyChartEl.getContext('2d'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Hours per Day',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            }
        }
    });
}

// Create hourly distribution chart
function updateHourlyDistributionChart(events) {
    // Initialize hours array (0-23)
    const hourlyCount = Array(24).fill(0);
    
    events.forEach(event => {
        const hour = new Date(event.start).getHours();
        hourlyCount[hour]++;
    });
    
    // Create labels for all hours
    const hourLabels = Array(24).fill().map((_, i) => {
        const hour = i % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${hour}${i < 12 ? 'AM' : 'PM'}`;
    });
    
    // Create/update chart
    const hourlyChartEl = document.getElementById('hourly-distribution-chart');
    
    if (window.hourlyChart) {
        window.hourlyChart.destroy();
    }
    
    window.hourlyChart = new Chart(hourlyChartEl.getContext('2d'), {
        type: 'bar',
        data: {
            labels: hourLabels,
            datasets: [{
                label: 'Number of Tasks Started',
                data: hourlyCount,
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Tasks'
                    }
                }
            }
        }
    });
}

// Create weekday analysis chart
function updateWeekdayAnalysisChart(events) {
    // Initialize weekday arrays
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayCounts = Array(7).fill(0);
    const weekdayDurations = Array(7).fill(0);
    
    events.forEach(event => {
        const weekday = new Date(event.start).getDay();
        weekdayCounts[weekday]++;
        weekdayDurations[weekday] += (event.duration || 0) / 60; // Convert to hours
    });
    
    // Calculate average duration per task for each weekday
    const avgDurationPerDay = weekdays.map((_, i) => {
        return weekdayCounts[i] ? weekdayDurations[i] / weekdayCounts[i] : 0;
    });
    
    // Create/update chart
    const weekdayChartEl = document.getElementById('weekday-analysis-chart');
    
    if (window.weekdayChart) {
        window.weekdayChart.destroy();
    }
    
    window.weekdayChart = new Chart(weekdayChartEl.getContext('2d'), {
        type: 'bar',
        data: {
            labels: weekdays,
            datasets: [
                {
                    label: 'Tasks per Day',
                    data: weekdayCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Avg Hours per Task',
                    data: avgDurationPerDay,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Tasks'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Average Hours'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Progress tab analytics
function updateProgressAnalytics(events, period = 'weekly') {
    // Implement completion rate over time
    updateCompletionRateChart(events, period);
    
    // Implement progress toward goals
    updateGoalsProgressChart(events);
}

// Create completion rate chart
function updateCompletionRateChart(events, period) {
    // Group events by time period
    const completionData = {};
    const today = new Date();
    
    events.forEach(event => {
        const eventDate = new Date(event.start);
        let periodKey;
        
        if (period === 'daily') {
            periodKey = eventDate.toLocaleDateString();
        } else if (period === 'weekly') {
            // Get the week number
            const firstDayOfYear = new Date(eventDate.getFullYear(), 0, 1);
            const pastDaysOfYear = (eventDate - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            periodKey = `Week ${weekNum}, ${eventDate.getFullYear()}`;
        } else if (period === 'monthly') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            periodKey = `${monthNames[eventDate.getMonth()]} ${eventDate.getFullYear()}`;
        }
        
        if (!completionData[periodKey]) {
            completionData[periodKey] = { total: 0, completed: 0 };
        }
        
        completionData[periodKey].total++;
        if (event.status && event.status.toLowerCase() === 'completed') {
            completionData[periodKey].completed++;
        }
    });
    
    // Calculate completion rates
    const periods = Object.keys(completionData).sort((a, b) => {
        if (period === 'daily') {
            return new Date(a) - new Date(b);
        }
        return a.localeCompare(b);
    });
    
    const completionRates = periods.map(key => {
        const data = completionData[key];
        return data.total > 0 ? (data.completed / data.total * 100) : 0;
    });
    
    // Create/update chart
    const completionChartEl = document.getElementById('completion-rate-chart');
    
    if (window.completionChart) {
        window.completionChart.destroy();
    }
    
    window.completionChart = new Chart(completionChartEl.getContext('2d'), {
        type: 'line',
        data: {
            labels: periods,
            datasets: [{
                label: 'Completion Rate (%)',
                data: completionRates,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Completion Rate (%)'
                    }
                }
            }
        }
    });
}

// Create goals progress chart (example with dummy goals)
function updateGoalsProgressChart(events) {
    // This is a placeholder - you would need to implement goal tracking in your app
    // Example goals structure
    const goals = [
        { name: 'Work Tasks', target: 20, category: 'Work' },
        { name: 'Exercise Hours', target: 10, category: 'Exercise' },
        { name: 'Learning Time', target: 15, category: 'Learning' }
    ];
    
    // Calculate progress for each goal
    const goalProgress = goals.map(goal => {
        let achieved = 0;
        
        if (goal.category) {
            const categoryEvents = events.filter(event => event.category === goal.category);
            if (goal.name.includes('Hours') || goal.name.includes('Time')) {
                // Sum durations for time-based goals
                achieved = categoryEvents.reduce((sum, event) => sum + ((event.duration || 0) / 60), 0);
            } else {
                // Count events for task-based goals
                achieved = categoryEvents.length;
            }
        }
        
        return {
            name: goal.name,
            achieved: achieved,
            target: goal.target,
            percentage: Math.min(100, (achieved / goal.target * 100))
        };
    });
    
    // Create/update chart
    const goalsChartEl = document.getElementById('goals-progress-chart');
    
    if (window.goalsChart) {
        window.goalsChart.destroy();
    }
    
    window.goalsChart = new Chart(goalsChartEl.getContext('2d'), {
        type: 'bar',
        data: {
            labels: goalProgress.map(g => g.name),
            datasets: [
                {
                    label: 'Achieved',
                    data: goalProgress.map(g => g.achieved),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Target',
                    data: goalProgress.map(g => g.target),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    }
                }
            }
        }
    });
    
    // Update progress bars
    const goalsList = $('#goals-list');
    goalsList.empty();
    
    goalProgress.forEach(goal => {
        goalsList.append(`
            <div class="mb-3">
                <div class="d-flex justify-content-between">
                    <span>${goal.name}</span>
                    <span>${goal.achieved.toFixed(1)} / ${goal.target}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar ${goal.percentage >= 100 ? 'bg-success' : ''}" 
                         role="progressbar" 
                         style="width: ${goal.percentage}%" 
                         aria-valuenow="${goal.percentage}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${goal.percentage.toFixed(0)}%
                    </div>
                </div>
            </div>
        `);
    });
}

// Populate category filter dropdown
function populateCategoryFilter() {
    // Get all events
    const allEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    
    // Extract unique categories
    const categories = ['all'];
    allEvents.forEach(event => {
        const category = event.category || 'Uncategorized';
        if (!categories.includes(category)) {
            categories.push(category);
        }
    });
    
    // Populate the dropdown
    const categoryFilter = $('#category-filter');
    categoryFilter.empty();
    
    categories.forEach(category => {
        const displayName = category === 'all' ? 'All Categories' : category;
        categoryFilter.append(`<option value="${category}">${displayName}</option>`);
    });
}