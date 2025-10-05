<?php
// save_data.php

// تنظیمات CORS - در محیط تولید، 'http://localhost' را با دامنه واقعی سایت خود جایگزین کنید (مثلاً 'https://yourdomain.com').
// اگر فرانت‌اند و بک‌اند روی یک دامنه و پورت باشند، این خطوط ممکن است ضروری نباشند.
header("Access-Control-Allow-Origin: *"); // برای سادگی در توسعه، اما ناامن در تولید!
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// برای درخواست‌های OPTIONS (Preflight request از مرورگر برای CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// رمز عبور ادمین - **بسیار ناامن! فقط برای نمایش و تست!**
// در محیط واقعی، این را از یک متغیر محیطی امن (Environment Variable) بخوانید و هرگز در کد قرار ندهید.
define('ADMIN_PASSWORD', 'admin123');

// مسیر فایل داده‌ها
$dataFile = 'data.json';

// بررسی متد درخواست
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $requestData = json_decode($input, true); // true برای دریافت به عنوان آرایه Associative

    // اعتبارسنجی رمز عبور
    if (!isset($requestData['password']) || $requestData['password'] !== ADMIN_PASSWORD) {
        http_response_code(401); // Unauthorized
        echo json_encode(['message' => 'Unauthorized: Invalid admin password.']);
        exit;
    }

    // اعتبارسنجی داده‌ها
    // فرض می‌کنیم داده اصلی یک شیء شامل تمامی دسته‌بندی‌های سایت است
    if (!isset($requestData['data']) || !is_array($requestData['data']) && !is_object($requestData['data'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['message' => 'Bad Request: No data or invalid data structure provided.']);
        exit;
    }

    // نوشتن داده‌های جدید در فایل
    // JSON_PRETTY_PRINT برای خوانایی بهتر فایل JSON (اختیاری)
    // JSON_UNESCAPED_UNICODE برای ذخیره کاراکترهای فارسی به درستی (ضروری)
    // LOCK_EX برای جلوگیری از مشکلات همزمانی در حین نوشتن فایل
    if (file_put_contents($dataFile, json_encode($requestData['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false) {
        http_response_code(200); // OK
        echo json_encode(['message' => 'Data saved successfully.']);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['message' => 'Error saving data. Could not write to file. Check file permissions.']);
    }
    exit;

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // برای درخواست‌های GET، محتوای فایل data.json را برمی‌گردانیم
    if (file_exists($dataFile)) {
        header('Content-Type: application/json');
        echo file_get_contents($dataFile);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['message' => 'Data file not found.']);
    }
    exit;
} else {
    // متدهای دیگر HTTP پشتیبانی نمی‌شوند
    http_response_code(405); // Method Not Allowed
    echo json_encode(['message' => 'Method not allowed.']);
    exit;
}
?>
