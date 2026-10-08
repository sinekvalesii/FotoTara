# S-Check Mimari Planı
Modüller: `app` (giriş, navigasyon, imzalama) → `feature:pos`, `feature:inventory`, `feature:ecommerce` (SattımGitti, plugin) → `core` (domain, data, auth/RBAC, Room, Firebase, DI).
Katmanlar: Compose UI → ViewModel (StateFlow) → UseCase → Repository (arayüz domain'de, impl data'da) → Room (tek doğruluk kaynağı) + Firestore (snapshot listener ile senkron).
Satış: Room transaction içinde stok düşümü (anında, offline), Firestore `runBatch` + `FieldValue.increment` ile buluta yazım.
RBAC: `Role.ADMIN` / `Role.STAFF`; Firestore `users/{uid}.role`; `HasPermission` ile UI + kurallar.
Plugin: `ScheckPlugin` arayüzü, Hilt `@IntoSet` ile kaydedilir; app menüsü set üzerinden oluşturulur.
Derleme: `./gradlew :app:bundleRelease` → R8 full mode, minify+shrinkResources, baseline profile (`app/src/main/baseline-prof.txt`).
İmza: `keystore.properties` (git dışı) veya env `SCHECK_KS_*`.
