// PlayNexus Admin Toolkit - Anti-Tamper Security System
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class AntiTamper {
    constructor() {
        this.integrityFile = path.join(__dirname, '../../data/config/integrity.dat');
        this.encryptionKey = 'PlayNexus_Integrity_2024_Secure';
        this.fileHashes = new Map();
        this.isValid = false;
    }

    // Generate hash for a file
    generateFileHash(filePath) {
        try {
            if (!fs.existsSync(filePath)) return null;
            const content = fs.readFileSync(filePath);
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (error) {
            console.error(`❌ Error generating hash for ${filePath}:`, error);
            return null;
        }
    }

    // Generate integrity hashes for critical files
    generateIntegrityHashes() {
        const criticalFiles = [
            'main.js',
            'index.html',
            'assets/js/main.js',
            'assets/js/components.js',
            'assets/js/data.js',
            'assets/css/main.css',
            'assets/css/components.css',
            'package.json'
        ];

        const hashes = {};
        criticalFiles.forEach(file => {
            const filePath = path.join(__dirname, '../../', file);
            const hash = this.generateFileHash(filePath);
            if (hash) {
                hashes[file] = hash;
                this.fileHashes.set(file, hash);
            }
        });

        return hashes;
    }

    // Encrypt integrity data
    encrypt(data) {
        try {
            const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
            let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        } catch (error) {
            console.error('❌ Encryption error:', error);
            return null;
        }
    }

    // Decrypt integrity data
    decrypt(encryptedData) {
        try {
            const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('❌ Decryption error:', error);
            return null;
        }
    }

    // Save integrity hashes
    saveIntegrityHashes() {
        try {
            const hashes = this.generateIntegrityHashes();
            const data = {
                hashes: hashes,
                timestamp: Date.now(),
                version: '1.0.0'
            };

            const encrypted = this.encrypt(data);
            if (!encrypted) return false;

            // Ensure directory exists
            const dir = path.dirname(this.integrityFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(this.integrityFile, encrypted);
            console.log('✅ Integrity hashes saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving integrity hashes:', error);
            return false;
        }
    }

    // Verify file integrity
    verifyIntegrity() {
        try {
            if (!fs.existsSync(this.integrityFile)) {
                console.log('📝 No integrity file found, creating new one...');
                return this.saveIntegrityHashes();
            }

            const encryptedData = fs.readFileSync(this.integrityFile, 'utf8');
            const data = this.decrypt(encryptedData);
            
            if (!data || !data.hashes) {
                console.log('⚠️ Invalid integrity file, creating new one...');
                return this.saveIntegrityHashes();
            }

            const currentHashes = this.generateIntegrityHashes();
            let isValid = true;

            for (const [file, expectedHash] of Object.entries(data.hashes)) {
                const currentHash = currentHashes[file];
                if (currentHash !== expectedHash) {
                    console.error(`❌ Integrity check failed for ${file}`);
                    console.error(`Expected: ${expectedHash}`);
                    console.error(`Current:  ${currentHash}`);
                    isValid = false;
                }
            }

            this.isValid = isValid;
            if (isValid) {
                console.log('✅ File integrity verification successful');
            } else {
                console.log('❌ File integrity verification failed - possible tampering detected');
            }

            return isValid;
        } catch (error) {
            console.error('❌ Error verifying integrity:', error);
            return false;
        }
    }

    // Detect debugger processes
    detectDebugger() {
        return new Promise((resolve) => {
            if (process.platform === 'win32') {
                exec('tasklist /FI "IMAGENAME eq x64dbg.exe" /FO CSV', (error, stdout) => {
                    if (stdout.includes('x64dbg.exe')) {
                        console.log('⚠️ Debugger detected: x64dbg');
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            } else {
                // For other platforms, check for common debuggers
                exec('ps aux | grep -E "(gdb|lldb|x64dbg|ollydbg)"', (error, stdout) => {
                    if (stdout && !stdout.includes('grep')) {
                        console.log('⚠️ Debugger detected');
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            }
        });
    }

    // Check if running in development mode
    isDevelopmentMode() {
        return process.env.NODE_ENV === 'development' || 
               process.argv.includes('--dev') ||
               process.argv.includes('--development');
    }

    // Initialize anti-tamper system
    async init() {
        console.log('🛡️ Initializing anti-tamper security system...');
        
        // Skip integrity checks in development mode
        if (this.isDevelopmentMode()) {
            console.log('🔧 Development mode detected, skipping integrity checks');
            this.isValid = true;
            return true;
        }

        // Check for debugger
        const debuggerDetected = await this.detectDebugger();
        if (debuggerDetected) {
            console.log('❌ Debugger detected - exiting for security');
            process.exit(1);
        }

        // Verify file integrity
        return this.verifyIntegrity();
    }

    // Get integrity status
    isValid() {
        return this.isValid;
    }
}

module.exports = AntiTamper; 