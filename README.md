<h1 align="center">☕ The Nook Café Loyalty App</h1>

<p align="center">
  A QR-based digital loyalty system for small cafés, built to replace traditional punch cards.
</p>

<p align="center">
  <a href="https://tsyruk.github.io/Nook/" target="_blank"><strong>Live Demo</strong></a>
</p>

<hr>

<h2>Project Overview</h2>

<p>
  The Nook Café Loyalty App is a digital rewards platform designed for small cafés.
  It allows customers to collect stamps, staff to manage rewards at the register,
  and admins to track loyalty activity through a dashboard.
</p>

<p>
  The application supports three user roles:
</p>

<ul>
  <li><strong>Customer</strong> - tracks coffee purchases and rewards</li>
  <li><strong>Staff</strong> - scans QR codes and adds stamps at checkout</li>
  <li><strong>Admin</strong> - monitors analytics and manages customer rewards</li>
</ul>

<p>
  The project demonstrates a complete loyalty workflow with QR scanning, reward tracking,
  role-based dashboards, and Supabase-powered data persistence.
</p>

<hr>

<h2>Demo Credentials</h2>

<p><strong>Staff PIN:</strong> 1234</p>
<p><strong>Admin PIN:</strong> 0000</p>

<hr>

<h2>Screenshots</h2>

<h3>Welcome Screen</h3>
<img width="408" height="722" alt="welcome screen" src="https://github.com/user-attachments/assets/d71659a2-5d46-4daa-ac31-af537d90138a" />


<h3>Customer Rewards Card</h3>
<img width="397" height="711" alt="Customer Rewards Card" src="https://github.com/user-attachments/assets/fccfed73-74f1-4e10-bd82-8ab6a4713b86" />


<h3>Staff Interface</h3>
<p>
  <img width="443" height="727" alt="Staff Interface 1" src="https://github.com/user-attachments/assets/18a2ba26-263e-4c24-bdf5-8c4e9276d2d3" />

  <img width="437" height="726" alt="Staff Interface 2" src="https://github.com/user-attachments/assets/db91e330-91d8-4692-a892-dc84772ca212" />

</p>

<h3>Admin Dashboard</h3>
<p>
  <img width="412" height="720" alt="Admin Dashboard 1" src="https://github.com/user-attachments/assets/d0c8537a-6073-43bd-86f5-0e0503442a29" />
</p>

<hr>

<h2>Features</h2>

<h3>Customer Experience</h3>
<ul>
  <li>Create an account</li>
  <li>Sign in using a phone number</li>
  <li>View a personal QR loyalty card</li>
  <li>Track stamp progress</li>
  <li>See pending free coffee rewards</li>
  <li>View reward expiration dates</li>
  <li>View visit history</li>
  <li>Update account details</li>
</ul>

<h3>Rewards System</h3>
<ul>
  <li><strong>10 stamps = 1 free coffee</strong></li>
  <li><strong>Birthday month = 1 free coffee</strong></li>
  <li>Rewards expire after <strong>90 days</strong></li>
</ul>

<h3>Staff Interface</h3>
<p>Designed for fast use at the register.</p>
<ul>
  <li>Search customers by name or phone</li>
  <li>Scan QR codes</li>
  <li>Add stamps for purchases</li>
  <li>Redeem free coffees</li>
  <li>Grant birthday rewards</li>
  <li>Protected staff login with PIN</li>
</ul>

<h3>Admin Dashboard</h3>
<p>Admins can monitor loyalty activity and manage customer rewards.</p>

<h4>Dashboard Analytics</h4>
<ul>
  <li>Total members</li>
  <li>Total visits</li>
  <li>Coffees redeemed</li>
  <li>Active rewards</li>
  <li>Average stamp progress</li>
</ul>

<h4>Redemption History</h4>
<ul>
  <li>View a log of all redeemed rewards</li>
</ul>

<h4>Customer Management</h4>
<ul>
  <li>View customer profiles</li>
  <li>Add or remove stamps</li>
  <li>Grant free rewards</li>
  <li>View visit history</li>
</ul>

<p>Protected admin login with a separate PIN.</p>

<hr>

<h2>How It Works</h2>

<h3>Customer Flow</h3>

<pre>
Customer creates account
        ↓
Customer receives a QR loyalty card
        ↓
Staff scans QR code or searches by phone
        ↓
Staff adds stamp
        ↓
After 10 stamps, a free coffee reward is created
        ↓
Staff redeems reward when used
</pre>

<h3>Reward Expiration</h3>

<p>Each reward stores:</p>
<ul>
  <li>Earned date</li>
  <li>Expiration date</li>
  <li>Redeemed status</li>
</ul>

<p>Free coffee rewards expire <strong>90 days</strong> after being earned.</p>

<hr>

<h2>Tech Stack</h2>

<h3>Frontend</h3>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>Vanilla JavaScript</li>
</ul>

<h3>Backend / Database</h3>
<ul>
  <li>Supabase</li>
  <li>PostgreSQL</li>
</ul>

<h3>External Libraries</h3>
<ul>
  <li><strong>html5-qrcode</strong> — QR code scanner</li>
  <li><strong>qrcode.js</strong> — QR code generation</li>
  <li><strong>@supabase/supabase-js</strong> — Supabase JavaScript client</li>
</ul>

<hr>

<h2>Project Structure</h2>

<pre>
Nook/
│
├── index.html         # main application
├── README.md          # project documentation
├── screenshots/       # screenshots used in README
└── assets/            # optional project assets
</pre>

<hr>

<h2>Future Improvements</h2>

<ul>
  <li>Supabase Auth for real user authentication</li>
  <li>Stronger staff/admin role security</li>
  <li>SMS verification for customers</li>
  <li>Progressive Web App support</li>
  <li>Multi-location café support</li>
  <li>Improved analytics and reporting</li>
</ul>

<hr>

<h2>License</h2>

<p>This project was created for educational and portfolio purposes.</p>
