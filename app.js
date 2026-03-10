async function checkout() {
    if (cart.length === 0) return alert("Add items first!");

    const btn = document.querySelector('button[onclick="checkout()"]');
    btn.innerText = "Connecting to Square...";
    btn.disabled = true;

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            body: JSON.stringify({ items: cart })
        });
        
        const data = await response.json();
        
        if (data.url) {
            window.location.href = data.url; // Redirects to the secure Square page
        } else {
            throw new Error("No URL returned");
        }
    } catch (err) {
        alert("Checkout error. Please try again.");
        btn.innerText = "Checkout via Square";
        btn.disabled = false;
    }
}
