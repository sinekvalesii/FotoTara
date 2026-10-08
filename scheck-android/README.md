# S-Check: POS ve Stok Takibi (Android)
Kotlin • Compose • Clean Architecture/MVVM • Hilt • Room • Firestore • CameraX + ML Kit. Mimari: `ARCHITECTURE.md`.

Kurulum: Firebase konsolundan `google-services.json` → `app/`; `firestore.rules` yayınla; admin kullanıcı için `users/{uid}` belgesine `role: "ADMIN"` yaz.
Yayın: `keystore.properties` (storeFile, storePassword, keyAlias, keyPassword) oluştur, `VERSION_CODE` artır, `./scripts/build-release.sh`.
Not: Mevcut uygulama `com.scheck.pos` ile yayındaysa aynı upload anahtarıyla imzalayın ve versionCode'u Play'deki sürümden büyük tutun.
