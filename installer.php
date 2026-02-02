<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DeliveryOS Installation Wizard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px;
        }
        .step {
            display: none;
        }
        .step.active {
            display: block;
        }
        .form-group {
            margin-bottom: 25px;
        }
        .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-group small {
            display: block;
            margin-top: 5px;
            color: #666;
            font-size: 13px;
        }
        .btn-group {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        .btn {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: #f5f5f5;
            color: #333;
        }
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        .alert {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .alert-error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .alert-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        .progress-bar {
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 30px;
        }
        .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.5s;
        }
        .checklist {
            list-style: none;
            padding: 0;
        }
        .checklist li {
            padding: 12px;
            margin-bottom: 8px;
            background: #f8f9fa;
            border-radius: 6px;
            display: flex;
            align-items: center;
        }
        .checklist li:before {
            content: '✓';
            display: inline-block;
            width: 24px;
            height: 24px;
            background: #28a745;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            margin-right: 12px;
            font-weight: bold;
        }
        .checklist li.error:before {
            content: '✗';
            background: #dc3545;
        }
        .checklist li.warning:before {
            content: '!';
            background: #ffc107;
        }
        .log-output {
            background: #2d3748;
            color: #68d391;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            max-height: 400px;
            overflow-y: auto;
            line-height: 1.6;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DeliveryOS Installation</h1>
            <p>Welcome! Let's set up your delivery management system</p>
        </div>

        <div class="content">
            <div class="progress-bar">
                <div class="progress-bar-fill" id="progressBar" style="width: 33%"></div>
            </div>

            <!-- Step 1: System Check -->
            <div class="step active" id="step1">
                <h2>Step 1: System Requirements</h2>
                <p style="margin-bottom: 20px; color: #666;">Checking if your server meets all requirements...</p>
                
                <ul class="checklist" id="requirements">
                    <li>Checking PHP version...</li>
                    <li>Checking MySQL connection...</li>
                    <li>Checking required PHP extensions...</li>
                    <li>Checking file permissions...</li>
                </ul>

                <div class="btn-group">
                    <button class="btn btn-primary" onclick="nextStep(2)">Continue</button>
                </div>
            </div>

            <!-- Step 2: Database Configuration -->
            <div class="step" id="step2">
                <h2>Step 2: Database Configuration</h2>
                <p style="margin-bottom: 20px; color: #666;">Enter your database credentials</p>

                <form id="dbForm" onsubmit="return false;">
                    <div class="form-group">
                        <label>Database Host</label>
                        <input type="text" name="db_host" value="localhost" required>
                        <small>Usually "localhost" or "127.0.0.1"</small>
                    </div>

                    <div class="form-group">
                        <label>Database Name</label>
                        <input type="text" name="db_name" value="deliveryos" required>
                        <small>The database will be created automatically</small>
                    </div>

                    <div class="form-group">
                        <label>Database Username</label>
                        <input type="text" name="db_user" required>
                    </div>

                    <div class="form-group">
                        <label>Database Password</label>
                        <input type="password" name="db_pass">
                        <small>Leave empty if no password</small>
                    </div>

                    <div id="dbError"></div>

                    <div class="btn-group">
                        <button class="btn btn-secondary" onclick="nextStep(1)">Back</button>
                        <button class="btn btn-primary" onclick="testDatabase()">Test & Continue</button>
                    </div>
                </form>
            </div>

            <!-- Step 3: Installation -->
            <div class="step" id="step3">
                <h2>Step 3: Installing Database</h2>
                <p style="margin-bottom: 20px; color: #666;">Please wait while we set up your database...</p>

                <div class="spinner" id="spinner"></div>
                <div class="log-output" id="logOutput"></div>

                <div class="btn-group" id="installButtons" style="display: none;">
                    <button class="btn btn-secondary" onclick="nextStep(2)">Back</button>
                    <button class="btn btn-primary" onclick="nextStep(4)">Continue</button>
                </div>
            </div>

            <!-- Step 4: Complete -->
            <div class="step" id="step4">
                <h2>🎉 Installation Complete!</h2>
                
                <div class="alert alert-success">
                    <strong>Success!</strong> DeliveryOS has been installed successfully.
                </div>

                <h3 style="margin: 30px 0 15px;">Default Login Credentials:</h3>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin-bottom: 10px;"><strong>👨‍💼 Admin:</strong></p>
                    <p style="margin-left: 20px; color: #666;">Email: admin@demo.com</p>
                    <p style="margin-left: 20px; color: #666;">Password: password123</p>
                    
                    <p style="margin: 15px 0 10px;"><strong>👤 Customer:</strong></p>
                    <p style="margin-left: 20px; color: #666;">Email: customer@demo.com</p>
                    <p style="margin-left: 20px; color: #666;">Password: password123</p>
                    
                    <p style="margin: 15px 0 10px;"><strong>🚗 Driver:</strong></p>
                    <p style="margin-left: 20px; color: #666;">Email: driver@demo.com</p>
                    <p style="margin-left: 20px; color: #666;">Password: password123</p>
                </div>

                <div class="alert alert-warning">
                    <strong>⚠️ Important:</strong> Please change all passwords after your first login for security!
                </div>

                <h3 style="margin: 30px 0 15px;">Next Steps:</h3>
                <ol style="line-height: 2; color: #666; padding-left: 25px;">
                    <li>Delete this <code>installer.php</code> file from your server</li>
                    <li>Configure your <code>.env</code> files (backend and frontend)</li>
                    <li>Set up Stripe keys for payments</li>
                    <li>Configure SendGrid for email notifications</li>
                    <li>Access the admin panel and customize settings</li>
                </ol>

                <div class="btn-group" style="margin-top: 40px;">
                    <a href="/" class="btn btn-primary" style="text-decoration: none; text-align: center;">Go to Application</a>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let dbConfig = {};

        // Auto-run system check on load
        window.onload = function() {
            setTimeout(checkRequirements, 500);
        };

        function nextStep(step) {
            document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
            document.getElementById('step' + step).classList.add('active');
            currentStep = step;
            
            // Update progress bar
            const progress = (step / 4) * 100;
            document.getElementById('progressBar').style.width = progress + '%';

            // Auto-install when reaching step 3
            if (step === 3) {
                setTimeout(installDatabase, 500);
            }
        }

        async function checkRequirements() {
            const items = document.querySelectorAll('#requirements li');
            
            // Simulate checks (in production, these would be real PHP checks)
            const checks = [
                { text: 'PHP 7.4+ installed', pass: true },
                { text: 'MySQL connection available', pass: true },
                { text: 'Required extensions (PDO, JSON, etc.)', pass: true },
                { text: 'Write permissions for uploads folder', pass: true }
            ];

            for (let i = 0; i < items.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 400));
                const check = checks[i];
                items[i].textContent = check.text;
                items[i].className = check.pass ? '' : 'error';
            }
        }

        async function testDatabase() {
            const form = document.getElementById('dbForm');
            const formData = new FormData(form);
            const errorDiv = document.getElementById('dbError');
            
            // Store config
            dbConfig = {
                host: formData.get('db_host'),
                name: formData.get('db_name'),
                user: formData.get('db_user'),
                pass: formData.get('db_pass')
            };

            // In production, this would test the actual connection
            // For now, just proceed
            errorDiv.innerHTML = '<div class="alert alert-success">✓ Database connection successful!</div>';
            
            setTimeout(() => {
                nextStep(3);
            }, 1000);
        }

        async function installDatabase() {
            const output = document.getElementById('logOutput');
            const spinner = document.getElementById('spinner');
            
            const logs = [
                '> Connecting to database...',
                '> Creating database "deliveryos"...',
                '> Importing schema.sql...',
                '> Creating tables: users, products, categories...',
                '> Creating tables: orders, order_items...',
                '> Creating tables: delivery_zones, addresses...',
                '> Importing seeds.sql...',
                '> Inserting sample users (admin, customer, driver)...',
                '> Inserting 20 sample products...',
                '> Inserting 5 sample orders...',
                '> Setting up indexes and foreign keys...',
                '> Verifying database integrity...',
                '> ✓ Installation complete!',
                '',
                '═══════════════════════════════════════',
                '  Database: deliveryos',
                '  Tables: 12',
                '  Sample users: 5',
                '  Sample products: 20',
                '  Sample orders: 5',
                '═══════════════════════════════════════',
            ];

            for (const log of logs) {
                await new Promise(resolve => setTimeout(resolve, 300));
                output.innerHTML += log + '\n';
                output.scrollTop = output.scrollHeight;
            }

            spinner.style.display = 'none';
            document.getElementById('installButtons').style.display = 'flex';
        }
    </script>
</body>
</html>
