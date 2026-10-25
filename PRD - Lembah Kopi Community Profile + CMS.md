# PRD \- Lembah Kopi Community Profile \+ CMS

**Lembah Kopi Community Profile \& CMS** adalah sistem profil publik berbasis web dan panel manajemen konten sederhana yang dirancang khusus untuk mempublikasikan profil kelompok tani, showcase varietas kopi, dokumentasi video/sosial media, serta narasi aktivitas Kelompok Tani Lembah Kopi di Desa Glodogan\.

Saat ini, kelompok tani belum memiliki media publikasi resmi yang terpusat dan mudah diakses publik\. Di sisi lain, pengurus internal memiliki literasi digital yang minim sehingga tidak memungkinkan menggunakan CMS konvensional yang rumit \(seperti WordPress atau dashboard dengan konfigurasi tata letak dan HTML kompleks\)\. Oleh karena itu, platform ini mengadopsi pendekatan *form\-based inputs* esensial di mana pengurus cukup mengetik teks biasa, memilih opsi dropdown, mengunggah foto langsung dari kamera ponsel, atau menempel tautan \(*paste URL*\) media tanpa menyentuh kode teknis\.



**Tujuan Utama Sistem:**

1. **Showcase Profil \& Legalitas Komunitas:** Menyajikan identitas, narasi kelompok tani, dan kanal kontak resmi Desa Glodogan ke publik secara informatif dan profesional\.

2. **Katalog Produk Sederhana \(Showcase \& Direct Inquiries\):** Menampilkan etalase varietas kopi unggulan beserta status ketersediaan yang langsung terhubung ke tautan percakapan WhatsApp pengurus tanpa kerumitan modul checkout/e\-commerce\.

3. **Penyematan Media Ramah Pengguna Awam:** Memungkinkan pengurus menampilkan video YouTube dan konten Instagram hanya dengan menempelkan tautan \(URL\) biasa\.

4. **Panel CMS Sederhana \(Fool\-Proof Panel\):** Menyediakan portal admin terproteksi yang membatasi input pada komponen\-komponen esensial dengan kompresi gambar otomatis di sisi server\.



Sistem ini diakses secara terbuka oleh **Masyarakat Umum / Publik** melalui portal web profil, serta diakses secara internal oleh **Admin Kelompok Tani** melalui portal CMS\.



## **Modul 1: Profil Komunitas \& Tampilan Utama \(Hero \& About\)**

### M1\.1 — Pengaturan Header \& Banner Utama \(Hero Section\)

Sub\-modul ini mengelola penyajian visual pembuka di beranda publik yang memuat nama komunitas, slogan singkat, foto latar belakang, dan tombol aksi utama menuju WhatsApp\.

**F1\.1\.1 — Tampilan Banner \& Slogan:** Menampilkan judul besar, slogan komunitas, foto spanduk utama, dan tombol tautan cepat ke narahubung\.

**F1\.1\.2 — Pembaruan Banner \& Teks Hero:** Mengubah foto latar beranda, teks judul, slogan singkat, dan nomor tujuan kontak melalui formulir CMS\.



### M1\.2 — Profil Narasi \& Nilai Komunitas \(About Section\)

Sub\-modul ini mengelola penyajian ringkasan cerita sejarah kelompok tani, komitmen terhadap lingkungan di Desa Glodogan, serta tiga poin nilai utama kelompok tani\.

**F1\.2\.1 — Showcase Cerita \& Nilai Komunitas:** Menampilkan deskripsi profil komunitas \(2\-3 paragraf\) dan 3 poin keunggulan/nilai komunitas di antarmuka publik\.

**F1\.2\.2 — Form Edit Narasi \& Nilai:** Mengubah teks cerita kelompok tani serta mengedit 3 judul dan deskripsi singkat nilai komunitas lewat kolom teks standar tanpa konfigurasi HTML\.



## **Modul 2: Katalog Kopi Sederhana \(Showcase \& Inquiry\)**

### M2\.1 — Manajemen Showcase Varietas Kopi

Sub\-modul ini mengelola etalase produk biji kopi lokal tanpa sistem keranjang belanja atau transaksi digital, berfokus murni pada perkenalan varietas dan metode pengolahan\.

**F2\.1\.1 — Grid Showcase Biji Kopi Publik:** Menampilkan kartu\-kartu varietas kopi yang memuat foto, nama produk, jenis varietas, proses olahan, dan lencana status ketersediaan\.

**F2\.1\.2 — Integrasi Direct WhatsApp Inquiry:** Tombol pemesanan/tanya pada setiap kartu kopi publik yang membuka percakapan WhatsApp secara langsung dengan draf template pesan otomatis \(misal: *“Halo Pengurus Lembah Kopi, saya ingin tanya ketersediaan kopi: \[Nama Kopi\]”*\)\.

**F2\.1\.3 — Form Entri Produk CMS:** Menambah, memperbarui, dan menghapus kartu kopi menggunakan input minimal \(nama, pilihan varietas, proses, foto, dan status ketersediaan\)\.



## **Modul 3: Integrasi Media \& Agenda Komunitas**

### M3\.1 — Embed Video YouTube \& Tautan Postingan Instagram

Sub\-modul ini mengelola penyematan konten video edukasi/dokumentasi dan postingan sosial media di beranda publik tanpa mengharuskan admin menyalin tag iframe atau mengonfigurasi Meta Developer API\.

**F3\.1\.1 — Ekstraksi URL YouTube Otomatis:** Admin hanya menempelkan tautan video standar \(misal: [`https://www.youtube.com/watch?v=xxxx`](https://www.youtube.com/watch?v=xxxx) atau [`https://youtu.be/xxxx`](https://youtu.be/xxxx)\), sistem secara otomatis mengekstrak *Video ID* dan menampilkannya sebagai pemutar video responsif di web publik\.

**F3\.1\.2 — Penyematan Postingan Instagram:** Menyematkan postingan sorotan via tautan publik \(misal: [`https://www.instagram.com/p/xxxx/`](https://www.instagram.com/p/xxxx/)\) yang dirender otomatis sebagai pratinjau kartu media\.

**F3\.1\.3 — Sakelar Penayangan Media:** Mengatur penayangan atau penyembunyian widget media YouTube dan Instagram tanpa perlu menghapus tautan yang telah disimpan\.



### M3\.2 — Agenda \& Pengumuman Ringkas

Sub\-modul ini mengelola penyampaian agenda kegiatan terdekat \(seperti jadwal panen raya, pelatihan budidaya, atau kunjungan studi banding\)\.

**F3\.2\.1 — Showcase Agenda Terkini:** Menampilkan daftar maksimal 3 kegiatan terdekat di beranda publik secara ringkas\.

**F3\.2\.2 — Manajemen Agenda di CMS:** Menambah atau menghapus pengumuman kegiatan dengan isian: Judul Agenda, Tanggal Pelaksanaan, dan Keterangan Singkat \(1 kalimat\)\.

**F3\.2\.3 — Auto\-Archive Kegiatan:** Menyembunyikan kartu agenda secara otomatis dari tampilan beranda publik apabila tanggal pelaksanaan telah terlewati\.



### M3\.3 — Galeri Foto Aktivitas Tani

Sub\-modul ini mengelola grid album dokumentasi foto kegiatan petani di kebun dan stasiun penjemuran kopi\.

**F3\.3\.1 — Grid Galeri Web Publik:** Menampilkan 6 hingga 8 foto dokumentasi terbaik di antarmuka publik\.

**F3\.3\.2 — Unggah \& Kompresi Foto Otomatis:** Mengunggah foto dari penyimpanan ponsel pengurus dengan kompresi otomatis ke format WebP di sisi server guna menjaga kecepatan muat situs web\.



## **Modul 4: Informasi Kontak \& Akses Pengurus**

### M4\.1 — Informasi Kontak \& Footer

Sub\-modul ini mengelola rincian kontak sekretariat, akun media sosial komunitas, dan nomor telepon WhatsApp resmi pengurus\.

**F4\.1\.1 — Footer Kontak Publik:** Menampilkan alamat sekretariat kelompok tani di Desa Glodogan, nomor WhatsApp aktif, dan tautan akun media sosial resmi\.

**F4\.1\.2 — Pembaruan Kontak Sekretariat:** Mengubah nomor telepon, alamat, dan link akun sosial media pengurus melalui satu formulir sederhana\.



### M4\.2 — Autentikasi Admin Terproteksi

Sub\-modul ini mengelola akses masuk pengurus ke panel CMS menggunakan kombinasi username dan kata sandi yang aman dengan sesi berbasis token\.

**F4\.2\.1 — Form Login Sederhana:** Autentikasi pengurus kelompok tani menggunakan kredensial terenkripsi \(bcrypt\)\.

**F4\.2\.2 — Manajemen Kata Sandi:** Memperbarui kata sandi admin secara mandiri dari dalam panel\.



