// google-sync.js

// Using "YOUR_GOOGLE_CLIENT_ID" as placeholder. Replace before production.
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
let tokenClient;

function initGoogleSync() {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        console.error('Google Identity Services library not loaded.');
        return;
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                console.log('Access token retrieved successfully.');
                uploadBackupToDrive(tokenResponse.access_token);
            }
        },
    });
}

function authAndSync() {
    if (!tokenClient) {
        initGoogleSync();
    }
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        alert('مكتبة Google غير متوفرة. الرجاء التحقق من الاتصال بالإنترنت.');
    }
}

function buildDatabase() {
    const backupData = {
        orders_v2: JSON.parse(localStorage.getItem('orders_v2')) || [],
        shipments: JSON.parse(localStorage.getItem('shipments')) || [],
        suppliers: JSON.parse(localStorage.getItem('suppliers')) || [],
        products: JSON.parse(localStorage.getItem('products')) || [],
        inventory_transactions: JSON.parse(localStorage.getItem('inventory_transactions')) || [],
        vehicles: JSON.parse(localStorage.getItem('vehicles')) || [],
        timestamp: new Date().toISOString()
    };
    return backupData;
}

async function uploadBackupToDrive(accessToken) {
    const backupData = buildDatabase();
    const fileContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    
    const metadata = {
        name: `backup_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: form
        });

        if (response.ok) {
            alert('تمت المزامنة وحفظ النسخة الاحتياطية في Google Drive بنجاح!');
        } else {
            console.error('Failed to upload file to Google Drive', await response.text());
            alert('فشل في حفظ النسخة الاحتياطية سحابياً.');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('حدث خطأ أثناء المزامنة مع Google Drive.');
    }
}

// Ensure initGoogleSync runs when the script loads or window loads
window.addEventListener('load', () => {
    // Small delay to ensure GIS library is fully loaded from the async tag
    setTimeout(initGoogleSync, 1000);
});

// Export functions if using modules, but since we are sticking to global scope in typical setups here:
window.initGoogleSync = initGoogleSync;
window.authAndSync = authAndSync;
window.uploadBackupToDrive = uploadBackupToDrive;
window.buildDatabase = buildDatabase;
