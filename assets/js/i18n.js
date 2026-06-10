/* GRC·LABS — i18n
   EN/HE translation object + language toggle (full RTL).
   Loads before decrypt.js so data-final is populated before the scramble runs. */
(function(){
  var I18N = {
    "nav.cap":{en:"Capabilities",he:"יכולות"},
    "nav.cred":{en:"Credentials",he:"הסמכות"},
    "cred.idx":{en:"// CREDENTIALS",he:"// הסמכות"},
    "cred.title":{en:"Certified, audited, accountable.",he:"מקצועיות, ניסיון רב-תחומי, הסמכות בינלאומיות"},
    "cred.intro":{en:"The letters behind the work — held, not borrowed. Tailored security still has to stand up to standards.",
      he:"הכול לפי דרישות התקינה, הרגולציה ותורות ההגנה הרלוונטיות למגזר שלכם."},
    "cred.cissp":{en:"Certified Information Systems Security Professional",he:"מומחה מוסמך לאבטחת מערכות מידע"},
    "cred.cism":{en:"Certified Information Security Manager",he:"מנהל אבטחת מידע מוסמך"},
    "cred.iso":{en:"Lead Auditor · ISO/IEC 27001:2022",he:"מבקר מוביל · ISO/IEC 27001:2022"},
    "cred.dpo":{en:"Data Protection Officer",he:"ממונה הגנת פרטיות (DPO)"},
    "cred.ciso":{en:"Chief Information Security Officer Program",he:"תוכנית מנהלי אבטחת מידע (CISO)"},
    "cred.verify":{en:"verified",he:"מאומת"},
    "cred.foot":{en:"CISSP and CISM are independently verifiable on Credly.",he:"אפשר לאמת את CISSP ו-CISM ישירות ב-Credly."},
    "cred.cloud":{en:"Cloud Essentials",he:"Cloud Essentials"},
    "nav.labs":{en:"The Labs",he:"המעבדות"},
    "nav.ch":{en:"Challenge",he:"אתגר"},
    "nav.contact":{en:"Contact",he:"יצירת קשר"},
    "hero.eyebrow":{en:"Tailored Information Security",he:"אבטחת מידע בהתאמה אישית"},
    "trust.l1":{en:"CISSP &middot; CISM",he:"CISSP &middot; CISM"},
    "trust.l2":{en:"ISO 27001 LA &middot; DPO",he:"ISO 27001 LA &middot; DPO"},
    "hero.sub":{en:"A private cybersecurity, governance and privacy practice run by a working <b>CISO</b> — not a brochure. Two decades of building, breaking and defending systems, distilled into a small set of services for organizations that <b>can't afford to get security wrong.</b>",
      he:"ניהול סייבר, סיכונים וממשל בהתאמה אישית, בהובלת <b>CISO מוסמך</b> — לארגונים <b>שלא יכולים להרשות לעצמם טעויות באבטחה או כשלים טכנולוגיים.</b>"},
    "hero.m1":{en:"20+ years across security & engineering",he:"20+ שנות ניסיון באבטחה ובהנדסה"},
    "hero.m2":{en:"Government & enterprise grade",he:"ברמה ממשלתית ותאגידית"},
    "hero.m3":{en:"Hands-on, end to end",he:"מעשי, מקצה לקצה"},
    "cap.title":{en:"Capabilities",he:"יכולות"},
    "cap.tnote":{en:"Tailored — every service measured to your actual risk, never a template.",he:"בהתאמה אישית — כל שירות נמדד לפי הצורך העסקי שלכם, לא לפי תבנית."},
    "labs.tnote":{en:"Tailored — each one built for a specific problem, not pulled off a shelf.",he:"מעבדות מחקר ופיתוח לצרכים מוגדרים — כולל אפיון, מחקר ופיתוח, רישום פטנטים, הקמת מערכות ואב-טיפוס עד PROD."},
    "cap.intro":{en:"What we actually do. Every line below is backed by real engagements — security leadership, regulated environments, and live incidents handled under pressure.",
      he:"מה אנחנו עושים? ניתוח של כל התהליכים העסקיים בארגון, מיפוי טכנולוגי, מיפוי וניהול סיכונים, תוכניות המשכיות עסקית, תרגילי הנהלה והדרכות, ועמידה ברגולציה."},
    "c1.h":{en:"Security Leadership",he:"ניהול אבטחת מידע"},
    "c1.p":{en:"CISO-as-a-Service: security programs, policies and annual plans built around your real risk profile, with senior ownership rather than a checklist.",
      he:"CISO כשירות: תוכניות אבטחה, מדיניות ותוכניות עבודה שנתיות הבנויות סביב פרופיל הסיכון האמיתי שלכם — באחריות בכירה, לא ברשימת תיוג."},
    "c1.t1":{en:"CISO",he:"CISO"},"c1.t2":{en:"strategy",he:"אסטרטגיה"},"c1.t3":{en:"governance",he:"ממשל"},
    "c2.h":{en:"GRC & Compliance",he:"ממשל, סיכונים וציות"},
    "c2.p":{en:"Risk management, business impact analysis and regulatory alignment. ISO 27001 / 27035 / 22301 — taken all the way to certification.",
      he:"ניהול סיכונים, ניתוח השפעה עסקית והתאמה לרגולציה. ISO 27001 / 27035 / 22301 — עד לקבלת ההסמכה."},
    "c2.t2":{en:"risk",he:"סיכונים"},"c2.t3":{en:"audit",he:"ביקורת"},
    "c3.h":{en:"Incident Response",he:"תגובה לאירועי סייבר"},
    "c3.p":{en:"Real-time handling of cyber incidents and crises: investigation, forensics, coordination and remediation — led personally, not delegated.",
      he:"טיפול בזמן אמת באירועי סייבר ובמשברים: חקירה, פורנזיקה, תיאום ושיקום — בניהול אישי, לא במיקור."},
    "c3.t1":{en:"forensics",he:"פורנזיקה"},"c3.t2":{en:"crisis",he:"משבר"},"c3.t3":{en:"response",he:"תגובה"},
    "c4.h":{en:"Privacy & DPO",he:"פרטיות ו-DPO"},
    "c4.p":{en:"Data protection governance and DPO services under both Israeli privacy law and the GDPR, with direct experience working alongside national privacy authorities.",
      he:"ממשל הגנת מידע ושירותי DPO, תחת חוק הגנת הפרטיות וה-GDPR כאחד, מתוך עבודה ישירה מול רשויות הגנת הפרטיות."},
    "c4.t2":{en:"privacy",he:"פרטיות"},"c4.t3":{en:"data",he:"מידע"},
    "c5.h":{en:"Secure Architecture",he:"ארכיטקטורה מאובטחת"},
    "c5.p":{en:"Security-by-design across servers, networks and applications — bridging R&D, DevOps and operations instead of bolting security on at the end.",
      he:"אבטחה בתכן (Security by Design) על פני שרתים, רשתות ואפליקציות — חיבור בין פיתוח, DevOps ותפעול, במקום להלביש אבטחה בסוף."},
    "c5.t1":{en:"design",he:"תכן"},"c5.t3":{en:"review",he:"סקירה"},
    "c6.h":{en:"IoT / OT / Embedded",he:"IoT, OT ומערכות משובצות"},
    "c6.p":{en:"Security for connected devices, control systems and embedded platforms — from the perspective of someone who has built them, not just audited them.",
      he:"אבטחה למכשירים מחוברים, מערכות בקרה ופלטפורמות משובצות — מנקודת מבט של מי שבנה אותן, לא רק ביקר אותן."},
    "c6.t3":{en:"embedded",he:"משובצות"},
    "c7.h":{en:"Tech & Digital Transformation",he:"טכנולוגיה וטרנספורמציה דיגיטלית"},
    "c7.p":{en:"Technology advisory grounded in a CTO background — architecture, modernization and digital transformation guided by security from day one.",
      he:"ייעוץ טכנולוגי מתוך רקע של CTO — ארכיטקטורה, מודרניזציה וטרנספורמציה דיגיטלית, מונחות באבטחה מהיום הראשון."},
    "c7.t1":{en:"advisory",he:"ייעוץ"},"c7.t2":{en:"transformation",he:"טרנספורמציה"},
    "c8.h":{en:"AI, Securely",he:"AI בצורה מאובטחת"},
    "c8.p":{en:"Bringing AI into the organization without opening new attack surface — applied use, governance and the risks most teams discover too late.",
      he:"הכנסת AI לארגון בלי לפתוח משטח תקיפה חדש — שימוש יישומי, ממשל, והסיכונים שרוב הצוותים מגלים מאוחר מדי."},
    "c8.t2":{en:"governance",he:"ממשל"},"c8.t3":{en:"risk",he:"סיכונים"},
    "c9.h":{en:"Talks & Lectures",he:"הרצאות והדרכות"},
    "c9.p":{en:"Speaking on cybersecurity, risk and the reality of the CISO seat — for teams, leadership and professional audiences. Technical when it needs to be.",
      he:"הרצאות על סייבר, סיכונים והמציאות של תפקיד ה-CISO — לצוותים, להנהלות ולקהל מקצועי. טכני כשצריך."},
    "c9.t1":{en:"speaking",he:"הרצאות"},"c9.t2":{en:"training",he:"הדרכה"},"c9.t3":{en:"workshops",he:"סדנאות"},
    "labs.title":{en:"The Labs",he:"המעבדות"},
    "labs.stamp":{en:"RESTRICTED",he:"מסווג"},
    "labs.h":{en:"We don't only advise. We build.",he:"לא רק מייעצים. בונים"},
    "labs.p":{en:"Behind the practice sits applied R&D — we take on hard, multidisciplinary problems across security, positioning, acoustics, monitoring and data. Every build is tailor-made. Some becomes client work; some stays in the lab a while longer.",
      he:"מאחורי הייעוץ עומד מחקר ופיתוח יישומי. אנחנו לוקחים בעיות מורכבות ורב-תחומיות — אבטחה, מיקום, אקוסטיקה, ניטור ומידע — וכל פתרון נבנה בהתאמה. חלק הופך לעבודה עבור לקוחות, וחלק נשאר אצלנו במעבדה."},
    "labs.s1":{en:"STATUS: ACTIVE",he:"סטטוס: פעיל"},
    "labs.s2":{en:"STATUS: IN PROGRESS",he:"סטטוס: בתהליך"},
    "labs.s3":{en:"STATUS: CLASSIFIED",he:"סטטוס: מסווג"},
    "p1.h":{en:"Connected-device monitoring",he:"ניטור מכשירים מחוברים"},
    "p1.p":{en:"Real-time telemetry and monitoring for IoT fleets — eyes on devices that usually run unwatched.",
      he:"טלמטריה וניטור בזמן אמת למערכי IoT — עיניים על מכשירים שרצים בדרך כלל ללא השגחה."},
    "p2.h":{en:"Resilient architecture & anomaly detection",he:"ארכיטקטורה עמידה וזיהוי אנומליות"},
    "p2.p":{en:"High-availability system design with anomaly detection tuned to each environment, not a generic baseline.",
      he:"תכן מערכות בזמינות גבוהה, עם זיהוי אנומליות המכוון לכל סביבה — לא בסיס גנרי."},
    "p3.h":{en:"Medical data registry portal",he:"פורטל למרשמי מידע רפואי"},
    "p3.p":{en:"A management portal for sensitive medical registries — built where privacy and uptime both matter.",
      he:"פורטל ניהול למרשמים רפואיים רגישים — נבנה במקום שבו גם הפרטיות וגם הזמינות קריטיות."},
    "p4.h":{en:"CRM & portal rebuild automation",he:"אוטומציה לבנייה מחדש של CRM ופורטלים"},
    "p4.p":{en:"Automation that analyzes existing portals and CRM systems and rebuilds them, tailored to the organization.",
      he:"אוטומציה שמנתחת פורטלים ומערכות CRM קיימים ובונה אותם מחדש, בהתאמה לארגון."},
    "p5.h":{en:"GPS & LoRa positioning",he:"מיקום מבוסס GPS ו-LoRa"},
    "p5.p":{en:"Location and long-range telemetry over GPS and LoRa — tracking and sensing where conventional networks don't reach.",
      he:"מיקום וטלמטריה לטווח ארוך באמצעות GPS ו-LoRa — מעקב וחישה במקומות שרשתות רגילות לא מגיעות אליהם."},
    "p6.h":{en:"Acoustic source localization",he:"איכון מקורות קול"},
    "p6.p":{en:"Pinpointing the origin of a sound from sensor arrays — turning raw audio into a position on a map.",
      he:"איתור מדויק של מקור צליל ממערכי חיישנים — הפיכת אודיו גולמי למיקום על המפה."},
    "labs.rnd":{en:"More in the lab — multidisciplinary work we can't show yet.",he:"עוד במעבדה — עבודה רב-תחומית שעדיין אי אפשר להראות."},
    "ch.title":{en:"The Challenge",he:"האתגר"},
    "ch.h":{en:"Our cyber puzzle — beat the system.",he:"חידת הסייבר שלנו — הכו את המערכת"},
    "ch.p":{en:"More on the challenge soon.",he:"פרטים נוספים על האתגר בקרוב"},
    "ch.hint":{en:"// first one's free — what's it hiding?",he:"// הראשונה חינם — מה היא מסתירה?"},
    "contact.eyebrow":{en:"Establish contact",he:"יצירת קשר"},
    "contact.h":{en:"We tailor security to fit.",he:"אבטחת מידע בהתאמה אישית"},
    "contact.p":{en:"Great technology and sharp cyber, measured to your needs and cut to fit your organization — never off-the-rack. We take on a small number of clients at a time; tell us what you're protecting.",
      he:"שילוב מנצח של טכנולוגיה וסייבר לעידן הטרנספורמציה הדיגיטלית. אנחנו עובדים עם מספר מצומצם של לקוחות בכל זמן נתון — אם זה מדבר אליכם, בואו נכיר."},
    "contact.btn":{en:"connect on LinkedIn",he:"התחברו ב-LinkedIn"},
    "foot.l":{en:"GRC&middot;LABS — Tailored Information Security",he:"GRC&middot;LABS — אבטחת מידע בהתאמה אישית"},
    // ── /changelog page ──
    "cl.nav.home":{en:"Home",he:"דף הבית"},
    "cl.foot.link":{en:"version history",he:"עדכוני גרסאות"},
    "cl.eyebrow":{en:"// CHANGELOG",he:"// עדכוני גרסאות"},
    "cl.title":{en:"Version history",he:"עדכוני גרסאות"},
    "cl.intro":{en:"What's changed on grc-labs.com — newest first.",he:"מה השתנה ב-grc-labs.com — מהחדש לישן."},
    "cl.added":{en:"Added",he:"נוסף"},
    "cl.changed":{en:"Changed",he:"שונה"},
    "cl.internal":{en:"Internal",he:"פנימי"},
    "cl.v12.a1":{en:"Favicon and full icon set — the green pulse-dot mark.",
      he:"אייקון אתר (favicon) וסט אייקונים מלא — סמל הנקודה הירוקה הפועמת."},
    "cl.v12.a2":{en:"Cyber screensaver — Matrix rain that resolves into the slogan, a green ASCII portrait, and a typed GET-command terminal. Appears after 30s idle; any key, click or scroll dismisses it. Honors reduced-motion.",
      he:"שומר מסך סייבר — גשם מטריקס שמתלכד לסלוגן, דיוקן ASCII ירוק וטרמינל שמקליד פקודות GET. עולה אחרי 30 שניות ללא פעילות; כל הקשה, קליק או גלילה סוגרים אותו. מכבד reduced-motion."},
    "cl.v12.a3":{en:"This public version-history page.",he:"דף היסטוריית הגרסאות הציבורי הזה."},
    "cl.v12.c1":{en:"Sharpened the Hebrew copy — a stronger credentials heading and a pass of native-Hebrew fixes.",
      he:"חידוד הקופי בעברית — כותרת הסמכות חזקה יותר ומעבר של תיקוני ניסוח טבעיים."},
    "cl.v11.e1":{en:"Rebuilt the single-file site into a structured static project — separate styles, scripts and image assets. No visible change.",
      he:"האתר נבנה מחדש מקובץ יחיד לפרויקט סטטי מסודר — עיצוב, סקריפטים ונכסי תמונה בנפרד. ללא שינוי גלוי."},
    "cl.v10.e1":{en:"Public launch — Tailored Information Security. The GRC·LABS practice goes live.",
      he:"השקה פומבית — אבטחת מידע בהתאמה אישית. אתר GRC·LABS עולה לאוויר."}
  };

  var root = document.documentElement;
  var langbtn = document.getElementById('langbtn');
  var current = 'en';

  function applyLang(lang){
    current = lang; root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'he' ? 'he' : 'en');
    root.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    langbtn.textContent = lang === 'he' ? 'EN' : 'עב';
    langbtn.setAttribute('lang', lang === 'he' ? 'en' : 'he');
    langbtn.setAttribute('aria-label', lang === 'he' ? 'Switch to English' : 'Switch to Hebrew');
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var entry = I18N[el.getAttribute('data-i18n')]; if(!entry) return;
      el.innerHTML = entry[lang] || entry.en;
      el.setAttribute('data-final', el.textContent);
    });
  }

  applyLang('en');
  langbtn.addEventListener('click', function(){ applyLang(current === 'en' ? 'he' : 'en'); });
})();
