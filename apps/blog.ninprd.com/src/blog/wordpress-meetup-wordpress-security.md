---
title: "สรุปจาก WP Bangkok Meetup: ความปลอดภัยของ WordPress"
excerpt: สรุปสาระสำคัญจากงาน WP Bangkok Meetup เรื่องความปลอดภัยของ WordPress
tags:
  - WordPress
  - wordpress-meetup
  - meetup
  - meetup-2024
  - wordpress-bangkok
date: 2024-08-04
featuredImage: assets/blog-cover-wp-bangkok-meetup-wordpress-security.webp
status: published
---
เมื่อวันศุกร์ที่ผ่านมา ทาง WordPress Bangkok ได้จัด Meetup เรื่องความปลอดภัยของ WordPress นะครับ ซึ่งเป็น Group Discussion ที่ทุกคนมาแชร์กันเรื่อง Concern ของความปลอดภัยของ WordPress นะครับ ทั้งหมดนี้นิลสรุปออกมาเป็น Checklist ไว้แล้วครับ จะมีอะไรบ้าง ไปดูกันเลยครับ

การแก้ไข functions.php ที่นิลพูดถึงในบทความนี้ทั้งหมด ขอให้ทุกคนทำที่ [Child Themes](https://developer.wordpress.org/themes/advanced-topics/child-themes/) นะครับ ใครไม่ยังไม่เข้าใจ Concept นิลแนะนำว่าอย่าเพิ่งแก้ไขอะไร functions.php นะครับ ถ้าทำที่ Theme หลักแล้ว เวลาที่เราอัปเดท Theme ไป ตัว Code Snippet ที่เราแก้ไขไปมันจะหายไปหมดเลยนะครับ

## ย้าย URL ของ Login และ Admin

อันนี้อาจจะเป็น Basic ที่หลาย ๆ คนใช้นะครับ คือการที่ย้าย URL ของหน้า Login เพื่อให้คนที่จะเข้ามาโจมตีต้องนั่ง Scan นั่งแงะเว็บไซต์เพื่อพยายามหาหน้า Login นะครับ ซึ่งในขั้นตอนนี้เราสามารถใช้ Plugin ชื่อว่า [WPS Hide Login](https://wordpress.org/plugins/wps-hide-login/) ในการทำได้เลยครับ

## Limit จำนวนครั้งที่ Login ได้

อีกจุดนึงที่เราสามารถทำได้คือการ Limit จำนวนครั้งที่ User สามารถ Login ได้ครับ เพื่อป้องกันการ Brute Force หรือการสุ่มรหัสผ่านเข้ามาเรื่อย ๆ ครับ ซึ่งเราสามารถป้องกันได้โดยการติดตั้ง Plugin [WPS Limit Login](https://wordpress.org/plugins/wps-limit-login/) นะครับ

## คอยอัปเดท Version ของ WordPress, Plugins และ Themes อยู่ตลอด

บางทีแล้วใน Version เก่า ๆ ของ WordPress, Plugins หรือ Themes อาจจะมีช่องโหว่อยู่ ซึ่งเขาก็จะออก Version ใหม่มาเพื่อปิดช่องโหว่เหล่านี้ ถ้าเราไม่อัปเดทแล้ว แน่นอนครับ เว็บไซต์ของเราโดนเจาะแน่นอน

## Authenticate REST API

อันนี้เผื่อใครไม่รู้นะครับ WordPress เนี่ยจะเปิด REST API เป็นปกติอยู่แล้ว ถ้าเราเข้าเว็บไซต์ของเราแล้วเข้า <url-เว็บไซต์ของเรา>/wp-json/wp/v2/users เนี่ย เราจะสามารถเห็น Users 10 คนล่าสุดในระบบเราได้นะครับ ซึ่งเราสามารถเห็น slug ซึ่งมันอาจจะตรงกับ Username ได้และทำให้คนที่พยายามจะโจมตีสามารถสุ่มรหัสผ่านจาก Username ที่ได้ไป

ดังนั้นถ้าเป็นไปได้ เราควรจะทำการ Authenticate หรือว่าบังคับให้ต้องส่งพวก Token ในการยืนยันตัวตนมาให้ WordPress ก่อนเพื่อให้ใช้ REST API ได้ครับ อันนี้เราสามารถทำได้โดยแปะ Snippet นี้ไปที่ `functions.php` ครับ

```php
// Require authentication for all REST API requests
add_filter('rest_authentication_errors', 'require_authentication_for_rest_api');

function require_authentication_for_rest_api($result) {
    if (!is_user_logged_in()) {
        return new WP_Error('rest_not_logged_in', 'You are not currently logged in.', array('status' => 401));
    }
    return $result;
}
```

## บังคับให้ใช้ Username เป็น Email ในการเข้าสู่ระบบ

อันนี้เป็นสิ่งหนึ่งที่เราสามารถทำได้ หากเราต้องการเปิดตัว REST API Route เอาไว้นะครับ เราสามารถบังคับให้ User ใช้ Email แทน Username ได้โดยการใส่ Snippet นี้ไว้ที่ functions.php ครับ

```php
// Authenticate user only if the username is an email
function email_only_login_authenticate($user, $username, $password) {
    // Check if the username is an email address
    if (!is_email($username)) {
        return new WP_Error('invalid_username', __('Invalid username. Please use your email address to log in.'));
    }

    $user = get_user_by('email', $username);
    if ($user) {
        $username = $user->user_login;
    } else {
        return new WP_Error('invalid_email', __('No user found with this email address.'));
    }

    return wp_authenticate_username_password(null, $username, $password);
}
add_filter('authenticate', 'email_only_login_authenticate', 20, 3);
```

## ปิด Function การ Forgot Password ถ้าไม่จำเป็นต้องใช้

อันนี้เป็นเรื่องที่มีคนถูก Pentest (Penetration Testing) แล้วเจอมานะครับ ช่องทางนี้ก็เป็น 1 ในช่องทางที่สามารถถูกเจาะได้ครับ ดังนั้นเราควรที่จะปิดการใช้ Forgot Password ถ้าไม่จำเป็นครับ เราสามารถใช้ Snippet นี้แปะที่ functions.php ได้เลยครับ

```php
// Redirect Lost Password page to homepage or a custom page
function disable_lost_password_page() {
    if (isset($_GET['action']) && $_GET['action'] === 'lostpassword') {
        wp_redirect(home_url());
        exit();
    }
}
add_action('login_init', 'disable_lost_password_page');

// Hide "Forgot Password?" link with CSS
function custom_login_css() {
    echo '<style type="text/css">
        .login #nav a[href*="lostpassword"] {
            display: none !important;
        }
    </style>';
}
add_action('login_enqueue_scripts', 'custom_login_css');

// Disable password reset functionality
function disable_password_reset() {
    return false;
}
add_filter('allow_password_reset', 'disable_password_reset');

function disable_password_reset_message($message, $key) {
    return 'Password reset is disabled.';
}
add_filter('retrieve_password_message', 'disable_password_reset_message', 10, 2);
```
## ปิดเลข Version ของ WordPress และ Plugins

อันนี้ก็เป็นอีก 1 ช่องโหว่นะครับ เมื่อคนที่มาโจมตีเว็บเราเห็นว่าเว็บเราใช้ WordPress หรือ Plugin Version เก่า ซึ่งอาจจะเป็น Version ที่มีช่องโหว่ก็จะอาศัยช่องโหว่นั้นในการโจมตีเว็บเราได้นะครับ ดังนั้นในจุดนี้เราควรปิดไม่ให้คนอื่นเห็นครับ เราสามารถปิดได้โดยเอาการเอา Snippet นี้ไปแปะที่ functions.php ครับ

```php
// Remove version numbers from plugin styles and scripts
function remove_plugin_version_numbers($src) {
    if (strpos($src, 'ver=') !== false) {
        $src = remove_query_arg('ver', $src);
    }
    return $src;
}
add_filter('style_loader_src', 'remove_plugin_version_numbers', 9999);
add_filter('script_loader_src', 'remove_plugin_version_numbers', 9999);

// Remove WordPress version number
remove_action('wp_head', 'wp_generator');

// Remove WordPress version from RSS feeds
function remove_wp_version_rss() {
    return '';
}
add_filter('the_generator', 'remove_wp_version_rss');
```

ทีนี้ถ้าเราใช้ Yoast SEO อยู่ ตัว Yoast จะมีวิธีการแปะ Version ที่ไม่เหมือน Plugin อื่น เราสามารถเอา Snippet นี้ไปแปะที่ functions.php ได้เลยครับ

```php
// Remove Yoast SEO version number
add_filter('wpseo_debug_markers', '__return_false');
add_filter('wpseo_analytics_intro', '__return_false');
add_filter('wpseo_frontend_output', 'remove_wpseo_version', 10, 2);

function remove_wpseo_version($output, $version) {
    return preg_replace('/<!-- This site is optimized with the Yoast SEO .+ - Yoast SEO plugin v.+ - -->/', '', $output);
}

// Remove Yoast SEO meta tags
add_action('get_header', 'remove_wpseo_meta');
function remove_wpseo_meta() {
    remove_action('wp_head', array( 'WPSEO_Frontend', 'debug_mark' ), 2);
    remove_action('wp_head', array( 'WPSEO_Frontend', 'head' ), 1);
}

// Remove Yoast SEO comment
add_filter('wpseo_debug_markers', '__return_false');
```

## การเลือก Hosting และ Domain Registrar

เราก็ควรจะเลือก Hosting ที่มีชื่อเสียงและสามารถติดต่อ Support ได้อย่างทันท่วงทีและก็อาจจะใช้ Domain Registrar ที่สามารถช่วยเรากัน Spam เช่น [Cloudflare](https://www.cloudflare.com/) เป็นต้น

## หาก Setup ตัว Hosting เองระวังเรื่อง File Permissions

หากเราต้องตั้ง File Permissions เอง ระวังการตั้ง File Permissions ที่ทำให้คนเข้าถึงและแก้ไข File ของเราได้ง่าย เช่น อย่าตั้ง File Permissions เป็น 777 เป็นต้น

## อื่น ๆ

- ถ้าทำงานกับเว็บไซต์ภาครัฐ ต้อง Logout User ถ้า User คนนั้น ๆ Inactive เกิน 15 นาที สามารถใช้ Plugin [Inactive Logout](https://wordpress.org/plugins/inactive-logout/)
- อีกอย่างนึงคือการต้องกังวลเกี่ยวกับตัว User เองมากกว่า แบบ ไม่ตั้งรหัสผ่านที่เดาง่ายจนเกินไป หรือ ไม่แปะรหัสผ่านไว้ตาม Post-it หน้าคอมหรือใต้โต๊ะ

เท่านี้ก็น่าจะทำให้เว็บไซต์ WordPress ของทุกคนปลอดภัยแล้วครับ ^^ ใครสนใจ Meetup ดี ๆ แบบนี้สามารถติดตามได้ที่ [Meetup.com](https://www.meetup.com/bangkok-wordpress/) ได้เลยครับ ทีม WP Bangkok เขาจัดงานกันทุกเดือนครับ (ขอบคุณสำหรับงานดี ๆ แบบนี้ด้วยครับ)

ขอให้สนุกกับการใช้ WordPress

– นิล –