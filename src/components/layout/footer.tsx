import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">ז</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">זמן זוגי</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              מערכת השאלת משחקי זוגיות המספקת גישה נוחה למשחקים איכותיים המיועדים לחיזוק הקשר הזוגי. 
              המערכת מנוהלת על ידי מרכזי זוגיות ברחבי הארץ.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  משחקים
                </Link>
              </li>
              <li>
                <Link href="/centers" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  מרכזים
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  אודות
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">תמיכה</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  עזרה
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  שאלות נפוצות
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  מדיניות פרטיות
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  תנאי שימוש
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} זמן זוגי. כל הזכויות שמורות.
            </p>
            <div className="flex items-center space-x-4 space-x-reverse mt-4 md:mt-0">
              <p className="text-gray-500 text-sm">
                פותח עם ❤️ למען זוגיות חזקה יותר
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}