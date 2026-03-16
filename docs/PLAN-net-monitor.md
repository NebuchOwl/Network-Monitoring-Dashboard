# Proje Planı: Net-Monitor (Network Monitoring Dashboard)

## Hedef
Hızlı, güvenilir ve modern bir ağ izleme sistemi oluşturmak. Sistem, otomatik tarama (auto-discovery) ve manuel girişleri desteklemeli, hata toleranslı çalışmalı ve veri depolama verimliliği sağlamalıdır.

## 🛠 Teknoloji Yığını
- **Backend:** Python (FastAPI), SQLAlchemy (SQLite)
- **Frontend:** React, Tailwind CSS
- **Görev Yönetimi:** APScheduler
- **Ağ Mantığı:** icmplib (Async ICMP)
- **Bildirimler:** SMTP (Email)

## 📋 Görev Listesi

### Faz 1: Altyapı ve Veritabanı
- [x] **Görev 1:** Proje dizin yapısının kurulması ve backend bağımlılıklarının (FastAPI, SQLAlchemy, icmplib) hazırlanması. `@[backend-specialist]`
- [x] **Görev 2:** SQLite veritabanı şemasının (Devices, UptimeLogs) ve 30 günlük retention (temizlik) mantığının modellerinin oluşturulması. `@[backend-specialist]`
- [x] **Görev 3:** Veritabanı yönetim katmanı (CRUD işlemleri) ve temizlik scriptinin (`cleanup_task`) yazılması. `@[backend-specialist]`

### Faz 2: Tarama Motoru ve API
- [x] **Görev 4:** Asenkron Tarama Motoru: `icmplib` ile subnet tarama ve hata toleransı (Arka arkaya N başarısızlık kontrolü) mantığının kurulması. `@[backend-specialist]`
- [x] **Görev 5:** Otomatik keşfedilen (Auto-Discovery) cihazlar ile manuel eklenen cihazların entegrasyonu. `@[backend-specialist]`
- [x] **Görev 6:** FastAPI uç noktalarının (/devices, /logs, /stats) dokümante edilmiş (Swagger) şekilde geliştirilmesi. `@[backend-specialist]`

### Faz 3: Frontend ve Dashboard
- [x] **Görev 7:** React + Tailwind CSS ile Dashboard tasarımının (Karanlık mod odaklı, premium UI) ve cihaz kart bileşenlerinin oluşturulması. `@[frontend-specialist]`
- [x] **Görev 8:** Gerçek zamanlı veri senkronizasyonu (Polling veya WebSocket) ve durum grafiklerinin entegrasyonu. `@[frontend-specialist]`

### Faz 4: Bildirim ve Final Kontroller
- [x] **Görev 9:** SMTP tabanlı bildirim servisinin durum geçişlerine (Up -> Down) göre tetiklenmesi. `@[backend-specialist]`
- [ ] **Görev 10:** Final audit: Güvenlik taraması (`security_scan.py`), UX denetimi ve performans testi. `@[orchestrator]`

## 🏁 Tamamlanma Kriterleri (Done When)
- [x] Sistem belirlenen IP aralığını tarayıp cihazları otomatik listeliyor.
- [x] Manuel cihaz ekleme/silme işlemleri sorunsuz çalışıyor.
- [x] 30 günden eski loglar otomatik olarak temizleniyor.
- [x] Cihaz düştüğünde hata toleransı sonrası e-posta bildirimi gidiyor.
- [x] Frontend dashboard modern, hızlı ve duyarlı (responsive) bir deneyim sunuyor.

## Notlar
- Yönetici (Admin) yetkisi gerektiren ICMP paketleri için terminalin yetkili modda açılması unutulmamalıdır.
- SQLite veritabanı dosyasının taşıma kolaylığı için `backend/data/` altında tutulması önerilir.
