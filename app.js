async function checkout() {
    if (cart.length === 0) return alert("Add items first!");
    
    // 1. UI Feedback
    const btn = document.querySelector('button[onclick="checkout()"]');
    const originalText = btn.innerText;
    btn.innerText = "Connecting...";
    btn.disabled = true;

    try {
        // 2. Call your Vercel API
        // Use a relative path so it works on your Vercel domain automatically
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        // 3. Redirect to the Square Link returned by the API
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error("No checkout URL received");
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("Checkout failed. Make sure your Vercel environment variables are set!");
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
