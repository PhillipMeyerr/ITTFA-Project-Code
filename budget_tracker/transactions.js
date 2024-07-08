let transactions = [];

document.addEventListener('DOMContentLoaded', function () {
    fetchTransactions();

    // Event listener for the filter button
    const filterButton = document.getElementById('filter-button');
    if (filterButton) {
        filterButton.addEventListener('click', filterAndSortTransactions);
    }

    // Event listener for search bar
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', searchTransactions);
    }

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-transaction')) {
            const transactionId = e.target.getAttribute('data-id');
            editTransaction(transactionId);
        } else if (e.target.classList.contains('delete-transaction')) {
            const transactionId = e.target.getAttribute('data-id');
            deleteTransaction(transactionId);
        }
    });

    document.getElementById('edit-transaction-form-element').addEventListener('submit', function(e) {
        e.preventDefault();
        updateTransaction();
    });
});

function fetchTransactions() {
    fetch('get_transactions.php')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched transactions:', data);
            transactions = data; // Store the fetched transactions
            displayTransactions(transactions);
        })
        .catch(error => {
            console.error('Error fetching transactions:', error);
        });
}

function displayTransactions(transactions) {
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = '';

    transactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.classList.add('flex', 'justify-between', 'items-center', 'bg-gray-50', 'p-4', 'rounded-lg', 'shadow-md', 'hover:bg-gray-100', 'transition', 'duration-200', 'ease-in-out', 'mb-2');

        const amount = parseFloat(transaction.amount); // Ensure amount is a number

        transactionItem.innerHTML = `
            <div>
                <p class="text-gray-800 font-semibold">${transaction.name}</p>
                <p class="text-gray-500 text-sm">${transaction.category ? transaction.category : 'N/A'} - ${transaction.date} ${transaction.recurring ? '(Monthly)' : ''}</p>
            </div>
            <div class="flex items-center">
                <p class="${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'} font-bold mr-4">${transaction.type === 'income' ? '+' : '-'} R${amount.toFixed(2)}</p>
                <button class="edit-transaction text-blue-500 mr-2" data-id="${transaction.id}">Edit</button>
                <button class="delete-transaction text-red-500" data-id="${transaction.id}">Delete</button>
            </div>
        `;

        transactionsList.appendChild(transactionItem);
    });
}

function filterAndSortTransactions() {
    const category = document.getElementById('filter-category').value;
    const sortBy = document.getElementById('sort-by').value;
    const type = document.getElementById('filter-type').value;

    let filteredTransactions = transactions.filter(transaction => {
        return (category === '' || transaction.category === category) &&
               (type === '' || transaction.type === type);
    });

    switch (sortBy) {
        case 'date-desc':
            filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            filteredTransactions.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            filteredTransactions.sort((a, b) => a.amount - b.amount);
            break;
    }

    displayTransactions(filteredTransactions);
}

function searchTransactions() {
    const query = document.getElementById('search-bar').value.toLowerCase();

    const filteredTransactions = transactions.filter(transaction => {
        return transaction.name.toLowerCase().includes(query) ||
               (transaction.category && transaction.category.toLowerCase().includes(query));
    });

    displayTransactions(filteredTransactions);
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
            transactions = transactions.filter(transaction => transaction.id !== parseInt(transactionId));
            displayTransactions(transactions);
            alert('Transaction deleted successfully');
        } else {
            alert('Failed to delete transaction: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction');
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
