const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    try {
        serviceAccount = require('../../serviceAccountKey.json');
    } catch (error) {
        console.error('Firebase Service Account Key not found. Please set FIREBASE_SERVICE_ACCOUNT environment variable.');
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
