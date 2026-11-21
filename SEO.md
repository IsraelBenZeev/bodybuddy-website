# SEO ואנליטיקס: מה נעשה ומה נותר

עודכן לאחרונה: 22.11.2026. האתר: https://bodybuddy.fitness (GitHub Pages, ללא build).

## מה נעשה

### דף הבית
- כפתור Google Play מקושר לקישור האמיתי מטבלת `app_versions` (`com.ibz1330.bodybuddy`). כפתור App Store נשאר "בקרוב".
- H1 עם טקסט אמיתי: "BodyBuddy — תזונה, אימונים והתקדמות במקום אחד". הטקסט מוסתר חזותית (`.visually-hidden`) ולצידו הלוגו.
- `canonical`, `robots`, Open Graph, Twitter Card (`summary_large_image`).
- JSON-LD: `MobileApplication`, `WebSite`, `Organization`.
- `fetchpriority="low"` ו-`decoding="async"` לתמונות הקיר. תמונות המסכים בפרקים נטענות lazy (`script.js`).

### קבצים ודפים חדשים
- `robots.txt` (חוסם `/share/` ו-`/privecypolicy/`, מפנה ל-sitemap) ו-`sitemap.xml`.
- `404.html` מעוצב (הסמל הוא ה-"0"), עם noindex ונתיבים מוחלטים.
- `images/og-image.png` (1200×630): לוגו ושלושה מסכים, מורכב מ-`logo.svg` הקיים.
- `website-privacy/index.html`: פרטיות האתר (Google Analytics ועוגיות). מקושר מהפוטר בדף הבית, בבלוג ובמאמרים. מדיניות האפליקציה (`/privacypolicy/`) לא שונתה.

### בלוג
- 4 מאמרים חדשים: `protein`, `macros`, `calorie-counting`, `beginner-workout`. כל אחד עם canonical, OG, `Article` ו-`BreadcrumbList`.
- OG ו-canonical בעמוד הבלוג, `BreadcrumbList` במאמר ה-TDEE, ריווח בין כרטיסי הבלוג.

### Google Search Console
- הנכס `bodybuddy.fitness` (Domain) מאומת.
- `sitemap.xml` הוגש. דף הבית נסרק ומאונדקס, ונשלחה בקשת אינדוקס מחדש.
- `site:bodybuddy.fitness` מחזיר דף הבית, מדיניות הפרטיות והבלוג (נבדק 22.11).

### Google Analytics 4
- נכס `bodybuddy-29941`. נוצר מקור נתונים `BodyBuddy Website` (stream `16389467995`, Measurement ID `G-S3BT5KTJZK`).
- תג gtag בכל דפי האתר (למעט מדיניות הפרטיות ותנאי השימוש).
- אירוע `play_store_click` נשלח בלחיצה על קישור ל-Google Play (`script.js`).
- קישור בין Analytics ל-Search Console נוצר.
- נבדק: Analytics הציג משתמשים פעילים מישראל, כלומר התג עובד.

## מה נותר לעשות

### בקרוב (דקות)
- [ ] ללחוץ פעם אחת על כפתור Google Play באתר, ואז ב-Analytics (ניהול ← אירועים) לסמן את `play_store_click` כ-**Key event**.
- [ ] ב-Search Console: בקשת אינדוקס ל-`/blog/tdee/`, ל-4 המאמרים החדשים ול-`/website-privacy/`.
- [ ] לבדוק ב-Search Console שה-sitemap עובד ושהדפים החדשים התגלו.
- [ ] להדביק את הקישור ב-opengraph.xyz ובוואטסאפ ולוודא שתמונת השיתוף החדשה מוצגת (ייתכן מטמון ישן).

### החלטות ובדיקות
- [ ] **ייעוץ משפטי** על `website-privacy/` ועל הצורך באנר עוגיות. כרגע אין באנר, ו-GA4 שומר עוגיות (`_ga`, `_ga_*`). ההחלטה בינתיים היא להסתפק בדף הפרטיות.
- [ ] **מדיניות האפליקציה:** האם להוסיף שורת הפניה לדף פרטיות האתר. לפני כן לבדוק בקוד האפליקציה אם שינוי גרסה ב-`legal_documents` גורם להצגת הודעה או לאישור מחדש.
- [ ] **לקרוא את 4 המאמרים החדשים** (נכתבו על ידי Claude, לא נבדקו על ידי דיאטן או מאמן).
- [ ] **PageSpeed:** להריץ ב-pagespeed.web.dev על דף הבית ולטפל בתוצאות (מכסת ה-API נוצלה, ולכן אין מדידה). שיפורי ה-lazy loading לא נמדדו.
- [ ] **תצוגת נייד של 404:** לבדוק במכשיר או בכלי מפתחים (הצילום המקומי נחתך).
- [ ] לוודא ש-`www.bodybuddy.fitness` מפנה לכתובת בלי www (ה-canonical מכסה זאת חלקית).

### צמיחה (דורש עבודה שלך)
- [ ] **Google Play Console:** כותרת, תיאור קצר ותיאור מלא עם מילות מפתח; שדה "אתר" שמצביע על `bodybuddy.fitness`.
- [ ] **קישורים נכנסים:** פרופילי Instagram ו-TikTok, שיתופים ואזכורים. אחרי שיהיו כתובות אפשר להוסיף `sameAs` ל-`Organization`.
- [ ] עוד מאמרים בבלוג וקישורים פנימיים ביניהם ומדף הבית. חיפושים כלליים כמו "אפליקציית כושר" יתחרו באפליקציות גדולות, ולכן כדאי לכוון לחיפושים ספציפיים.
- [ ] להרחיב כותרות H2 בדף הבית ("תזונה", "אימונים", "התקדמות") עם מילות מפתח, באישור, כי זה משנה את העיצוב.
- [ ] כשיהיה iOS: לעדכן את כפתור App Store, את `operatingSystem` ב-JSON-LD ואת `sameAs`.

## הערות
- `PRODUCT.md` מיושן: כתוב בו שכפתורי החנויות מושבתים ושהמדיניות ב-`/privecypolicy/`. בפועל Google Play פעיל, והמדיניות ב-`/privacypolicy/`. התיקייה `privecypolicy/` (עם שגיאת הכתיב) נשארה עם noindex.
- המדיניות של האפליקציה נטענת מטבלת `legal_documents` ב-Supabase, ולכן היא אינה חלק מקבצי האתר.
- תמונת OG נבנתה ב-Chrome ללא ממשק מ-`logo.svg` ומצילומי המסך שבאתר. אם הלוגו או המסכים ישתנו, צריך לייצר אותה מחדש.
- אין התחייבות לדירוג בגוגל, וקידום אורגני לוקח שבועות עד חודשים.
