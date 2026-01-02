const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');

// Helper to get file path
const getFilePath = (fileId) => {
    // SECURITY: Ensure we don't break out of the upload directory
    const safeId = path.basename(fileId);
    return path.join(uploadDir, safeId);
};

exports.checkFileInfo = async (req, res) => {
    try {
        const fileId = req.params.id;
        const filePath = getFilePath(fileId);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        const stats = fs.statSync(filePath);

        res.json({
            BaseFileName: fileId,
            OwnerId: 'admin', // Mock owner
            Size: stats.size,
            UserId: 'admin', // Mock user
            UserFriendlyName: 'Admin User',
            UserCanWrite: true,
            UserCanNotWriteRelative: true, // Disable relative paths for now
            // WOPI features
            SupportsUpdate: true,
            SupportsLocks: false, // Simple implementation without locking for now
        });
    } catch (error) {
        console.error('WOPI CheckFileInfo Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const filePath = getFilePath(fileId);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }

        // Stream the file
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (error) {
        console.error('WOPI GetFile Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.putFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const filePath = getFilePath(fileId);

        // We receive the raw file data in the body
        // Note: Express body-parser might mess this up if configured to parse JSON globally without exceptions.
        // We typically need 'app.use(express.raw())' or handle req as a stream directly if body-parser didn't consume it.
        
        // In simple node+express without specific raw middleware, req is a stream.
        // But if `express.json()` is active globally, check if we need to bypass.
        // Usually `express.json()` only acts on Content-Type application/json.
        // WOPI sends 'application/octet-stream'.

        const writeStream = fs.createWriteStream(filePath);
        
        req.pipe(writeStream);

        writeStream.on('finish', () => {
            res.status(200).json({
                LastModifiedTime: new Date().toISOString()
            });
        });

        writeStream.on('error', (err) => {
            console.error('Save Error:', err);
            res.status(500).send('Save Failed');
        });

    } catch (error) {
        console.error('WOPI PutFile Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
