<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f5f5f4; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden;">
        
        <!-- Header -->
        <tr><td style="background:#111111; padding:32px; text-align:center;">
          <div style="display:inline-block; background:#FFD400; width:48px; height:48px; border-radius:12px; line-height:48px; text-align:center;">
            <span style="font-size:24px;">🔧</span>
          </div>
          <h1 style="color:#ffffff; font-size:24px; margin:12px 0 0;">GEARBOX</h1>
        </td></tr>
        
        <!-- Body -->
        <tr><td style="padding:40px 32px;">
          <h2 style="color:#111111; font-size:20px; margin:0 0 8px;">Halo, {{ $user->name }}!</h2>
          <p style="color:#6B6B6B; font-size:14px; line-height:1.6; margin:0 0 24px;">
            Terima kasih telah mendaftar di GEARBOX. Silakan klik tombol di bawah untuk memverifikasi alamat email Anda.
          </p>
          
          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="{{ $verifyUrl }}" style="display:inline-block; background:#FFD400; color:#111111; font-size:16px; font-weight:bold; text-decoration:none; padding:14px 40px; border-radius:12px;">
                Verifikasi Email Saya
              </a>
            </td></tr>
          </table>
          
          <p style="color:#6B6B6B; font-size:12px; line-height:1.6; margin:24px 0 0;">
            Link ini akan kedaluwarsa dalam 60 menit. Jika Anda tidak merasa mendaftar, abaikan email ini.
          </p>
          
          <hr style="border:none; border-top:1px solid #e5e5e5; margin:24px 0;"/>
          
          <p style="color:#9CA3AF; font-size:11px; margin:0;">
            Jika tombol tidak bisa diklik, salin link berikut ke browser:<br/>
            <a href="{{ $verifyUrl }}" style="color:#FFD400; word-break:break-all;">{{ $verifyUrl }}</a>
          </p>
        </td></tr>
        
        <!-- Footer -->
        <tr><td style="background:#f5f5f4; padding:20px 32px; text-align:center;">
          <p style="color:#9CA3AF; font-size:11px; margin:0;">
            &copy; 2026 GEARBOX. Solusi booking service kendaraan yang cepat, mudah, dan terpercaya.
          </p>
        </td></tr>
        
      </table>
    </td></tr>
  </table>
</body>
</html>
