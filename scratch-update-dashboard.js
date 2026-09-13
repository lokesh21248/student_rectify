const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(main)/admin/AdminDashboardClient.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add import
if (!content.includes('AdminCategoriesTab')) {
  content = content.replace(
    'import { AdminCollegesTab } from "@/components/admin/AdminCollegesTab";',
    'import { AdminCollegesTab } from "@/components/admin/AdminCollegesTab";\nimport { AdminCategoriesTab } from "@/components/admin/AdminCategoriesTab";'
  );
}

// 2. Replace tab content
// Find `{/* TAB: CATEGORIES */}` and `{/* TAB: PARTNER COLLEGES */}`
const startMarker = '{/* TAB: CATEGORIES */}';
const endMarker = '{/* TAB: PARTNER COLLEGES */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `${startMarker}
      {activeTab === "categories" && (
        <AdminCategoriesTab categories={categories} />
      )}

      `;
  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Modified AdminDashboardClient.tsx successfully');
