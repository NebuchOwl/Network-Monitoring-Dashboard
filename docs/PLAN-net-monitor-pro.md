# Proje Geliştirme Planı: Net-Monitor Pro

## Hedef
Mevcut ağ izleme sistemini "ilkel" seviyeden çıkarıp, otomatik keşif, çok kanallı bildirimler ve detaylı veri görselleştirme özellikleriyle profesyonel bir seviyeye taşımak.

## 🛠 Yeni Teknoloji İhtiyaçları
- **Frontend Veri Görselleştirme:** `recharts` (Gecikme grafikleri için)
- **Backend Webhooks:** `httpx` veya `requests` (Discord/Telegram bildirimleri için)

## 📋 Görev Listesi

### Faz 1: Backend Geliştirmeleri (Cihaz & Bildirim Yönetimi)
- [x] **Görev 1:** Cihaz silme (`DELETE /devices/{id}`) endpoint'inin eklenmesi. `@[backend-specialist]`
- [x] **Görev 2:** Ayarlar tablosu/modelinin oluşturulması (SMTP Ayarları, Subnet Aralığı, Webhook URL'leri). `@[database-architect]`
- [x] **Görev 3:** Otomatik Keşif Modülü: Belirlenen subnet üzerinde aktif cihazları bulup veritabanına otomatik ekleyen görev. `@[backend-specialist]`
- [x] **Görev 4:** Çok Kanallı Bildirim Sistemi: Up/Down durumlarında Discord, Telegram ve Slack webhook'larını tetikleyen servis. `@[backend-specialist]`

### Faz 2: Frontend Geliştirmeleri (Zengin Kullanıcı Deneyimi)
- [x] **Görev 5:** `DeviceCard` bileşenine "Sil" (Çöp kutusu ikonu) butonu ve onay mekanizması eklenmesi. `@[frontend-specialist]`
- [x] **Görev 6:** Cihaz Detay Modalı: Bir karta tıklandığında açılan ve son 24 saatlik gecikme verilerini `recharts` ile grafik olarak sunan arayüz. `@[frontend-specialist]`
- [x] **Görev 7:** Ayarlar Paneli: Subnet aralığı, tarama sıklığı ve bildirim kanallarını (Discord/Mail) yönetebileceğiniz görsel arayüz. `@[frontend-specialist]`

### Faz 3: Entegrasyon ve Optimizasyon
- [x] **Görev 8:** 24 saatlik latency history verisini API üzerinden optimize edilmiş şekilde çekme (Aggregation). `@[backend-specialist]`
- [x] **Görev 9:** UI/UX Polish: Geçiş animasyonları, gelişmiş hata mesajları ve mobil uyumluluk kontrolleri. `@[frontend-specialist]`
- [ ] **Görev 10:** Final Test: Otomatik keşif, silme ve webhook bildirimlerinin uçtan uca doğrulanması. `@[orchestrator]`

## 🏁 Tamamlanma Kriterleri (Done When)
- [x] Yeni cihazlar ağda görüldüğünde otomatik olarak listeye düşüyor.
- [x] Cihazlar arayüzden tek tıkla silinebiliyor.
- [x] Cihaz detayında son 24 saatin akıcı gecikme grafiği izlenebiliyor.
- [x] Durum değişiklikleri Discord/Telegram/Mail üzerinden anlık bildiriliyor.
- [x] Tüm sistem ayarları kod yazmadan Dashboard üzerinden yönetilebiliyor.

## Notlar
- Otomatik tarama işlemi ARP tespiti veya ICMP Sweep ile yapılacaktır.
- Grafik verileri için her dakika olan loglar yerine saatlik ortalamalar veya önemli sapmalar gösterilecektir.
