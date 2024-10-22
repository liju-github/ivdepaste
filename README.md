# ivdepaste - A simple file sharing and code snippet platform built with Next.js.

## Project Overview
ivdepaste lets you easily share files and code snippets. Whether you want to quickly share some code or upload files, it's got you covered.

## Tech Stack
- **Frontend**: Next.js 14+ with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **ORM**: Prisma
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS

## Features Roadmap

### Phase 1: Core Infrastructure
- [x] Project setup with Next.js 14+
- [x] Supabase integration
- [x] Prisma setup
- [x] Basic authentication
- [ ] File upload system
- [ ] Core database schema

### Phase 2: File Management
- [ ] Multi-file upload support
- [ ] File preview system
  - Code files
  - Images
  - PDFs
  - Text files
- [ ] File organization structure
- [ ] Storage quota management
- [ ] File sharing mechanisms

### Phase 3: Code Features
- [ ] Code editor integration
- [ ] Syntax highlighting
- [ ] Multiple language support
- [ ] Code snippet management
- [ ] Version control integration
- [ ] Collaborative editing

### Phase 4: User Experience
- [ ] Customizable dashboard
- [ ] Dark/Light theme
- [ ] Search functionality
- [ ] Tags and categories
- [ ] Sharing options
- [ ] File/Code analytics

## Database Schema

```prisma
// schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  profileImage  String?
  files         File[]
  folders       Folder[]
  codeSnippets  CodeSnippet[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model File {
  id          String    @id @default(cuid())
  name        String
  type        String
  size        Int
  url         String
  folderId    String?
  userId      String
  isPublic    Boolean   @default(false)
  expiresAt   DateTime?
  user        User      @relation(fields: [userId], references: [id])
  folder      Folder?   @relation(fields: [folderId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Folder {
  id          String    @id @default(cuid())
  name        String
  userId      String
  parentId    String?
  files       File[]
  user        User      @relation(fields: [userId], references: [id])
  parent      Folder?   @relation("FolderToFolder", fields: [parentId], references: [id])
  children    Folder[]  @relation("FolderToFolder")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model CodeSnippet {
  id          String    @id @default(cuid())
  title       String
  content     String
  language    String
  userId      String
  isPublic    Boolean   @default(false)
  expiresAt   DateTime?
  user        User      @relation(fields: [userId], references: [id])
  tags        Tag[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Tag {
  id           String        @id @default(cuid())
  name         String
  codeSnippets CodeSnippet[]
}
```

## Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── files/
│   └── code/
├── components/
│   ├── ui/
│   ├── files/
│   ├── code/
│   └── shared/
├── lib/
│   ├── prisma/
│   ├── supabase/
│   └── utils/
├── hooks/
└── types/
```

## API Routes

```typescript
// Core Routes
/api/files
  - POST /upload
  - GET /list
  - GET /:id
  - DELETE /:id
  - PATCH /:id/share

/api/folders
  - POST /create
  - GET /list
  - PATCH /:id
  - DELETE /:id

/api/code
  - POST /create
  - GET /list
  - GET /:id
  - PATCH /:id
  - DELETE /:id

/api/search
  - GET /files
  - GET /code
```

## Environment Setup
```env
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Getting Started
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Deployment Strategy
1. **Development**: Vercel Preview Deployments
2. **Production**: Vercel Production
3. **Database**: Supabase Project
4. **Storage**: Supabase Storage

## Security Considerations
- File type validation
- Upload size limits
- Rate limiting
- Access control
- File encryption
- Secure sharing links

## Performance Optimizations
- Image optimization
- Lazy loading
- Incremental Static Regeneration
- Edge caching
- Chunked uploads

## Monitoring
- Supabase Dashboard
- Vercel Analytics
- Custom logging system

