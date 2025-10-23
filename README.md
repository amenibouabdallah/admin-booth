# JETConnect Booth Management Admin Dashboard

An admin dashboard application for managing exhibition booth bookings and reservations. Built with Next.js 15, React 19, Prisma, and MongoDB.

## Overview

This application provides a comprehensive admin interface for managing exhibition booths, handling booking requests from enterprises, and organizing booths into categories. Administrators can view, approve, or reject booth reservation requests, manage booth inventory, and export data for reporting.

## Features

### Admin Dashboard
- View all booths with filtering and search capabilities
- Filter booths by status (Pending, Accepted, Rejected) and category
- Search booths by name or number
- Bulk category assignment for multiple booths
- View detailed booth information including dimensions, pricing, and add-ons
- Manage booking requests (approve/reject)
- Export booth data to CSV format
- Secure admin authentication

### Booth Management
- Create and edit booth listings
- Assign booths to categories
- Track booth status (Pending, Accepted, Rejected)
- View enterprise information for booked booths
- Manage booth dimensions, pricing, and add-ons
- Upload and display booth images

### Category Management
- Create and manage booth categories
- Assign default dimensions and pricing per category
- Define category-specific add-ons
- Bulk assign booths to categories
- Track booth count per category

### Enterprise Portal (API)
- View available booths
- Submit booking requests
- View assigned booth details

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Database**: MongoDB with Prisma ORM
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Token-based (localStorage)
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
admin-booth/
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/             # Admin endpoints
│   │   │   ├── booths/        # Booth management
│   │   │   └── categories/    # Category management
│   │   ├── enterprise/        # Enterprise endpoints
│   │   └── booth/             # Booth creation
│   ├── dashboard/             # Admin dashboard page
│   ├── categories/            # Category management page
│   ├── login/                 # Authentication page
│   └── page.tsx              # Landing page
├── components/
│   ├── booth-list-view.tsx    # Booth grid/list display
│   ├── booth-detail-view.tsx  # Individual booth details
│   ├── booking-requests-view.tsx # Booking management
│   ├── bulk-category-assignment.tsx # Bulk operations
│   └── ui/                    # Reusable UI components
├── lib/
│   └── prisma.ts             # Prisma client setup
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding script
└── package.json
```

## Database Schema

### Models

- **Booth**: Exhibition booth with dimensions, pricing, status, and enterprise assignment
- **Enterprise**: Companies that book booths
- **Category**: Booth categories with default configurations
- **admin_dashboard**: Admin configuration

### Key Relationships

- Each booth can be assigned to one enterprise
- Each booth can belong to one category
- Categories define default dimensions, pricing, and add-ons
- Enterprises can have multiple booths

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- MongoDB database

### Installation

1. Clone the repository:
```bash
cd admin-booth
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env file
DATABASE_URL="mongodb://your-mongodb-connection-string"
```

4. Generate Prisma client:
```bash
pnpm prisma generate
```

5. Seed the database (optional):
```bash
pnpm db:seed
```

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

## API Endpoints

### Admin Routes

- `GET /api/admin/booths` - List all booths
- `GET /api/admin/booths/[id]` - Get booth details
- `PUT /api/admin/booths/[id]` - Update booth
- `DELETE /api/admin/booths/[id]` - Delete booth
- `PATCH /api/admin/booths/[id]/status` - Update booth status
- `POST /api/admin/booths/bulk-update` - Bulk update booths
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

### Enterprise Routes

- `GET /api/enterprise/booths/available` - List available booths
- `GET /api/enterprise/booths/my-booth` - Get assigned booth
- `POST /api/enterprise/booths/[id]/book` - Book a booth

### Booth Routes

- `POST /api/booth/create` - Create new booth

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:seed` - Seed database with sample data

## Authentication

The application uses a simple token-based authentication system. Admin users must log in to access the dashboard. Tokens are stored in localStorage.

## Features in Detail

### Booth Filtering
- Filter by status: Pending, Accepted, Rejected, or All
- Filter by category
- Real-time search by booth name or number
- Select multiple booths for bulk operations

### CSV Export
Export booth data including:
- Booth ID, name, and number
- Location and dimensions
- Status and owner information
- Creation dates

### Bulk Operations
- Select multiple booths from the list
- Assign selected booths to a category simultaneously
- Visual feedback for selected items

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved
