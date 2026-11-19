
const API = '/api';

const readCart = () => {
    try {
        const items = JSON.parse(localStorage.getItem('myr_cart') || '[]');

        return items.map(item => ({
            ...item,
            quantity: Math.max(1, Number(item.quantity) || 1),
            width: item.width ?? '',
            height: item.height ?? ''
        }));

    } catch {
        return [];
    }
};

let cart = readCart();

function saveCart() {
    localStorage.setItem('myr_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const el = document.querySelector('#cartCount');

    if (el) {
        el.textContent = cart.reduce(
            (n, item) => n + (Number(item.quantity) || 1),
            0
        );
    }
}

function money(value) {
    return `${Number(value || 0).toLocaleString('fr-FR', {
        maximumFractionDigits: 2
    })} DT`;
}

function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

// PRICE CALCULATION
// Price per meter × width × quantity.
// Height is only a measurement for tailoring.

function getItemTotal(item) {
    const price = Number(item.price) || 0;
    const width = Number(item.width) || 0;
    const quantity = Number(item.quantity) || 1;

    if (width <= 0) return 0;

    return price * width * quantity;
}

function getCartTotal() {
    return cart.reduce(
        (total, item) => total + getItemTotal(item),
        0
    );
}

function addToCart(product) {
    const found = cart.find(item => item.id === product.id);

    if (found) {
        found.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            width: '',
            height: ''
        });
    }

    saveCart();
    toast('Ajouté à votre sélection');
}

function toast(message) {
    let el = document.querySelector('.toast');

    if (!el) {
        el = document.createElement('div');
        el.className = 'toast';

        document.body.append(el);

        Object.assign(el.style, {
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            background: '#183b32',
            color: '#fff',
            padding: '15px 22px',
            zIndex: 99,
            fontSize: '12px',
            boxShadow: '0 10px 30px #0002'
        });
    }

    el.textContent = message;
    el.style.opacity = '1';

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        el.style.opacity = '0';
    }, 2400);
}

function setupMenu() {
    const button = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    button?.addEventListener('click', () => {
        nav?.classList.toggle('open');
    });
}

async function request(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.body instanceof FormData
                ? {}
                : { 'Content-Type': 'application/json' }),
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await res.json();
    } catch {}

    if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
    }

    return data;
}

// LOAD PRODUCTS

async function loadProducts() {
    const grid = document.querySelector('#productsContainer');

    if (!grid) return;

    grid.innerHTML = '<p class="empty-state">La collection se prépare…</p>';

    try {
        const result = await request(`${API}/products`);
        const products = result.data || [];

        window.allProducts = products;

        renderProducts(products);

    } catch (error) {
        grid.innerHTML = `
            <p class="empty-state">
                ${escapeHTML(error.message)}
                <br>
                <small>Vérifiez que le serveur et MongoDB sont démarrés.</small>
            </p>
        `;
    }
}

function renderProducts(products) {
    const grid = document.querySelector('#productsContainer');

    if (!grid) return;

    if (!products.length) {
        grid.innerHTML = `
            <p class="empty-state">
                Aucun article pour le moment.
                Revenez bientôt découvrir nos nouveautés.
            </p>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <article class="product-card">

            <div class="product-image">
                <img
                    src="${escapeHTML(product.image || 'assets/images/rideau1.jpg')}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >
                <span class="product-tag">Maison Yazid</span>
            </div>

            <div class="product-info">

                <h3>${escapeHTML(product.name)}</h3>

                <span class="product-price">
                    ${money(product.price)} / m
                </span>

                <p>
                    ${escapeHTML(
                        product.description ||
                        'Une pièce sélectionnée avec soin pour votre intérieur.'
                    )}
                </p>

                <div class="product-actions">
                    <button data-add="${escapeHTML(product._id)}">
                        Ajouter à ma sélection <span>↗</span>
                    </button>
                    <span class="eyebrow">Sur mesure</span>
                </div>

            </div>

        </article>
    `).join('');

    grid.querySelectorAll('[data-add]').forEach(button => {
        button.addEventListener('click', () => {
            const product = products.find(
                item => item._id === button.dataset.add
            );

            if (product) {
                addToCart({
                    id: product._id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image
                });
            }
        });
    });
}

// FILTERS

function setupFilters() {
    const search = document.querySelector('#productSearch');
    const sort = document.querySelector('#productSort');

    const filter = () => {
        let products = [...(window.allProducts || [])];

        const query = (search?.value || '').toLowerCase();

        products = products.filter(product =>
            (product.name + ' ' + (product.description || ''))
                .toLowerCase()
                .includes(query)
        );

        if (sort?.value === 'asc') {
            products.sort((a, b) => a.price - b.price);
        }

        if (sort?.value === 'desc') {
            products.sort((a, b) => b.price - a.price);
        }

        renderProducts(products);
    };

    search?.addEventListener('input', filter);
    sort?.addEventListener('change', filter);
}

// CART TOTALS

function updateCartTotals() {
    const total = getCartTotal();

    const totalElement = document.querySelector('#cartTotal');
    const subtotalElement = document.querySelector('#cartSubtotal');

    if (totalElement) {
        totalElement.textContent = money(total);
    }

    if (subtotalElement) {
        subtotalElement.textContent = money(total);
    }
}

// RENDER CART

function renderCart() {
    const box = document.querySelector('#cartItems');

    if (!box) return;

    cart = readCart();

    if (!cart.length) {
        box.innerHTML = `
            <div class="empty-state">
                <div class="eyebrow">Votre sélection</div>

                <h2 class="serif">
                    Votre panier est encore vide.
                </h2>

                <p>
                    Explorez nos pièces et trouvez celle
                    qui sublimera votre intérieur.
                </p>

                <a class="btn" href="collection.html">
                    Découvrir la collection
                </a>
            </div>
        `;

        updateCartTotals();
        return;
    }

    box.innerHTML = cart.map((product, index) => {
        const width = Number(product.width) || '';
        const height = Number(product.height) || '';

        const configured = Number(width) > 0;

        const itemTotal = getItemTotal(product);

        return `
            <article class="cart-row">

                <img
                    src="${escapeHTML(product.image || 'assets/images/rideau1.jpg')}"
                    alt="${escapeHTML(product.name)}"
                >

                <div class="cart-product-info">

                    <h3>${escapeHTML(product.name)}</h3>

                    <p>
                        ${money(product.price)} / mètre linéaire
                    </p>

                    <div class="cart-quantity">
                        <div class="qty-control">

                            <button
                                data-qty="${index}"
                                data-delta="-1"
                                aria-label="Diminuer la quantité"
                            >−</button>

                            <span>${product.quantity}</span>

                            <button
                                data-qty="${index}"
                                data-delta="1"
                                aria-label="Augmenter la quantité"
                            >+</button>

                        </div>
                    </div>

                    <div class="cart-measurements">

                        <div class="cart-field">

                            <label for="width-${index}">
                                Largeur (m)
                            </label>

                            <input
                                id="width-${index}"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Ex : 3"
                                value="${width}"
                                data-width="${index}"
                            >

                            <small>Largeur souhaitée</small>

                        </div>

                        <div class="cart-field">

                            <label for="height-${index}">
                                Hauteur (m)
                            </label>

                            <input
                                id="height-${index}"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Ex : 2.80"
                                value="${height}"
                                data-height="${index}"
                            >

                            <small>Pour la confection</small>

                        </div>

                    </div>

                    <div class="cart-calculation">

                        ${
                            configured
                            ? `
                                Prix : ${money(product.price)}
                                × ${width} m
                                × ${product.quantity}
                                <br>
                                <strong>
                                    Total : ${money(itemTotal)}
                                </strong>
                            `
                            : `
                                Saisissez la largeur pour calculer le prix.
                            `
                        }

                    </div>

                </div>

                <div class="cart-price">

                    <strong>
                        ${configured ? money(itemTotal) : '—'}
                    </strong>

                    <br>

                    <button
                        class="remove-item"
                        data-remove="${index}"
                    >
                        Retirer
                    </button>

                </div>

            </article>
        `;
    }).join('');

    // QUANTITY BUTTONS

    box.querySelectorAll('[data-qty]').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.qty);
            const delta = Number(button.dataset.delta);

            cart[index].quantity = Math.max(
                1,
                Number(cart[index].quantity) + delta
            );

            saveCart();
            renderCart();
        });
    });

    // WIDTH INPUTS

    box.querySelectorAll('[data-width]').forEach(input => {
        input.addEventListener('input', () => {
            const index = Number(input.dataset.width);

            cart[index].width = input.value;

            saveCart();
            updateCartTotals();

            const calculation = input
                .closest('.cart-row')
                .querySelector('.cart-calculation');

            const price = Number(cart[index].price) || 0;
            const width = Number(input.value) || 0;
            const quantity = Number(cart[index].quantity) || 1;

            const result = price * width * quantity;

            calculation.innerHTML = width > 0
                ? `
                    Prix : ${money(price)} × ${width} m × ${quantity}
                    <br>
                    <strong>Total : ${money(result)}</strong>
                `
                : 'Saisissez la largeur pour calculer le prix.';

            input.closest('.cart-row')
                .querySelector('.cart-price strong')
                .textContent = width > 0 ? money(result) : '—';
        });
    });

    // HEIGHT INPUTS

    box.querySelectorAll('[data-height]').forEach(input => {
        input.addEventListener('input', () => {
            const index = Number(input.dataset.height);

            cart[index].height = input.value;

            saveCart();
        });
    });

    // REMOVE PRODUCTS

    box.querySelectorAll('[data-remove]').forEach(button => {
        button.addEventListener('click', () => {
            cart.splice(Number(button.dataset.remove), 1);

            saveCart();
            renderCart();

            toast('Article retiré de votre sélection');
        });
    });

    updateCartTotals();
}

// PREPARE QUOTE

function setupQuoteLink() {
    const link = document.querySelector('#quoteLink');

    if (!link) return;

    link.addEventListener('click', event => {
        cart = readCart();

        if (!cart.length) {
            event.preventDefault();
            toast('Votre sélection est vide');
            return;
        }

        const invalid = cart.some(item =>
            Number(item.width) <= 0 ||
            Number(item.height) <= 0
        );

        if (invalid) {
            event.preventDefault();

            toast('Veuillez renseigner la largeur et la hauteur de chaque rideau');

            const firstInvalid = cart.findIndex(item =>
                Number(item.width) <= 0 ||
                Number(item.height) <= 0
            );

            const field = document.querySelector(
                `#width-${firstInvalid}`
            );

            field?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            field?.focus();

            return;
        }

        const quoteLines = cart.map((item, index) => {
            const total = getItemTotal(item);

            return [
                `Article ${index + 1} : ${item.name}`,
                `Prix au mètre : ${money(item.price)}`,
                `Quantité : ${item.quantity}`,
                `Largeur : ${item.width} m`,
                `Hauteur : ${item.height} m`,
                `Total estimatif : ${money(total)}`
            ].join('\n');
        });

        const quoteText = [
            'DEMANDE DE DEVIS - MAISON YAZID',
            '',
            ...quoteLines,
            '',
            `TOTAL ESTIMATIF : ${money(getCartTotal())}`,
            '',
            'Les prix sont calculés selon la largeur uniquement.'
        ].join('\n');

        localStorage.setItem('myr_quote_details', quoteText);
    });
}

// CONTACT FORM

async function setupContact() {
    const form = document.querySelector('#contactForm');

    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const button = form.querySelector('button[type=submit]');
        const note = form.querySelector('.notice');

        button.disabled = true;
        button.textContent = 'Envoi en cours…';

        try {
            const name = form.querySelector('[name=name]').value;
            const email = form.querySelector('[name=email]').value;

            let message = form.querySelector('[name=message]').value;

            const quote = localStorage.getItem('myr_quote_details');

            if (quote) {
                message += '\n\n' + quote;
            }

            await request(`${API}/contact`, {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            if (quote) {
                localStorage.removeItem('myr_quote_details');
            }

            note.textContent =
                'Votre message a bien été envoyé. Notre équipe vous répondra dès que possible.';

            note.className = 'notice success';

            form.reset();

        } catch (error) {
            note.textContent = error.message;
            note.className = 'notice error';

        } finally {
            button.disabled = false;
            button.textContent = 'Envoyer le message';
        }
    });
}

// INITIALIZATION

document.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    updateCartCount();
    loadProducts();
    setupFilters();
    renderCart();
    setupQuoteLink();
    setupContact();
});
