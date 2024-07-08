document.addEventListener('DOMContentLoaded', function () {
    fetchReportsData();
});

function fetchReportsData() {
    fetch('get_transactions.php')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched transactions:', data);
            const expensesData = getCategoryData(data, 'expense');
            const incomeData = getCategoryData(data, 'income');
            displayChart('expenses-chart', 'Expenses by Category', expensesData);
            displayChart('income-chart', 'Income by Category', incomeData);
        })
        .catch(error => {
            console.error('Error fetching reports data:', error);
        });
}

function getCategoryData(transactions, type) {
    const categoryData = {};
    transactions.forEach(transaction => {
        if (transaction.type === type) {
            const category = transaction.category || 'Other';
            if (!categoryData[category]) {
                categoryData[category] = 0;
            }
            categoryData[category] += parseFloat(transaction.amount);
        }
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    return {
        labels: labels,
        data: data
    };
}

function displayChart(chartId, chartTitle, chartData) {
    const ctx = document.getElementById(chartId).getContext('2d');

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: chartTitle,
                data: chartData.data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: chartTitle
                }
            }
        }
    });
}
