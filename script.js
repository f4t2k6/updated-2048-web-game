const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

function registerUser(event) {
    event.preventDefault(); // Ngăn chặn form gửi đi

    // Lấy thông tin từ form
    const name = document.getElementById('sign-up-name').value;
    const email = document.getElementById('sign-up-email').value;
    const password = document.getElementById('sign-up-password').value;

    // Kiểm tra xem người dùng đã đăng ký chưa
    const existingUser = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = existingUser.find(user => user.email === email);

    if (userExists) {
        alert('Email already registered. Please sign in.');
    } else {
        // Lưu thông tin người dùng vào localStorage
        existingUser.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(existingUser));
        localStorage.setItem(`${name}_highScore`, 0); // Khởi tạo điểm số cao nhất cho tài khoản mới
        alert('Registration successful! You can now sign in.');
    }
}

function loginUser(event) {
    event.preventDefault(); // Ngăn chặn form gửi đi

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({ name: user.name }));

        // Khôi phục điểm số cao nhất cho tài khoản này
        highScore = localStorage.getItem(`${user.name}_highScore`) ? parseInt(localStorage.getItem(`${user.name}_highScore`)) : 0;

        alert(`Welcome back, ${user.name}!`);
        window.location.href = 'game.html'; // Thay đổi đường dẫn theo trang chính của bạn
    } else {
        alert('Invalid email or password. Please try again.');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const resetModal = document.getElementById('resetModal');
    const closeModal = document.getElementById('closeModal');
    const forgetPasswordBtn = document.getElementById('forget-password');

    forgetPasswordBtn.addEventListener('click', () => {
        console.log('Button clicked!');  // Thêm log để kiểm tra
        resetModal.style.display = "block"; // Hiện modal
    });

    closeModal.addEventListener('click', () => {
        resetModal.style.display = "none"; // Đóng modal
    });

    window.onclick = function(event) {
        if (event.target == resetModal) {
            resetModal.style.display = "none"; // Đóng modal khi nhấn ra ngoài
        }
    };

    document.getElementById('resetForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('reset-email').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword === confirmPassword) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(user => user.email === email);

            if (user) {
                user.password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                alert('Password has been reset successfully!');
                resetModal.style.display = "none"; // Đóng modal
            } else {
                alert('Email not found.');
            }
        } else {
            alert('Passwords do not match.');
        }
    });
});