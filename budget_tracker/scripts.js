document.addEventListener('DOMContentLoaded', function() {
    fetchTransactions();

    document.getElementById('show-expense-form').addEventListener('click', function() {
        document.getElementById('expense-form').classList.toggle('hidden');
        document.getElementById('income-form').classList.add('hidden');
        document.getElementById('edit-transaction-form').classList.add('hidden');
    });

    document.getElementById('show-income-form').addEventListener('click', function() {
        document.getElementById('income-form').classList.toggle('hidden');
        document.getElementById('expense-form').classList.add('hidden');
        document.getElementById('edit-transaction-form').classList.add('hidden');
    });

    document.getElementById('new-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitTransaction('new-expense-form', 'expense');
    });

    document.getElementById('new-income-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitTransaction('new-income-form', 'income');
    });

    document.getElementById('edit-transaction-form-element').addEventListener('submit', function(e) {
        e.preventDefault();
        updateTransaction();
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-transaction')) {
            const transactionId = e.target.getAttribute('data-id');
            editTransaction(transactionId);
        } else if (e.target.classList.contains('delete-transaction')) {
            const transactionId = e.target.getAttribute('data-id');
            deleteTransaction(transactionId);
        }
    });
});

function fetchTransactions() {
    fetch('get_transactions.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            const transactionsContainer = document.getElementById('transactions');
            transactionsContainer.innerHTML = '';
            data.forEach(transaction => {
                const transactionElement = document.createElement('div');
                transactionElement.classList.add('flex', 'justify-between', 'items-center', 'mb-4');
                transactionElement.setAttribute('data-id', transaction.id);

                transactionElement.innerHTML = `
                    <div>
                        <p class="text-gray-800">${transaction.name}</p>
                        <p class="text-gray-500 text-sm">${transaction.category ? transaction.category : 'N/A'}${transaction.recurring ? ' (Monthly)' : ''}</p>
                        <p class="text-gray-400 text-xs">${transaction.date}</p>
                    </div>
                    <div class="flex items-center">
                        <p class="${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}">${transaction.type === 'income' ? '+' : '-'} R${Math.abs(transaction.amount)}</p>
                        <button class="edit-transaction text-blue-500 ml-4" data-id="${transaction.id}">Edit</button>
                        <button class="delete-transaction text-red-500 ml-4" data-id="${transaction.id}">Delete</button>
                    </div>
                `;

                transactionsContainer.appendChild(transactionElement);
            });
            updateBalances();
        })
        .catch(error => {
            console.error('Error fetching transactions:', error);
            alert('Failed to load transactions. Please try again later.');
        });
}

function submitTransaction(formId, type) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    formData.append('type', type);

    fetch('add_transaction.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
            fetchTransactions();
            form.reset();
            form.closest('div').classList.add('hidden');
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error submitting transaction:', error);
        alert('Failed to add transaction. Please try again later.');
    });
}

function editTransaction(transactionId) {
    fetch(`get_transaction.php?id=${transactionId}`)
        .then(response => response.json())
        .then(transaction => {
            if (transaction.error) {
                throw new Error(transaction.error);
            }

            document.getElementById('edit-transaction-id').value = transaction.id;
            document.getElementById('edit-transaction-type').value = transaction.type;
            document.getElementById('edit-transaction-name').value = transaction.name;
            document.getElementById('edit-transaction-amount').value = transaction.amount;
            document.getElementById('edit-transaction-recurring').checked = transaction.recurring;

            if (transaction.type === 'expense') {
                document.getElementById('edit-category-container').classList.remove('hidden');
                document.getElementById('edit-transaction-category').value = transaction.category;
            } else {
                document.getElementById('edit-category-container').classList.add('hidden');
            }

            document.getElementById('edit-transaction-form').classList.remove('hidden');
            document.getElementById('expense-form').classList.add('hidden');
            document.getElementById('income-form').classList.add('hidden');
        })
        .catch(error => {
            console.error('Error fetching transaction:', error);
            alert('Failed to fetch transaction details. Please try again later.');
        });
}

function updateTransaction() {
    const form = document.getElementById('edit-transaction-form-element');
    const formData = new FormData(form);

    fetch('update_transaction.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Transaction updated successfully');
            fetchTransactions();
            form.reset();
            document.getElementById('edit-transaction-form').classList.add('hidden');
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error updating transaction:', error);
        alert('Failed to update transaction. Please try again later.');
    });
}

function deleteTransaction(transactionId) {
    const formData = new FormData();
    formData.append('transaction_id', transactionId);

    fetch('delete_transaction.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchTransactions();
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again later.');
    });
}

function updateBalances() {
    fetch('get_transactions.php')
        .then(response => response.json())
        .then(transactions => {
            let totalBalance = 0;
            let income = 0;
            let expenses = 0;

            transactions.forEach(transaction => {
                if (transaction.type === 'income') {
                    income += parseFloat(transaction.amount);
                    totalBalance += parseFloat(transaction.amount);
                } else {
                    expenses += parseFloat(transaction.amount);
                    totalBalance -= parseFloat(transaction.amount);
                }
            });

            document.getElementById('total-balance').innerText = `R${totalBalance.toFixed(2)}`;
            document.getElementById('income').innerText = `R${income.toFixed(2)}`;
            document.getElementById('expenses').innerText = `R${expenses.toFixed(2)}`;
            document.getElementById('budget-remaining').innerText = `R${(income - expenses).toFixed(2)}`;

            updateProgressBarAndPieChart();
        })
        .catch(error => {
            console.error('Error updating balances:', error);
            alert('Failed to update balances. Please try again later.');
        });
}

function updateProgressBarAndPieChart() {
    const totalBudget = parseFloat(document.getElementById('income').innerText.replace('R', ''));
    const expenses = parseFloat(document.getElementById('expenses').innerText.replace('R', ''));
    const remainingBudget = totalBudget - expenses;

    const budgetPercentage = (remainingBudget / totalBudget) * 100;

    document.getElementById('budget-progress').style.width = `${budgetPercentage}%`;
    document.getElementById('budget-percentage').innerText = `${budgetPercentage.toFixed(2)}%`;

    const ctx = document.getElementById('budgetChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Remaining Budget', 'Expenses'],
            datasets: [{
                data: [remainingBudget, expenses],
                backgroundColor: ['#4caf50', '#f44336'],
                hoverBackgroundColor: ['#66bb6a', '#e57373']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'center',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: R${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });


}
