
// ==========================================
// LUMPCIYO - MAIN JAVASCRIPT
// ORDER + QRIS + WHATSAPP + LOGIN + REGISTER
// TANPA ADD-ON
// ==========================================

const LUMPCIYO_WA = "6285122951755";

const MENU_PRICES = {
    "Original Lumpia Chicken Mayo": 10000,
    "Only Chicken Mayo": 10000,
    "Only Sosis Mayo": 10000
};

const STORAGE_KEY = "lumpciyoUsers";
const SESSION_KEY = "lumpciyoUser";

let currentMenu = "";
let currentPackSize = 0;
let currentUnitPrice = 10000;
let authMode = "login";

// ==========================================
// FORMAT RUPIAH
// ==========================================

function rupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

// ==========================================
// LOGIN CHECK
// ==========================================

function getLoggedInUser() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

// ==========================================
// ORDER SYSTEM
// ==========================================

function openOrder(menuName, packSize) {
    const user = getLoggedInUser();

    if (!user) {
        alert("Silakan login terlebih dahulu untuk memesan!");
        openAuth("login");
        return;
    }

    currentMenu = menuName;
    currentPackSize = Number(packSize) || 0;
    currentUnitPrice = MENU_PRICES[menuName] || 10000;

    document.getElementById("selectedMenu").value =
        `${menuName} (isi ${currentPackSize} pcs)`;

    document.getElementById("quantity").value = 1;

    document.getElementById("orderStep").style.display = "block";
    document.getElementById("paymentStep").style.display = "none";

    const modal = document.getElementById("orderModal");

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    updateOrderTotal();
}

// ==========================================
// CLOSE ORDER
// ==========================================

function closeOrder() {
    const modal = document.getElementById("orderModal");

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
}

// ==========================================
// GET ORDER DATA
// ==========================================

function getOrderData() {
    const quantity = Math.max(
        1,
        parseInt(document.getElementById("quantity").value) || 1
    );

    const total = currentUnitPrice * quantity;

    return {
        quantity,
        total
    };
}

// ==========================================
// UPDATE TOTAL
// ==========================================

function updateOrderTotal() {
    const total = getOrderData().total;

    document.getElementById("totalPrice").textContent =
        rupiah(total);
}

// ==========================================
// GO TO QRIS
// ==========================================

function goToQris() {
    if (!currentMenu) {
        alert("Silakan pilih menu terlebih dahulu.");
        return;
    }

    const data = getOrderData();

    document.getElementById("paymentTotal").textContent =
        rupiah(data.total);

    document.getElementById("orderStep").style.display = "none";
    document.getElementById("paymentStep").style.display = "block";
}

// ==========================================
// BACK TO ORDER
// ==========================================

function backToOrder() {
    document.getElementById("paymentStep").style.display = "none";
    document.getElementById("orderStep").style.display = "block";
}

// ==========================================
// CONFIRM ORDER TO WHATSAPP
// ==========================================

function confirmOrder() {
    const data = getOrderData();
    const user = getLoggedInUser();

    if (!user) {
        alert("Silakan login kembali.");
        closeOrder();
        openAuth("login");
        return;
    }

    const nama = prompt("Masukkan nama lengkap:");

    if (!nama || !nama.trim()) {
        alert("Nama wajib diisi.");
        return;
    }

    const alamat = prompt("Masukkan alamat pengiriman:");

    if (!alamat || !alamat.trim()) {
        alert("Alamat wajib diisi.");
        return;
    }

    const menuText =
        `${currentMenu} (isi ${currentPackSize} pcs)`;

    const message = [
        "Halo Lumpciyo, saya ingin konfirmasi pesanan.",
        "",
        `Nama: ${nama.trim()}`,
        `Alamat: ${alamat.trim()}`,
        "",
        `Menu: ${menuText}`,
        `Jumlah: ${data.quantity} paket`,
        `Total pembayaran: ${rupiah(data.total)}`,
        "Metode pembayaran: QRIS",
        "Status: Saya sudah melakukan pembayaran.",
        "",
        "Saya akan melampirkan bukti pembayaran pada chat ini.",
        "Mohon pesanan dikonfirmasi. Terima kasih."
    ].join("\n");

    const whatsappURL =
        `https://wa.me/${LUMPCIYO_WA}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
}

// ==========================================
// LOGIN & REGISTER SYSTEM
// ==========================================

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

// ==========================================
// AUTH MESSAGE
// ==========================================

function showMessage(message, success = false) {
    const element = document.getElementById("authMessage");

    if (!element) return;

    element.textContent = message;
    element.style.color = success ? "green" : "#d33";
}

// ==========================================
// OPEN AUTH MODAL
// ==========================================

function openAuth(mode) {
    authMode = mode;

    const modal = document.getElementById("authModal");

    modal.style.display = "flex";
    document.getElementById("authMessage").textContent = "";

    const isRegister = mode === "register";

    document.getElementById("authTitle").textContent =
        isRegister ? "Register Akun" : "Login Akun";

    document.getElementById("authDescription").textContent =
        isRegister
            ? "Buat akun baru untuk bergabung dengan Lumpciyo."
            : "Selamat datang kembali di Lumpciyo!";

    const nameInput = document.getElementById("authName");

    nameInput.style.display = isRegister ? "block" : "none";
    nameInput.required = isRegister;

    document.getElementById("authPassword").autocomplete =
        isRegister ? "new-password" : "current-password";

    document.getElementById("authSubmit").textContent =
        isRegister ? "Buat Akun" : "Login";

    document.getElementById("authSwitch").innerHTML =
        isRegister
            ? 'Sudah punya akun? <a href="#" onclick="openAuth(\'login\'); return false;">Login</a>'
            : 'Belum punya akun? <a href="#" onclick="openAuth(\'register\'); return false;">Register</a>';
}

// ==========================================
// CLOSE AUTH
// ==========================================

function closeAuth() {
    document.getElementById("authModal").style.display = "none";
    document.getElementById("authForm").reset();
    showMessage("");
}

// ==========================================
// PASSWORD HASH
// ==========================================

async function hashPassword(password) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Gunakan HTTPS atau localhost.");
    }

    const data = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// ==========================================
// LOGIN / REGISTER SUBMIT
// ==========================================

document.getElementById("authForm").addEventListener(
    "submit",
    async function(event) {
        event.preventDefault();

        const name = document.getElementById("authName").value.trim();

        const email = document.getElementById("authEmail").value
            .trim()
            .toLowerCase();

        const password = document.getElementById("authPassword").value;

        const users = getUsers();

        if (password.length < 8) {
            showMessage("Password minimal 8 karakter!");
            return;
        }

        if (authMode === "register" && !name) {
            showMessage("Nama lengkap wajib diisi!");
            return;
        }

        try {
            const passwordHash = await hashPassword(password);

            // REGISTER
            if (authMode === "register") {
                const exists = users.some(
                    user => user.email === email
                );

                if (exists) {
                    showMessage("Email sudah terdaftar!");
                    return;
                }

                users.push({
                    name: name,
                    email: email,
                    password: passwordHash
                });

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(users)
                );

                showMessage(
                    "Registrasi berhasil! Silakan login.",
                    true
                );

                setTimeout(() => {
                    openAuth("login");
                    document.getElementById("authEmail").value = email;
                }, 1000);
            }

            // LOGIN
            else {
                const user = users.find(
                    user =>
                        user.email === email &&
                        user.password === passwordHash
                );

                if (!user) {
                    showMessage("Email atau password salah!");
                    return;
                }

                sessionStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify({
                        name: user.name,
                        email: user.email
                    })
                );

                closeAuth();
                updateAuthDisplay();

                alert("Login berhasil! Selamat datang, " + user.name);
            }

        } catch(error) {
            showMessage(error.message || "Terjadi kesalahan.");
        }
    }
);

// ==========================================
// NAVBAR LOGIN / REGISTER
// ==========================================

function addAuthNavbar() {
    const nav = document.querySelector(".nav-container");

    if (!nav || document.getElementById("authButtons")) return;

    const auth = document.createElement("div");

    auth.className = "auth-nav";
    auth.id = "authButtons";

    auth.innerHTML = `
        <button class="auth-login" onclick="openAuth('login')">
            Login
        </button>

        <button class="auth-register" onclick="openAuth('register')">
            Register
        </button>
    `;

    const profile = document.createElement("div");

    profile.id = "authProfile";

    profile.innerHTML = `
        <span id="authUserName"></span>

        <button id="authLogout" onclick="logoutUser()">
            Logout
        </button>
    `;

    const orderButton = nav.querySelector(".nav-order");

    if (orderButton) {
        nav.insertBefore(auth, orderButton);
        nav.insertBefore(profile, orderButton);
    } else {
        nav.append(auth, profile);
    }

    updateAuthDisplay();
}

// ==========================================
// UPDATE ACCOUNT DISPLAY
// ==========================================

function updateAuthDisplay() {
    const user = getLoggedInUser();

    const buttons = document.getElementById("authButtons");
    const profile = document.getElementById("authProfile");

    if (buttons) {
        buttons.style.display = user ? "none" : "flex";
    }

    if (profile) {
        profile.style.display = user ? "flex" : "none";
    }

    if (user) {
        document.getElementById("authUserName").textContent =
            "Halo, " + user.name;
    }
}

// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {
    sessionStorage.removeItem(SESSION_KEY);

    updateAuthDisplay();

    alert("Kamu berhasil logout!");
}

// ==========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ==========================================

document.getElementById("orderModal").addEventListener(
    "click",
    function(event) {
        if (event.target === this) {
            closeOrder();
        }
    }
);

document.getElementById("authModal").addEventListener(
    "click",
    function(event) {
        if (event.target === this) {
            closeAuth();
        }
    }
);

// ==========================================
// AUTO UPDATE TOTAL
// ==========================================

const quantityInput = document.getElementById("quantity");

if (quantityInput) {
    quantityInput.addEventListener("input", updateOrderTotal);
    quantityInput.addEventListener("change", updateOrderTotal);
}

// ==========================================
// MOBILE NAVBAR
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function() {
        navMenu.classList.toggle("active");
    });
}

// ==========================================
// FOOTER YEAR
// ==========================================

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// ==========================================
// INITIALIZE
// ==========================================

addAuthNavbar();
updateAuthDisplay();

console.log("Lumpciyo JavaScript berhasil dijalankan!");
