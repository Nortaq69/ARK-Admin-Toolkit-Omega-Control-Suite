// PlayNexus Admin Toolkit - HWID Security System
const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const path = require('path');

class HWIDManager {
    constructor() {
        this.hwidFile = path.join(__dirname, '../../data/config/hwid.dat');
        this.encryptionKey = 'PlayNexus_Omega_2024_Secure';
        this.hwid = null;
        this.isValid = false;
    }

    // Generate unique hardware ID
    generateHWID() {
        try {
            const components = [
                os.hostname(),
                os.platform(),
                os.arch(),
                os.cpus()[0].model,
                os.totalmem().toString(),
                os.networkInterfaces() ? Object.keys(os.networkInterfaces()).join('') : '',
                process.env.PROCESSOR_IDENTIFIER || '',
                process.env.NUMBER_OF_PROCESSORS || ''
            ];

            const hwidString = components.join('|');
            const hwidHash = crypto.createHash('sha256').update(hwidString).digest('hex');
            
            console.log('🔐 HWID generated successfully');
            return hwidHash;
        } catch (error) {
            console.error('❌ Error generating HWID:', error);
            return null;
        }
    }

    // Encrypt data
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

    // Decrypt data
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

    // Save HWID to file
    saveHWID(hwid) {
        try {
            const data = {
                hwid: hwid,
                timestamp: Date.now(),
                version: '1.0.0'
            };

            const encrypted = this.encrypt(data);
            if (!encrypted) return false;

            // Ensure directory exists
            const dir = path.dirname(this.hwidFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(this.hwidFile, encrypted);
            console.log('✅ HWID saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving HWID:', error);
            return false;
        }
    }

    // Load and validate HWID
    loadHWID() {
        try {
            if (!fs.existsSync(this.hwidFile)) {
                console.log('📝 No existing HWID found, generating new one...');
                return this.createNewHWID();
            }

            const encryptedData = fs.readFileSync(this.hwidFile, 'utf8');
            const data = this.decrypt(encryptedData);
            
            if (!data || !data.hwid) {
                console.log('⚠️ Invalid HWID file, generating new one...');
                return this.createNewHWID();
            }

            const currentHWID = this.generateHWID();
            if (currentHWID === data.hwid) {
                this.hwid = data.hwid;
                this.isValid = true;
                console.log('✅ HWID validation successful');
                return true;
            } else {
                console.log('❌ HWID mismatch - possible unauthorized device');
                this.isValid = false;
                return false;
            }
        } catch (error) {
            console.error('❌ Error loading HWID:', error);
            return this.createNewHWID();
        }
    }

    // Create new HWID for first run
    createNewHWID() {
        const newHWID = this.generateHWID();
        if (newHWID && this.saveHWID(newHWID)) {
            this.hwid = newHWID;
            this.isValid = true;
            console.log('✅ New HWID created and saved');
            return true;
        }
        return false;
    }

    // Get current HWID
    getHWID() {
        return this.hwid;
    }

    // Check if HWID is valid
    isValidHWID() {
        return this.isValid;
    }

    // Initialize HWID system
    async init() {
        console.log('🔐 Initializing HWID security system...');
        return this.loadHWID();
    }
}

module.exports = HWIDManager; 