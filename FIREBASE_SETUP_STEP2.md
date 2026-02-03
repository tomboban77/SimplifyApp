# Firebase Setup - Step 2: Create Firestore Database

## Step 2: Create Firestore Database

### ⚠️ IMPORTANT: Make sure you choose the RIGHT mode!

### Instructions:

1. **In Firebase Console, go to Firestore Database**
   - Look in the left sidebar
   - Click on **"Firestore Database"** (or "Build" → "Firestore Database")
   - If you don't see it, click "Build" first, then "Firestore Database"

2. **Click "Create Database"**
   - You'll see a button to create the database

3. **Choose Security Rules Mode**
   - Select **"Start in test mode"** (for development)
   - This allows read/write access for 30 days
   - Click **"Next"**

4. **⚠️ CRITICAL: Choose Database Location**
   - **IMPORTANT**: You'll see two options:
     - **"Cloud Firestore"** (Native mode) ✅ **CHOOSE THIS ONE**
     - **"Cloud Datastore"** ❌ **DO NOT CHOOSE THIS**
   
   - Make sure you select **"Cloud Firestore"** (Native mode)
   - Choose a location close to you (e.g., `us-central`, `nam5`, `europe-west`)
   - Click **"Enable"**

5. **Wait for Database Creation**
   - Takes about 1-2 minutes
   - You'll see "Cloud Firestore is being set up..."

### ✅ What You Should See:

- Firestore Database page loads
- You'll see an empty database with message: "Your database is ready to go. Just add data."
- At the bottom left, you'll see: "Database location: [your-location]"
- **Make sure it says "Cloud Firestore" at the top, NOT "Cloud Datastore"**

### 📝 Important Notes:

- **Database Mode**: Must be "Cloud Firestore" (Native mode)
- **Location**: Note which location you chose (e.g., `nam5`, `us-central`)
- **Security Rules**: Will be in test mode (we'll update these later)

---

## Verification Checklist:

Before moving to Step 3, confirm:
- [ ] Database is created
- [ ] It says "Cloud Firestore" (not "Cloud Datastore")
- [ ] You see the empty database page
- [ ] You know the database location (shown at bottom left)

---

## Once You've Completed Step 2:

**Tell me:**
1. ✅ Database is created
2. ✅ It says "Cloud Firestore" (Native mode)
3. 📍 Database location (e.g., `nam5`, `us-central`)

Then I'll guide you through **Step 3: Get Firebase Configuration**.

