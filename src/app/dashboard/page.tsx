import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
            <p className="text-gray-600">ברוכים הבאים למערכת הניהול</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">בקשות ממתינות</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">השאלות פעילות</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 01.293.707V13a1 1 0 01-1 1H9a1 1 0 01-1-1v-2a1 1 0 011-1z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">משחקים זמינים</p>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">החזרות באיחור</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">פעילות אחרונה</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full ml-3"></div>
                  <span className="text-sm text-gray-700">בקשה חדשה: משחק "דרך הלב" מאת שרה כהן</span>
                </div>
                <span className="text-xs text-gray-500">לפני 5 דקות</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full ml-3"></div>
                  <span className="text-sm text-gray-700">החזרה: משחק "שיחות זוגיות" מאת דוד לוי</span>
                </div>
                <span className="text-xs text-gray-500">לפני שעה</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-purple-500 rounded-full ml-3"></div>
                  <span className="text-sm text-gray-700">משחק חדש נוסף: "חיבור עמוק"</span>
                </div>
                <span className="text-xs text-gray-500">לפני 3 שעות</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}