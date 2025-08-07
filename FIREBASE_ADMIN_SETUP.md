# Firebase Admin SDK Setup

To enable password change functionality in the admin panel, you need to set up Firebase Admin SDK credentials.

## Steps to Setup Firebase Admin SDK:

1. **Go to Firebase Console**

   - Navigate to your Firebase project
   - Go to Project Settings (gear icon)
   - Click on "Service Accounts" tab

2. **Generate Private Key**

   - Click "Generate New Private Key"
   - Download the JSON file
   - Keep this file secure and never commit it to version control

3. **Create Environment Variables**
   Create a `.env.local` file in the `web` directory with the following variables:

   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   ```

4. **Get the Values**
   From the downloaded JSON file, copy:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)

## Security Notes:

- Never commit the `.env.local` file to version control
- The private key gives full admin access to your Firebase project
- Keep the service account credentials secure
- Consider using environment variables in production deployments

## Testing:

After setup, you should be able to:

1. Go to the Users page in the admin panel
2. Click "Change Password" for any user
3. Enter a new password and update it
4. The user will be able to login with the new password immediately
