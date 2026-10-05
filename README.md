# Servisteyim

Türkiye odaklı lojistik pazar yeri — yük, araç, iş, rota maliyeti, belge ve güven tek uygulamada. React + Vite + Tailwind, PWA, mobil öncelikli.

## Çalıştırma

```bash
npm install
npm run dev      # geliştirme
npm run build    # dist/ klasörüne üretim derlemesi
```

`main` dalına her push'ta GitHub Pages'e otomatik yayın yapılır (`.github/workflows/deploy.yml`). Depo ayarlarında **Settings → Pages → Source: GitHub Actions** seçili olmalıdır.

## Demo girişler

| Rol | Giriş | Kod |
|---|---|---|
| Şoför (Mehmet Kaya) | 0555 555 55 55 | 123456 (DEMO OTP) |
| Yönetici | admin@servisteyim.demo | 123456 (DEMO OTP) |

Başka bir 05XX numarası yeni kullanıcı oluşturur. Gerçek SMS gönderilmez.

## Yapı

- `src/data.js` — demo veriler ve **ComplianceRules** (belge şartları, araç/rota kısıtları, U-ETDS alanları). Mevzuat değişince yalnızca burası güncellenir.
- `src/lib.js` — localStorage veri katmanı, oturum, OTP deneme sınırı, maskeleme, rota/maliyet motoru, metinden arama, eşleştirme skoru, güven profili.
- `src/App.jsx` — kabuk, ana sayfa, arama/filtre, ilan kartı/detayı, ilan sihirbazı.
- `src/screens.jsx` — giriş, mesajlaşma, teklif, operasyon özeti, iş emri, U-ETDS hazırlık, profil, araç, belgeler, bildirimler, Gizlilik Merkezi.
- `src/Admin.jsx` — yönetim paneli: ilanlar, kullanıcılar, şikâyetler, belgeler, sponsorlu ilanlar, iş emirleri, rota ücretleri, akaryakıt, veri kaynakları, KVKK talepleri, ayarlar, işlem kayıtları (CSV).

## Güvenlik notları

- Kullanıcı metinleri temizlenir ve hiçbir zaman HTML olarak işlenmez; üretim derlemesinde sıkı CSP vardır.
- T.C. kimlik/VKN tam hâliyle saklanmaz (yalnızca son haneler); telefon ve plaka herkese açık alanlarda maskelenir.
- Rol tabanlı erişim, yönetici oturumu 1 saat; 5 hatalı OTP'de 60 sn kilit; tüm yönetici işlemleri işlem kaydına yazılır.
- **Bu sürüm sunucusuz bir demodur.** Veriler tarayıcıda tutulur; gerçek yayında kimlik doğrulama, yetkilendirme, işlem kayıtları ve veri saklama sunucu tarafına taşınmalıdır.

## Sınırlar

Ücret ve yakıt fiyatları DEMO VERİ'dir; resmî belge doğrulaması, U-ETDS bildirimi ve ödeme yoktur. Uygulama mevzuat gereksinimleri dikkate alınarak tasarlanmıştır; ticari yayından önce KVKK, e-ticaret, ödeme, özel istihdam ve karayolu taşımacılığı konularında hukuki inceleme gereklidir.
