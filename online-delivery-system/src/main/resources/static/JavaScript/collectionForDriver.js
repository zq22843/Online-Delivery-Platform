let isLoading = false;
let currentPage = 0;
let driverId = null;

async function fetchOrders(page = 0, size = 10) {
    try {
        const response = await fetch(`/orders?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching order data:', error);
    }
}

async function fetchBasketsByOrder(orderId) {
    try {
        const response = await fetch(`/baskets/orders/${orderId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const baskets = await response.json();

        // Fetch basket items for each basket
        for (const basket of baskets) {
            const basketItemsResponse = await fetch(`/basketItems/baskets/${basket.id}`);
            if (!basketItemsResponse.ok) {
                throw new Error(`HTTP error! status: ${basketItemsResponse.status}`);
            }
            const basketItems = await basketItemsResponse.json();
            basket.basketItems = basketItems; // Assign fetched basketItems to basket object
        }

        return baskets;
    } catch (error) {
        console.error('Error fetching baskets:', error);
        return null;
    }
}

async function fetchVendorAddress(vendorEmail) {
    try {
        const response = await fetch(`/vendorAddresses/vendor/${vendorEmail}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching vendor address:', error);
        return null;
    }
}

async function populateOrders(ordersData) {
    const gridContainer = document.querySelector('.grid-container');

    if (ordersData && ordersData.content) {
        for (const order of ordersData.content) {
            if (order.status === driverId) {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';

            // Get user address details from the order
            const userAddress = order.userAddress ? `Street: ${order.userAddress.street}, Postcode: ${order.userAddress.postCode}` : 'N/A';

            const orderInfo = document.createElement('div');
            orderInfo.textContent = `Order ID: ${order.id}, User Address: ${userAddress}`;
            orderItem.appendChild(orderInfo);

            gridContainer.appendChild(orderItem);

                // Fetch baskets associated with the order
                const baskets = await fetchBasketsByOrder(order.id);
                if (baskets && baskets.length > 0) {
                    const basketList = document.createElement('ul');
                    basketList.className = 'basket-list';
                    for (const basket of baskets) {
                        const basketItems = basket.basketItems;
                        for (const basketItem of basketItems) {
                            const menuItem = basketItem.menuItem;
                            const vendor = menuItem.vendor;
                            const vendorAddress = await fetchVendorAddress(vendor.email);
                            const vendorAddressDetails = vendorAddress ? `Vendor Street: ${vendorAddress.street}, Vendor Postcode: ${vendorAddress.postCode}` : 'N/A';
                            const basketItemInfo = document.createElement('li');
                            basketItemInfo.textContent = `Vendor: ${vendor.name}, Vendor Address: ${vendorAddressDetails}`;
                            basketList.appendChild(basketItemInfo);
                        }
                    }
                    orderItem.appendChild(basketList);
                }
                // Additional functionality to confirm collection
                const confirmButton = document.createElement('button');
                confirmButton.textContent = 'Confirm Delivered';
                confirmButton.addEventListener('click', async () => {
                    const confirmation = confirm("Are you sure you have delivered this order?");
                    if (confirmation) {
                        order.status = 'DELETED';
                        try {
                            const response = await fetch(`/orders/${order.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(order)
                            });
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            const responseData = await response.json();
                            const orderInfoElement = document.getElementById(`order-${order.id}-info`);
                            if (orderInfoElement) {
                                orderInfoElement.textContent = `Status: ${order.status}`;
                            }
                        } catch (error) {
                            console.error('Error updating order status:', error);
                        }
                    }

                });
                orderItem.appendChild(confirmButton);
            }
        }
    }
}


// Function to load more orders
async function loadMore() {
    if (isLoading) return;
    isLoading = true;
    const driverIdElement = document.getElementById('driverId');
    driverId = driverIdElement.value;
    const orders = await fetchOrders(currentPage, 60);
    if (orders && orders.content.length > 0) {
        await populateOrders(orders);
        currentPage++;
    }
    isLoading = false;
}

// Load initial set of orders when the window loads
window.onload = async () => {
    await loadMore();
};

// Load more orders when scrolling near the bottom of the page
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
        loadMore();
    }
});

