# 🎓 University Alumni Portal

A production-ready, serverless alumni management system built with  **Next.js** ,  **Supabase** , and  **Tailwind CSS** . Features include secure account creation, photo uploading, admin verification, and a 3.4" x 2.2" physical ID card printing system.

---

## 🛠 Tech Stack

* **Frontend:** Next.js 14+ (App Router)
* **Styling:** Tailwind CSS (Custom University Theme: Maroon & Blue)
* **Database & Auth:** Supabase (PostgreSQL)
* **Storage:** Supabase Storage (for Alumni Photos)
* **Deployment:** Vercel

---

## 🚀 Quick Start

### 1. Clone and Install

**Bash**

```
git clone https://github.com/your-username/alumni-portal.git
cd alumni-portal
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

**Code snippet**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

1. Go to the  **Supabase SQL Editor** .
2. Copy and run the contents of `/supabase/schema.sql` (this creates the `profiles` table and Auth triggers).
3. **Important:** Manually set your own user `role` to `'admin'` in the `profiles` table to access the admin dashboard.

### 4. Storage Configuration

1. In Supabase, go to **Storage** and create a bucket named `avatars`.
2. Set the bucket to  **Public** .
3. Add a Policy for `INSERT` and `UPDATE` access:
   * **Policy Name:** `Allow users to upload their own avatars`
   * **Allowed Operations:** `INSERT`, `UPDATE`
   * **Target:** `authenticated users`

---

## 📂 Features & Directory Guide

* **`/app/register`** : Handles complex onboarding including career path and feedback.
* **`/app/admin/verify`** : Admin-only route. Allows approving alumni and printing cards.
* **`/components/AdminAlumniCard.tsx`** : Contains the precise CSS logic for **3.4" x 2.2"** ID cards.
* **`middleware.ts`** : Protects the `/admin` routes using server-side role checks.

---

## 🖨 Printing Alumni Cards

To ensure the physical cards print correctly:

1. Navigate to the Admin Verification page.
2. Click **Print ID Card** on a verified profile.
3. In the Print Dialog:
   * **Paper Size:** Custom (3.4in x 2.2in) or Letter.
   * **Margins:** None.
   * **Background Graphics:** **MUST BE CHECKED** to see the Maroon/Blue branding.

---

## 🔒 Security Summary

This portal implements  **Row Level Security (RLS)** :

* **Public:** Can only see verified alumni in the directory.
* **Alumni:** Can update only their own profile data and photo.
* **Admins:** Can view all data and toggle the `is_verified` status.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
