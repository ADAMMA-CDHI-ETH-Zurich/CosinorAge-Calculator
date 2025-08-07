# File Size Limit Feature

This document describes the file size limit functionality implemented in CosinorLab.

## Overview

The file size limit feature prevents users from uploading files larger than a specified size (default: 10MB). This helps prevent server overload and ensures consistent performance.

## Configuration

### Backend Configuration

The file size limit is controlled by two global variables in `backend/main.py`:

```python
# File upload configuration
ENABLE_FILE_SIZE_LIMIT = True  # Global switch to enable/disable file size limit
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB in bytes
```

### Frontend Configuration

The frontend configuration is in `frontend/src/config.js`:

```javascript
// File upload configuration
ENABLE_FILE_SIZE_LIMIT: true,  // Global switch to enable/disable file size limit
MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,  // 10MB in bytes
```

## How to Enable/Disable

### Option 1: Modify Configuration Files

1. **To disable the limit entirely:**
   - Set `ENABLE_FILE_SIZE_LIMIT = False` in `backend/main.py`
   - Set `ENABLE_FILE_SIZE_LIMIT: false` in `frontend/src/config.js`

2. **To change the size limit:**
   - Modify `MAX_FILE_SIZE_BYTES` in both files
   - Example: `MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024` for 50MB

### Option 2: Environment Variables (Future Enhancement)

You can also control the limit via environment variables by modifying the configuration files to read from environment variables.

## Implementation Details

### Backend Implementation

The file size check is implemented in two endpoints:

1. **Single File Upload** (`/upload`):
   - Checks file size before processing
   - Returns HTTP 413 (Payload Too Large) if file exceeds limit
   - Includes detailed error message with file size and limit

2. **Bulk File Upload** (`/bulk_upload`):
   - Checks each file individually
   - Rejects the entire upload if any file exceeds the limit
   - Provides specific error message identifying the problematic file

3. **Configuration Endpoint** (`/config`):
   - Returns current file size limit settings
   - Used by frontend to display current limits

### Frontend Implementation

The frontend implements size checking in multiple components:

1. **useFileUpload Hook** (`frontend/src/hooks/useFileUpload.js`):
   - Client-side validation before upload
   - Shows user-friendly error messages

2. **SingleIndividualLabSubTab** (`frontend/src/components/subcomponents/SingleIndividualLabSubTab.js`):
   - File size validation for single file uploads

3. **MultiIndividualLabSubTab** (`frontend/src/components/subcomponents/MultiIndividualLabSubTab.js`):
   - File size validation for bulk uploads
   - Checks each file in the selection

## Error Messages

### Backend Error Messages

- **Single file upload**: `"File size (X.XMB) exceeds the maximum allowed size of YMB"`
- **Bulk upload**: `"File 'filename.csv' size (X.XMB) exceeds the maximum allowed size of YMB"`

### Frontend Error Messages

- **Single file upload**: `"File is too large. Maximum allowed size is YMB. Your file is X.XMB."`
- **Bulk upload**: `"File 'filename.csv' is too large. Maximum allowed size is YMB. Your file is X.XMB."`

## Testing

A test script is provided to verify the functionality:

```bash
python test_file_size_limit.py
```

The test script:
1. Tests the configuration endpoint
2. Attempts to upload a file larger than the limit (should fail)
3. Attempts to upload a file smaller than the limit (should succeed)

## API Endpoints

### GET /config

Returns the current file size limit configuration:

```json
{
  "enable_file_size_limit": true,
  "max_file_size_bytes": 10485760,
  "max_file_size_mb": 10.0
}
```

### POST /upload

Returns HTTP 413 with error message if file exceeds size limit:

```json
{
  "detail": "File size (15.2MB) exceeds the maximum allowed size of 10MB"
}
```

### POST /bulk_upload

Returns HTTP 413 with error message if any file exceeds size limit:

```json
{
  "detail": "File 'large_file.csv' size (15.2MB) exceeds the maximum allowed size of 10MB"
}
```

## Security Considerations

1. **Server Protection**: Prevents large file uploads that could overwhelm server resources
2. **Memory Usage**: Limits memory consumption during file processing
3. **Storage**: Prevents excessive disk usage from large uploads
4. **Performance**: Ensures consistent upload and processing times

## Troubleshooting

### Common Issues

1. **Files being rejected unexpectedly**:
   - Check if `ENABLE_FILE_SIZE_LIMIT` is set to `true`
   - Verify `MAX_FILE_SIZE_BYTES` is set to the desired limit
   - Ensure both backend and frontend configurations match

2. **Large files being accepted when they shouldn't be**:
   - Verify the backend is running with the updated configuration
   - Check that the frontend is using the updated configuration
   - Restart both backend and frontend services

3. **Configuration endpoint not working**:
   - Ensure the backend is running
   - Check that the `/config` endpoint is accessible
   - Verify the endpoint returns the expected JSON structure

### Debugging

1. **Check backend logs** for file size validation messages
2. **Use the test script** to verify functionality
3. **Check browser developer tools** for frontend validation errors
4. **Verify configuration** by calling the `/config` endpoint directly

## Future Enhancements

Potential improvements to consider:

1. **Environment Variable Configuration**: Allow configuration via environment variables
2. **Dynamic Configuration**: Add admin interface to change limits without code changes
3. **File Type Specific Limits**: Different limits for different file types
4. **User-Specific Limits**: Different limits based on user roles or subscription levels
5. **Progressive Upload**: Support for chunked uploads of large files 