// ═══════════════════════════════════════════════════════
// LANGUAGE SYSTEM — Full App i18n
// ═══════════════════════════════════════════════════════
var _LANG_KEY = 'chitask_lang';

var _STRINGS = {
  id: {
    // ── Splash ──
    splash_sub: 'Task · Keuangan · Hidup',
    // ── Login ──
    login_sub: 'Task Manager · Keuangan · Maintenance<br>Data tersimpan aman di cloud ☁️',
    login_google: 'Masuk dengan Google',
    login_guest: 'Coba dulu tanpa login',
    login_guest_note: 'Data disimpan di perangkat ini saja &mdash; <b>tidak bisa sync</b> ke perangkat lain. Bisa upgrade ke akun Google kapan saja.',
    // ── Sidebar nav sections ──
    nav_sec_task: '📋 Task',
    nav_sec_fin: '💰 Keuangan',
    nav_sec_maint: '🔧 Maintenance',
    nav_sec_journal: '📓 Jurnal',
    // ── Sidebar nav items ──
    nav_dashboard: 'Dashboard',
    nav_myday: 'My Day',
    nav_important: 'Penting',
    nav_planned: 'Terjadwal',
    nav_calendar: 'Kalender',
    nav_habits: 'Habits',
    nav_shop: 'Toko',
    nav_achievements: 'Pencapaian',
    nav_fin_overview: 'Overview',
    nav_fin_cashflow: 'Cash Flow',
    nav_fin_transactions: 'Transaksi',
    nav_fin_wallets: 'Dompet',
    nav_fin_wishlist: 'Wishlist',
    nav_fin_tagihan: 'Tagihan',
    nav_fin_hutang: 'Hutang',
    nav_fin_categories: 'Kategori',
    nav_fin_budget: 'Budget',
    nav_maint_overview: 'Overview',
    nav_maint_all: 'Semua Item',
    nav_maint_log: 'Riwayat',
    nav_maint_categories: 'Kelola Kategori',
    nav_journal_today: 'Hari Ini',
    nav_journal_calendar: 'Kalender',
    nav_journal_all: 'Semua Entry',
    nav_journal_search: 'Search',
    nav_settings: 'Settings',
    nav_install: 'Install App',
    // ── Bottom nav ──
    bn_fin: 'Keuangan',
    bn_journal: 'Jurnal',
    bn_maint: 'Maintenance',
    // ── Subdrawer labels ──
    sdi_all: 'Semua Task',
    sdi_completed: 'Selesai',
    sdi_fin_header: '💰 Keuangan',
    sdi_journal_write: 'Tulis Jurnal Hari Ini',
    sdi_journal_header: '📓 Jurnal',
    sdi_maint_header: '🔧 Maintenance',
    sdi_install: '📲 Install App',
    sdi_settings: '⚙️ Settings',
    // ── Page titles ──
    title_dashboard: '🏠 Dashboard',
    title_myday: '☀️ My Day',
    title_important: '⭐ Penting',
    title_planned: '📅 Terjadwal',
    title_habits: '🔥 Habit Tracker',
    title_all: '📋 Semua Task',
    title_completed: '✅ Selesai',
    title_achievements: '🏆 Pencapaian',
    title_calendar: '🗓 Kalender',
    title_fin_overview: '📈 Overview Keuangan',
    title_fin_cashflow: '💸 Cash Flow',
    title_fin_transactions: '📒 Transaksi',
    title_fin_wallets: '👛 Dompet & Wallet',
    title_fin_wishlist: '🎯 Wishlist',
    title_fin_tagihan: '🧾 Tagihan',
    title_fin_hutang: '🤝 Hutang & Piutang',
    title_fin_categories: '🏷️ Kelola Kategori',
    title_fin_budget: '💰 Budget per Kategori',
    title_maint_overview: '🔧 Overview Maintenance',
    title_maint_all: '📋 Semua Item Maintenance',
    title_maint_log: '📜 Riwayat Maintenance',
    title_maint_categories: '⚙️ Kelola Kategori Maintenance',
    title_journal_today: '✍️ Jurnal Hari Ini',
    title_journal_calendar: '🗓 Kalender Jurnal',
    title_journal_all: '📓 Semua Entry',
    title_journal_search: '🔍 Search Jurnal',
    // ── Page subtitles ──
    sub_dashboard: 'Ringkasan harian keuangan, habit, dan task',
    sub_myday: 'Fokus pada hari ini',
    sub_important: 'Task yang kamu tandai penting',
    sub_planned: 'Semua task dengan jadwal',
    sub_habits: 'Pantau dan bangun kebiasaan positif',
    sub_all: 'Semua task aktif dan selesai',
    sub_completed: 'Task yang telah kamu selesaikan',
    sub_achievements: 'Pencapaian yang sudah kamu raih',
    sub_calendar: 'Klik tanggal untuk melihat & menambah task',
    sub_fin_overview: 'Ringkasan keuangan bulanan',
    sub_fin_cashflow: 'Aliran kas masuk & keluar',
    sub_fin_transactions: 'Riwayat semua transaksi',
    sub_fin_wallets: 'Kelola dompet & saldo',
    sub_fin_wishlist: 'Targetkan impian finansialmu',
    sub_fin_tagihan: 'Pantau & bayar tagihan rutin',
    sub_fin_hutang: 'Kelola hutang dan cicilan',
    sub_fin_categories: 'Tambah, edit, hapus kategori transaksi',
    sub_fin_budget: 'Set limit pengeluaran per kategori per bulan',
    sub_maint_overview: 'Pantau semua jadwal perawatan',
    sub_maint_all: 'Daftar lengkap item maintenance',
    sub_maint_log: 'Riwayat semua maintenance yang dilakukan',
    sub_maint_categories: 'Tambah dan kelola kategori kendaraan/aset',
    sub_journal_today: 'Catat pikiran dan perasaanmu',
    sub_journal_calendar: 'Klik tanggal untuk buka jurnal',
    sub_journal_all: 'Semua entri jurnal harian',
    sub_journal_search: 'Cari by kata kunci atau tag',
    // ── Add bar ──
    placeholder_task: 'Tambah task atau habit baru...',
    placeholder_task_mobile: 'Nama task atau habit...',
    btn_add_task: '+ Tambah',
    btn_add_task_mobile: '＋ Tambah Task',
    // ── Guest username modal ──
    guest_username_title: 'Halo! Siapa namamu? 👋',
    guest_username_sub: 'Nama ini akan ditampilkan di sidebar. Bisa diganti kapan saja.',
    guest_username_placeholder: 'Masukkan namamu...',
    guest_username_btn: '✓ Mulai Pakai ChiTask',

    // ── Tour ──
    tour_step_badge: 'Langkah {0} dari {1}',
    tour_skip: 'Lewati tutorial',
    tour_skip_confirm: 'Lewati tutorial? Kamu bisa lihat lagi nanti di Settings.',
    tour_prev: '← Prev',
    tour_next: 'Mulai →',
    tour_finish: '🎉 Selesai!',
    // ── Settings modal ──
    settings_nav_title: 'Pilih Tampilan Navigasi',
    settings_nav_sub: 'Pilih cara kamu mau mengakses menu di perangkat mobile',
    settings_drawer_name: 'Bottom Drawer',
    settings_drawer_desc: 'Tab bawah + sub-menu pop-up. Akses satu tangan.',
    settings_sidebar_name: 'Side Drawer',
    settings_sidebar_desc: 'Sidebar geser dari kiri. Semua menu sekaligus.',
    settings_gami_title: 'Gamifikasi',
    settings_gami_sub: 'Aktifkan untuk Gamer Mode (boss, radar chart)',
    settings_gami_review: '↩ Lihat ulang pilihan mode',
    settings_lang_label: '🌐 Bahasa / Language',
    settings_lang_id: '🇮🇩 Indonesia',
    settings_lang_en: '🇬🇧 English',
    btn_close: 'Tutup',
    btn_apply_nav: '✓ Simpan Setting',
    settings_hint: 'Bisa diubah kapan saja di ⚙️ Settings',
    // ── Sync / save ──
    saved: '✓ Tersimpan',
    sync_activate: '☁️ Aktifkan sync → Masuk dengan Google',
    confirm_logout: 'Yakin mau logout?',
    btn_logout: 'Logout',
    // ── Mobile sidebar mode badge ──
    nav_mode_drawer: 'Bottom Drawer',
    nav_mode_sidebar: 'Side Drawer',
    // ── Subdrawer section headers ──
    sdi_task_header: '📋 Task',
    sdi_journal_header_daily: '📓 Jurnal Harian',
    sdi_journal_menu_label: 'Menu Jurnal',
    sdi_journal_edit: '✏️ Edit Jurnal Hari Ini',
    // ── Mobile chips ──
    chip_important: '⭐ Penting',
    chip_habit: '🔥 Habit',
    chip_shopping: '🛒 Belanja',
    chip_nodue: '📌 No Due',
    // ── Mobile maintenance add bar ──
    maint_add_bar_label: 'Tambah Item Maintenance',
    maint_add_item_btn: '+ Tambah Item',
    maint_add_form_title: '➕ Tambah Item Maintenance',
    maint_add_wishlist_title: '🎯 Tambah Item Wishlist',
    // ── Modal label ──
    modal_important_label: '⭐ Penting?',
    // ── Dashboard journal CTA ──
    dash_journal_write: '📝 Tulis Jurnal',
    // ── Nav onboarding (first-time) ──
    onb_nav_badge: 'Preferensi Pertama Kali',
    onb_nav_title: 'Pilih Tampilan<br>Navigasi Kamu',
    onb_nav_hint: 'Bisa diganti kapan saja di ⚙️ Settings',
    onb_drawer_name: 'Bottom Drawer',
    onb_drawer_desc: 'Tab bawah + sub-menu pop-up. Akses cepat ibu jari.',
    onb_drawer_tag1: 'Satu tangan',
    onb_drawer_tag2: 'Ringan',
    onb_sidebar_name: 'Side Drawer',
    onb_sidebar_desc: 'Sidebar geser dari kiri. Semua menu sekaligus.',
    onb_sidebar_tag1: 'Desktop-like',
    onb_sidebar_tag2: 'Lengkap',
    onb_nav_confirm_placeholder: 'Pilih tampilan dulu ↑',
    onb_nav_confirm_drawer: '✓ Pakai Bottom Drawer',
    onb_nav_confirm_sidebar: '✓ Pakai Side Drawer',
    onb_nav_footer: 'Preferensi tersimpan di perangkat ini · Bisa diubah di Settings',
    // ── Gami onboarding ──
    onb_gami_badge: 'Pilih Gaya Produktivitasmu',
    onb_gami_title: 'Kamu orangnya<br>tipe yang mana?',
    onb_gami_hint: 'XP & Gold tetap ada di keduanya · Bisa ganti di ⚙️ Settings',
    onb_gami_note_bold: 'XP dan Gold selalu ada di keduanya',
    onb_gami_note_body: '— dipakai untuk naik level dan beli tema di Toko. Bedanya hanya di tampilan ekstra: Boss Battle dan Radar Chart.',
    onb_gami_note_footer: 'Bisa diubah kapan saja di ⚙️ Settings → Gamifikasi',
    onb_focus_name: '🎯 Fokus Produktif',
    onb_focus_desc: 'Tampilan bersih. Fokus ke task, habit, dan progress kamu.',
    onb_focus_tag1: '⚡ XP & Level',
    onb_focus_tag2: '🪙 Gold',
    onb_focus_tag3: '🏆 Pencapaian',
    onb_gamer_name: '🎮 Seru + Produktif',
    onb_gamer_desc: 'Lawan Boss, lihat radar skill kamu, dan jadikan produktivitas seperti game RPG!',
    onb_gamer_tag1: '⚔️ Boss Battle',
    onb_gamer_tag2: '🕸 Radar Chart',
    onb_gamer_tag3: '⚡ XP & Gold',
    onb_gami_confirm_placeholder: 'Pilih tipe kamu dulu ↑',
    onb_gami_confirm_focus: '✓ Mulai Fokus Produktif',
    onb_gami_confirm_gamer: '✓ Mulai Petualangan!',
    onb_gami_footer: 'Preferensi tersimpan · Bisa diubah di Settings',
    // ── Gami mode labels ──
    gami_mode_gamer: '🎮 Gamer Mode Aktif',
    gami_mode_focus: '🎯 Fokus Mode Aktif',
    // ── Tour steps ──
    tour_welcome_title: 'Selamat datang di ChiTask!',
    tour_welcome_desc: 'Kamu baru aja masuk ke app produktivitas all-in-one yang bisa bantu kamu kelola <b>tugas</b>, <b>keuangan</b>, <b>kebiasaan</b>, dan <b>jurnal</b> harian — semuanya di satu tempat.',
    tour_cloud_title: 'Data kamu aman di cloud',
    tour_cloud_desc: 'Karena kamu login pakai Google, semua data otomatis tersimpan di cloud dan bisa diakses dari device manapun. Tidak perlu khawatir data hilang!',
    tour_install_title: 'Install ke Home Screen',
    tour_install_desc: 'ChiTask bisa di-install seperti app beneran! Di <b>Chrome</b>: tap ⋮ → <i>Tambahkan ke layar utama</i>. Di <b>Safari</b>: tap ↑ → <i>Add to Home Screen</i>. Pengalaman jauh lebih nyaman!',
    tour_boss_title: 'Boss Battle',
    tour_boss_desc: 'Setiap task yang kamu selesaikan <b>menyerang Boss</b> ini! Kalahkan boss untuk dapat reward XP & Gold ekstra. Boss ganti setiap hari — jaga terus damage-mu! (Bisa diaktifkan di ⚙️ Settings → Gamifikasi)',
    tour_ready_title: 'Siap produktif!',
    tour_ready_desc: 'Selamat, kamu udah kenal semua fitur utama ChiTask! Mulai catat task pertamamu dan jadikan hari ini lebih produktif. <b>Semangat! 💪</b>',
    tour_sidebar_btn_title: 'Tombol Buka Sidebar',
    tour_sidebar_btn_desc: 'Tap tombol <b>☰</b> ini — atau geser dari pinggir kiri layar — untuk membuka sidebar. Semua navigasi ChiTask ada di sana!',
    tour_add_task_title: 'Tambah Task Baru',
    tour_add_task_desc: 'Tap tombol ini di bagian atas halaman untuk menambah task baru. Bisa set sebagai Habit 🔥, tandai Penting ⭐, Belanja 🛒, atau atur pengulangan dan deadline.',
    tour_habit_title: 'Habit Tracker',
    tour_habit_desc: 'Semua task bertipe <b>Habit</b> muncul di panel ini. Centang setiap hari untuk menjaga streak dan lihat persentase keberhasilanmu!',
    tour_xp_title: 'XP & Level',
    tour_xp_desc_sidebar: 'Setiap task yang kamu selesaikan memberi <b>XP</b>. Kumpulkan XP untuk naik level dan buka achievement baru!',
    tour_xp_desc_drawer: 'Setiap task yang kamu selesaikan memberi <b>XP (Experience Points)</b>. Kumpulkan XP untuk naik level dan buka achievement baru! Geser dari <b>kiri layar</b> untuk melihat XP bar di sidebar.',
    tour_xp_desc_desktop: 'Setiap task yang kamu selesaikan memberi <b>XP (Experience Points)</b>. Kumpulkan XP untuk naik level dan buka achievement baru! Level kamu tampil di XP bar ini.',
    tour_gold_title: 'Gold & Toko',
    tour_gold_desc_sidebar: 'Kamu juga dapat <b>Gold 🪙</b> tiap menyelesaikan task. Tukar Gold dengan tema visual baru dan item keren di <b>Toko</b>.',
    tour_gold_desc_drawer: 'Selain XP, kamu juga dapat <b>Gold 🪙</b> tiap menyelesaikan task. Gold bisa ditukar dengan <b>tema baru</b>, efek visual keren, dan item lainnya di Toko. Cek di menu Task!',
    tour_gold_desc_desktop: 'Selain XP, kamu juga dapat <b>Gold</b> tiap menyelesaikan task. Gold bisa ditukar dengan <b>tema visual</b> baru, efek partikel keren, dan item lainnya di Toko.',
    tour_nav_task_title: 'Navigasi Task',
    tour_nav_task_desc: 'Di sini ada semua menu Task — <b>My Day</b>, <b>Terjadwal</b>, <b>Kalender</b>, <b>Habits</b>, <b>Dashboard</b>, dan <b>Pencapaian</b>.',
    tour_nav_task_desc_desktop: 'Di sidebar ini ada semua menu Task — <b>My Day</b>, <b>Terjadwal</b>, <b>Kalender</b>, <b>Habits</b>, <b>Dashboard</b>, dan <b>Pencapaian</b>. Klik untuk perluas.',
    tour_nav_task_desc_drawer: 'Tap tombol ini untuk membuka sub-drawer menu Task — Dashboard, Toko, Pencapaian, dan lainnya. Tap <b>Lanjut →</b> untuk lihat isinya!',
    tour_shop_title: 'Toko',
    tour_shop_desc: 'Gold yang kamu kumpulkan bisa ditukar di sini! Beli <b>tema visual</b> baru, efek partikel keren, dan item lainnya.',
    tour_shop_desc_drawer: 'Tukar Gold yang kamu kumpulkan di sini untuk beli tema visual baru, efek partikel, dan item keren lainnya!',
    tour_dashboard_title: 'Dashboard',
    tour_dashboard_desc: 'Lihat ringkasan semua aktivitasmu — task, keuangan, habit streak, level XP, radar chart, dan grafik cashflow dalam satu layar.',
    tour_dashboard_desc_desktop: 'Lihat ringkasan semua aktivitasmu dalam satu layar — task, keuangan, habit streak, level XP, radar chart statistik, dan grafik progress cashflow.',
    tour_achievements_title: 'Pencapaian',
    tour_achievements_desc: 'Setiap milestone — task selesai, streak panjang, level baru — tercatat sebagai <b>achievement</b>. Kumpulkan semuanya!',
    tour_achievements_desc_desktop: 'Setiap milestone yang kamu capai — task selesai, streak panjang, level baru — tercatat di sini sebagai <b>achievement</b>. Kumpulkan semuanya!',
    tour_fin_title: 'Keuangan',
    tour_fin_desc: 'Catat <b>pemasukan & pengeluaran</b>, kelola beberapa dompet, track <b>wishlist</b>, tagihan rutin, dan hutang/piutang.',
    tour_fin_title_drawer: 'Menu Keuangan',
    tour_fin_desc_drawer: 'Tap untuk buka modul keuangan. Catat <b>pemasukan & pengeluaran</b>, kelola beberapa dompet, track <b>wishlist</b>, tagihan rutin, dan hutang/piutang.',
    tour_fin_desc_desktop: 'Klik untuk buka modul keuangan. Catat <b>pemasukan & pengeluaran</b>, kelola beberapa dompet, track <b>wishlist</b>, tagihan rutin, dan hutang/piutang.',
    tour_journal_title: 'Jurnal',
    tour_journal_desc: 'Tulis jurnal harian dengan <b>mood tracker</b> dan tag. Ada fitur streak biar kamu konsisten menulis, plus search untuk cari catatan lama.',
    tour_journal_title_drawer: 'Menu Jurnal',
    tour_maint_title: 'Maintenance',
    tour_maint_desc: 'Reminder perawatan rutin — servis kendaraan, bayar tagihan berkala, dll. Set interval hari dan ChiTask otomatis ingatkan kamu saat jatuh tempo.',
    tour_maint_title_drawer: 'Menu Maintenance',
    tour_maint_desc_drawer: 'Reminder untuk perawatan rutin — servis kendaraan, bayar tagihan berkala, dll. Set interval hari dan ChiTask akan otomatis ingatkan kamu saat jatuh tempo.',
    tour_account_title: 'Akun & Logout',
    tour_account_desc: 'Di sini tampil foto dan nama akunmu. Tap <b>Logout</b> untuk keluar — data tetap aman di cloud! Tap <b>⚙️ Settings</b> di sidebar untuk ganti tema atau mode.',
    tour_account_desc_desktop: 'Di sini tampil foto dan nama akunmu. Klik <b>Logout</b> untuk keluar — tapi tenang, semua data tersimpan di cloud dan bisa diakses kapanpun setelah login lagi.',
    tour_account_title_drawer: 'Akun & Sidebar',
    tour_account_desc_drawer: 'Geser dari <b>kiri layar</b> untuk buka sidebar. Di sana ada XP bar, Gold, info akun Google kamu, dan tombol Logout. Tap <b>⚙️</b> di topbar untuk Settings — ganti tema, mode nav, atau gamifikasi!',
    tour_add_task_title_desktop: 'Tambah task di sini',
    tour_add_task_desc_desktop: 'Ketik nama task atau habit di kolom ini lalu tekan <b>Enter</b> atau klik <b>+ Tambah</b>. Bisa juga set sebagai Habit 🔥, tandai Penting ⭐, Belanja 🛒, atau atur pengulangan.',
    tour_add_task_title_fab: 'Tombol Tambah Task',
    tour_add_task_desc_fab: 'Tap tombol <b>＋</b> di tengah bottom nav untuk tambah task baru. Bisa set sebagai Habit 🔥, tandai Penting ⭐, Belanja 🛒, atau atur pengulangan dan deadline.',
    // ── Form tour steps ──
    ft_input_title: 'Ketik nama task di sini',
    ft_input_desc_mobile: 'Tulis nama task atau habit yang mau ditambahkan, lalu tap <b>＋ Tambah Task</b>. Bisa juga tekan Enter.',
    ft_input_desc_desktop: 'Tulis nama task atau habit lalu tekan <b>Enter</b> atau klik <b>+ Tambah</b> untuk menyimpan.',
    ft_habit_title: 'Jadikan Habit',
    ft_habit_desc_mobile: 'Tap untuk jadikan task sebagai <b>Habit harian</b>. Habit punya streak dan persentase keberhasilan yang bisa dipantau.',
    ft_habit_desc_desktop: 'Klik untuk jadikan task sebagai <b>Habit harian</b>. Habit punya streak dan persentase keberhasilan.',
    ft_important_title: 'Tandai Penting',
    ft_important_desc_mobile: 'Task penting muncul di bagian atas dan diberi tanda bintang supaya mudah ditemukan.',
    ft_important_desc_desktop: 'Task penting muncul di bagian atas daftar dan diberi tanda bintang supaya langsung kelihatan.',
    ft_shopping_title: 'Mode Belanja',
    ft_shopping_desc_mobile: 'Aktifkan untuk task belanja. Input <b>harga</b> dan pilih <b>wallet</b> — saat task dicentang, saldo otomatis berkurang.',
    ft_shopping_desc_desktop: 'Aktifkan untuk task belanja. Input <b>harga</b> dan pilih <b>wallet</b> — saat task dicentang, saldo wallet otomatis berkurang.',
    ft_nodue_title: 'No Due Date',
    ft_nodue_desc: 'Aktifkan kalau task ini tidak punya deadline. Task tetap muncul di daftar tanpa tanggal jatuh tempo.',
    ft_nodue_desc_desktop: 'Aktifkan kalau task tidak punya deadline. Task tetap muncul di daftar tanpa tanggal jatuh tempo.',
    ft_repeat_title: 'Pengulangan',
    ft_repeat_desc: 'Pilih seberapa sering task berulang — <b>Harian</b>, <b>Mingguan</b>, <b>Bulanan</b>, atau interval custom. Cocok untuk kebiasaan rutin.',
    ft_repeat_desc_desktop: 'Pilih interval pengulangan — <b>Harian</b>, <b>Mingguan</b>, <b>Bulanan</b>, atau custom. Task otomatis muncul lagi sesuai jadwal.',
    ft_group_title: 'Grup / Kategori',
    ft_group_desc: 'Kelompokkan task ke dalam grup seperti <b>Olahraga</b>, <b>Kesehatan</b>, <b>Produktivitas</b> supaya lebih rapi.',
    ft_group_desc_desktop: 'Kelompokkan task ke dalam grup seperti <b>Olahraga</b>, <b>Kesehatan</b>, <b>Produktivitas</b> supaya mudah difilter.',
    ft_due_title: 'Due Date',
    ft_due_desc: 'Set tanggal jatuh tempo. Task yang melewati deadline otomatis ditandai <b>terlambat</b>.',
    ft_reminder_title: 'Reminder',
    ft_reminder_desc: 'Set jam pengingat agar dapat notifikasi tepat waktu sebelum mengerjakan task.',
    ft_steps_title: 'Sub-langkah',
    ft_steps_desc: 'Isi angka untuk memecah task menjadi beberapa langkah kecil. Tiap langkah yang dicentang akan <b>menyerang boss</b>!',
    ft_steps_desc_desktop: 'Isi angka untuk memecah task menjadi beberapa langkah. Tiap langkah yang dicentang akan <b>menyerang boss</b>!',
    ft_color_title: 'Warna Label',
    ft_color_desc: 'Pilih warna untuk task ini supaya mudah dibedakan secara visual di daftar.',
    ft_done_label: 'Selesai ✓',
    ft_next_label: 'Lanjut →',
    // ── App title ──
    app_title: 'ChiTask — Task Manager + Keuangan',
    // ── Common buttons ──
    btn_cancel: 'Batal',
    btn_save: 'Simpan',
    // ── Mobile Finance Add Bar ──
    mob_fin_title: 'Tambah Transaksi',
    mob_fin_expense: '📤 Pengeluaran',
    mob_fin_income: '📥 Pemasukan',
    mob_fin_transfer: '↔️ Transfer',
    mob_fin_save: '＋ Simpan Transaksi',
    mob_fin_desc_ph: 'Deskripsi...',
    mob_fin_amount_ph: 'Jumlah (Rp)',
    // ── Mobile Maint Add Bar ──
    mob_maint_title: 'Tambah Item Maintenance',
    mob_maint_save: '＋ Simpan Item',
    mob_maint_name_ph: 'Nama item (cth: Ganti Oli...)',
    mob_maint_cost_ph: 'Estimasi biaya (Rp, opsional)',
    mob_maint_note_ph: 'Catatan (opsional)',
    mob_maint_interval_ph: 'Interval (hari)',
    // ── Shop confirm modal ──
    shop_confirm_title: 'Konfirmasi Pembelian',
    shop_confirm_cancel: 'Batal',
  },
  en: {
    splash_sub: 'Task · Finance · Life',
    login_sub: 'Task Manager · Finance · Maintenance<br>Your data is safely stored in the cloud ☁️',
    login_google: 'Sign in with Google',
    login_guest: 'Try without signing in',
    login_guest_note: 'Data is saved on this device only &mdash; <b>no cloud sync</b>. You can upgrade to a Google account anytime.',
    nav_sec_task: '📋 Tasks',
    nav_sec_fin: '💰 Finance',
    nav_sec_maint: '🔧 Maintenance',
    nav_sec_journal: '📓 Journal',
    nav_dashboard: 'Dashboard',
    nav_myday: 'My Day',
    nav_important: 'Important',
    nav_planned: 'Scheduled',
    nav_calendar: 'Calendar',
    nav_habits: 'Habits',
    nav_shop: 'Shop',
    nav_achievements: 'Achievements',
    nav_fin_overview: 'Overview',
    nav_fin_cashflow: 'Cash Flow',
    nav_fin_transactions: 'Transactions',
    nav_fin_wallets: 'Wallets',
    nav_fin_wishlist: 'Wishlist',
    nav_fin_tagihan: 'Bills',
    nav_fin_hutang: 'Debt',
    nav_fin_categories: 'Categories',
    nav_fin_budget: 'Budget',
    nav_maint_overview: 'Overview',
    nav_maint_all: 'All Items',
    nav_maint_log: 'History',
    nav_maint_categories: 'Manage Categories',
    nav_journal_today: 'Today',
    nav_journal_calendar: 'Calendar',
    nav_journal_all: 'All Entries',
    nav_journal_search: 'Search',
    nav_settings: 'Settings',
    nav_install: 'Install App',
    bn_fin: 'Finance',
    bn_journal: 'Journal',
    bn_maint: 'Maintenance',
    sdi_all: 'All Tasks',
    sdi_completed: 'Completed',
    sdi_fin_header: '💰 Finance',
    sdi_journal_write: 'Write Today\'s Journal',
    sdi_journal_header: '📓 Journal',
    sdi_maint_header: '🔧 Maintenance',
    sdi_install: '📲 Install App',
    sdi_settings: '⚙️ Settings',
    title_dashboard: '🏠 Dashboard',
    title_myday: '☀️ My Day',
    title_important: '⭐ Important',
    title_planned: '📅 Scheduled',
    title_habits: '🔥 Habit Tracker',
    title_all: '📋 All Tasks',
    title_completed: '✅ Completed',
    title_achievements: '🏆 Achievements',
    title_calendar: '🗓 Calendar',
    title_fin_overview: '📈 Finance Overview',
    title_fin_cashflow: '💸 Cash Flow',
    title_fin_transactions: '📒 Transactions',
    title_fin_wallets: '👛 Wallets',
    title_fin_wishlist: '🎯 Wishlist',
    title_fin_tagihan: '🧾 Bills',
    title_fin_hutang: '🤝 Debt & Loans',
    title_fin_categories: '🏷️ Manage Categories',
    title_fin_budget: '💰 Budget by Category',
    title_maint_overview: '🔧 Maintenance Overview',
    title_maint_all: '📋 All Maintenance Items',
    title_maint_log: '📜 Maintenance History',
    title_maint_categories: '⚙️ Manage Maintenance Categories',
    title_journal_today: '✍️ Today\'s Journal',
    title_journal_calendar: '🗓 Journal Calendar',
    title_journal_all: '📓 All Entries',
    title_journal_search: '🔍 Search Journal',
    sub_dashboard: 'Daily summary of finance, habits, and tasks',
    sub_myday: 'Focus on today',
    sub_important: 'Tasks you marked as important',
    sub_planned: 'All tasks with a schedule',
    sub_habits: 'Track and build positive habits',
    sub_all: 'All active and completed tasks',
    sub_completed: 'Tasks you have completed',
    sub_achievements: 'Milestones you have reached',
    sub_calendar: 'Click a date to view & add tasks',
    sub_fin_overview: 'Monthly finance summary',
    sub_fin_cashflow: 'Income and expense flow',
    sub_fin_transactions: 'Full transaction history',
    sub_fin_wallets: 'Manage wallets & balances',
    sub_fin_wishlist: 'Track your financial goals',
    sub_fin_tagihan: 'Monitor & pay recurring bills',
    sub_fin_hutang: 'Manage debts and loans',
    sub_fin_categories: 'Add, edit, delete transaction categories',
    sub_fin_budget: 'Set spending limits per category per month',
    sub_maint_overview: 'Monitor all maintenance schedules',
    sub_maint_all: 'Full list of maintenance items',
    sub_maint_log: 'History of completed maintenance',
    sub_maint_categories: 'Add and manage asset categories',
    sub_journal_today: 'Record your thoughts and feelings',
    sub_journal_calendar: 'Click a date to open journal',
    sub_journal_all: 'All daily journal entries',
    sub_journal_search: 'Search by keyword or tag',
    placeholder_task: 'Add a new task or habit...',
    placeholder_task_mobile: 'Task or habit name...',
    btn_add_task: '+ Add',
    btn_add_task_mobile: '＋ Add Task',
    tour_step_badge: 'Step {0} of {1}',
    tour_skip: 'Skip tutorial',
    tour_skip_confirm: 'Skip the tutorial? You can view it again later in Settings.',
    tour_prev: '← Prev',
    tour_next: 'Start →',
    tour_finish: '🎉 Done!',
    settings_nav_title: 'Choose Navigation Style',
    settings_nav_sub: 'Choose how you want to access menus on mobile',
    settings_drawer_name: 'Bottom Drawer',
    settings_drawer_desc: 'Bottom tabs + pop-up sub-menu. One-handed access.',
    settings_sidebar_name: 'Side Drawer',
    settings_sidebar_desc: 'Slide-in sidebar from the left. All menus at once.',
    settings_gami_title: 'Gamification',
    settings_gami_sub: 'Enable for Gamer Mode (boss battles, radar chart)',
    settings_gami_review: '↩ Review mode selection',
    settings_lang_label: '🌐 Language / Bahasa',
    settings_lang_id: '🇮🇩 Indonesian',
    settings_lang_en: '🇬🇧 English',
    btn_close: 'Close',
    btn_apply_nav: '✓ Save Settings',
    settings_hint: 'Can be changed anytime in ⚙️ Settings',
    saved: '✓ Saved',
    sync_activate: '☁️ Enable sync → Sign in with Google',
    // ── Guest username modal ──
    guest_username_title: 'Hello! What\'s your name? 👋',
    guest_username_sub: 'This name will be shown in the sidebar. You can change it anytime.',
    guest_username_placeholder: 'Enter your name...',
    guest_username_btn: '✓ Start Using ChiTask',

    confirm_logout: 'Are you sure you want to log out?',
    btn_logout: 'Logout',
    // ── Mobile sidebar mode badge ──
    nav_mode_drawer: 'Bottom Drawer',
    nav_mode_sidebar: 'Side Drawer',
    // ── Subdrawer section headers ──
    sdi_task_header: '📋 Tasks',
    sdi_journal_header_daily: '📓 Daily Journal',
    sdi_journal_menu_label: 'Journal Menu',
    sdi_journal_edit: '✏️ Edit Today\'s Journal',
    // ── Mobile chips ──
    chip_important: '⭐ Important',
    chip_habit: '🔥 Habit',
    chip_shopping: '🛒 Shopping',
    chip_nodue: '📌 No Due',
    // ── Mobile maintenance add bar ──
    maint_add_bar_label: 'Add Maintenance Item',
    maint_add_item_btn: '+ Add Item',
    maint_add_form_title: '➕ Add Maintenance Item',
    maint_add_wishlist_title: '🎯 Add Wishlist Item',
    // ── Modal label ──
    modal_important_label: '⭐ Important?',
    // ── Dashboard journal CTA ──
    dash_journal_write: '📝 Write Journal',
    // ── Nav onboarding (first-time) ──
    onb_nav_badge: 'First-Time Preference',
    onb_nav_title: 'Choose Your<br>Navigation Style',
    onb_nav_hint: 'Can be changed anytime in ⚙️ Settings',
    onb_drawer_name: 'Bottom Drawer',
    onb_drawer_desc: 'Bottom tabs + pop-up sub-menu. Quick thumb access.',
    onb_drawer_tag1: 'One-handed',
    onb_drawer_tag2: 'Lightweight',
    onb_sidebar_name: 'Side Drawer',
    onb_sidebar_desc: 'Slide-in sidebar from the left. All menus at once.',
    onb_sidebar_tag1: 'Desktop-like',
    onb_sidebar_tag2: 'Complete',
    onb_nav_confirm_placeholder: 'Pick a style first ↑',
    onb_nav_confirm_drawer: '✓ Use Bottom Drawer',
    onb_nav_confirm_sidebar: '✓ Use Side Drawer',
    onb_nav_footer: 'Preference saved on this device · Can be changed in Settings',
    // ── Gami onboarding ──
    onb_gami_badge: 'Choose Your Productivity Style',
    onb_gami_title: 'What kind of<br>person are you?',
    onb_gami_hint: 'XP & Gold exist in both · Can be changed in ⚙️ Settings',
    onb_gami_note_bold: 'XP and Gold are always available in both',
    onb_gami_note_body: '— used to level up and buy themes in the Shop. The difference is just extra visuals: Boss Battle and Radar Chart.',
    onb_gami_note_footer: 'Can be changed anytime in ⚙️ Settings → Gamification',
    onb_focus_name: '🎯 Focused & Productive',
    onb_focus_desc: 'Clean interface. Focus on your tasks, habits, and progress.',
    onb_focus_tag1: '⚡ XP & Level',
    onb_focus_tag2: '🪙 Gold',
    onb_focus_tag3: '🏆 Achievements',
    onb_gamer_name: '🎮 Fun + Productive',
    onb_gamer_desc: 'Fight Bosses, see your skill radar, and turn productivity into an RPG!',
    onb_gamer_tag1: '⚔️ Boss Battle',
    onb_gamer_tag2: '🕸 Radar Chart',
    onb_gamer_tag3: '⚡ XP & Gold',
    onb_gami_confirm_placeholder: 'Pick your type first ↑',
    onb_gami_confirm_focus: '✓ Start Focused Mode',
    onb_gami_confirm_gamer: '✓ Start the Adventure!',
    onb_gami_footer: 'Preference saved · Can be changed in Settings',
    // ── Gami mode labels ──
    gami_mode_gamer: '🎮 Gamer Mode Active',
    gami_mode_focus: '🎯 Focus Mode Active',
    // ── Tour steps ──
    tour_welcome_title: 'Welcome to ChiTask!',
    tour_welcome_desc: 'You\'ve just entered an all-in-one productivity app that helps you manage <b>tasks</b>, <b>finances</b>, <b>habits</b>, and <b>daily journal</b> — all in one place.',
    tour_cloud_title: 'Your data is safe in the cloud',
    tour_cloud_desc: 'Since you signed in with Google, all your data is automatically saved in the cloud and accessible from any device. No need to worry about losing data!',
    tour_install_title: 'Install to Home Screen',
    tour_install_desc: 'ChiTask can be installed like a real app! On <b>Chrome</b>: tap ⋮ → <i>Add to home screen</i>. On <b>Safari</b>: tap ↑ → <i>Add to Home Screen</i>. A much better experience!',
    tour_boss_title: 'Boss Battle',
    tour_boss_desc: 'Every task you complete <b>attacks the Boss</b>! Defeat the boss to earn bonus XP & Gold. A new boss appears each day — keep up your damage! (Enable in ⚙️ Settings → Gamification)',
    tour_ready_title: 'Ready to be productive!',
    tour_ready_desc: 'Congrats, you now know all the main features of ChiTask! Start adding your first task and make today more productive. <b>Let\'s go! 💪</b>',
    tour_sidebar_btn_title: 'Open Sidebar Button',
    tour_sidebar_btn_desc: 'Tap this <b>☰</b> button — or swipe from the left edge — to open the sidebar. All ChiTask navigation is there!',
    tour_add_task_title: 'Add New Task',
    tour_add_task_desc: 'Tap this button at the top of the page to add a new task. You can set it as a Habit 🔥, mark as Important ⭐, Shopping 🛒, or set recurrence and deadlines.',
    tour_habit_title: 'Habit Tracker',
    tour_habit_desc: 'All <b>Habit</b> tasks appear in this panel. Check them every day to maintain your streak and track your success rate!',
    tour_xp_title: 'XP & Level',
    tour_xp_desc_sidebar: 'Every task you complete gives you <b>XP</b>. Collect XP to level up and unlock new achievements!',
    tour_xp_desc_drawer: 'Every task you complete gives you <b>XP (Experience Points)</b>. Collect XP to level up and unlock new achievements! Swipe from the <b>left edge</b> to see the XP bar in the sidebar.',
    tour_xp_desc_desktop: 'Every task you complete gives you <b>XP (Experience Points)</b>. Collect XP to level up and unlock new achievements! Your level is shown in this XP bar.',
    tour_gold_title: 'Gold & Shop',
    tour_gold_desc_sidebar: 'You also earn <b>Gold 🪙</b> for each completed task. Exchange Gold for new visual themes and cool items in the <b>Shop</b>.',
    tour_gold_desc_drawer: 'Besides XP, you also earn <b>Gold 🪙</b> for each completed task. Gold can be exchanged for <b>new themes</b>, cool visual effects, and more in the Shop. Check the Task menu!',
    tour_gold_desc_desktop: 'Besides XP, you also earn <b>Gold</b> for each completed task. Gold can be exchanged for new <b>visual themes</b>, cool particle effects, and more in the Shop.',
    tour_nav_task_title: 'Task Navigation',
    tour_nav_task_desc: 'Here are all the Task menus — <b>My Day</b>, <b>Scheduled</b>, <b>Calendar</b>, <b>Habits</b>, <b>Dashboard</b>, and <b>Achievements</b>.',
    tour_nav_task_desc_desktop: 'The sidebar has all Task menus — <b>My Day</b>, <b>Scheduled</b>, <b>Calendar</b>, <b>Habits</b>, <b>Dashboard</b>, and <b>Achievements</b>. Click to expand.',
    tour_nav_task_desc_drawer: 'Tap this button to open the Task sub-drawer — Dashboard, Shop, Achievements, and more. Tap <b>Next →</b> to see inside!',
    tour_shop_title: 'Shop',
    tour_shop_desc: 'Exchange the Gold you collect here! Buy new <b>visual themes</b>, cool particle effects, and other items.',
    tour_shop_desc_drawer: 'Exchange your collected Gold here to buy new visual themes, particle effects, and cool items!',
    tour_dashboard_title: 'Dashboard',
    tour_dashboard_desc: 'See a summary of all your activity — tasks, finances, habit streaks, XP level, radar chart, and cashflow graph in one screen.',
    tour_dashboard_desc_desktop: 'See a summary of all your activity in one screen — tasks, finances, habit streaks, XP level, statistics radar chart, and cashflow progress graph.',
    tour_achievements_title: 'Achievements',
    tour_achievements_desc: 'Every milestone — completed tasks, long streaks, new levels — is recorded as an <b>achievement</b>. Collect them all!',
    tour_achievements_desc_desktop: 'Every milestone you reach — completed tasks, long streaks, new levels — is recorded here as an <b>achievement</b>. Collect them all!',
    tour_fin_title: 'Finance',
    tour_fin_desc: 'Record <b>income & expenses</b>, manage multiple wallets, track <b>wishlist</b>, recurring bills, and debts.',
    tour_fin_title_drawer: 'Finance Menu',
    tour_fin_desc_drawer: 'Tap to open the finance module. Record <b>income & expenses</b>, manage multiple wallets, track <b>wishlist</b>, recurring bills, and debts.',
    tour_fin_desc_desktop: 'Click to open the finance module. Record <b>income & expenses</b>, manage multiple wallets, track <b>wishlist</b>, recurring bills, and debts.',
    tour_journal_title: 'Journal',
    tour_journal_desc: 'Write daily journals with a <b>mood tracker</b> and tags. Streak feature keeps you writing consistently, plus search to find old notes.',
    tour_journal_title_drawer: 'Journal Menu',
    tour_maint_title: 'Maintenance',
    tour_maint_desc: 'Reminders for routine maintenance — vehicle service, recurring bills, etc. Set a day interval and ChiTask will automatically remind you when due.',
    tour_maint_title_drawer: 'Maintenance Menu',
    tour_maint_desc_drawer: 'Reminders for routine maintenance — vehicle service, recurring bills, etc. Set a day interval and ChiTask will automatically remind you when due.',
    tour_account_title: 'Account & Logout',
    tour_account_desc: 'Your photo and account name are shown here. Tap <b>Logout</b> to exit — your data stays safe in the cloud! Tap <b>⚙️ Settings</b> in the sidebar to change themes or mode.',
    tour_account_desc_desktop: 'Your photo and account name are shown here. Click <b>Logout</b> to exit — but don\'t worry, all data is saved in the cloud and accessible anytime after logging in again.',
    tour_account_title_drawer: 'Account & Sidebar',
    tour_account_desc_drawer: 'Swipe from the <b>left edge</b> to open the sidebar. There you\'ll find the XP bar, Gold, your Google account info, and Logout button. Tap <b>⚙️</b> in the topbar for Settings — change themes, nav mode, or gamification!',
    tour_add_task_title_desktop: 'Add tasks here',
    tour_add_task_desc_desktop: 'Type the task or habit name in this field, then press <b>Enter</b> or click <b>+ Add</b>. You can also set it as a Habit 🔥, mark as Important ⭐, Shopping 🛒, or set recurrence.',
    tour_add_task_title_fab: 'Add Task Button',
    tour_add_task_desc_fab: 'Tap the <b>＋</b> button in the center of the bottom nav to add a new task. Set as Habit 🔥, mark Important ⭐, Shopping 🛒, or set recurrence and deadlines.',
    // ── Form tour steps ──
    ft_input_title: 'Type the task name here',
    ft_input_desc_mobile: 'Write the task or habit name you want to add, then tap <b>＋ Add Task</b>. You can also press Enter.',
    ft_input_desc_desktop: 'Write the task or habit name, then press <b>Enter</b> or click <b>+ Add</b> to save.',
    ft_habit_title: 'Make it a Habit',
    ft_habit_desc_mobile: 'Tap to set the task as a <b>daily Habit</b>. Habits have streaks and a success rate you can track.',
    ft_habit_desc_desktop: 'Click to set the task as a <b>daily Habit</b>. Habits have streaks and a success rate.',
    ft_important_title: 'Mark as Important',
    ft_important_desc_mobile: 'Important tasks appear at the top and get a star so they\'re easy to find.',
    ft_important_desc_desktop: 'Important tasks appear at the top of the list and get a star so they\'re immediately visible.',
    ft_shopping_title: 'Shopping Mode',
    ft_shopping_desc_mobile: 'Enable for shopping tasks. Enter a <b>price</b> and choose a <b>wallet</b> — when the task is checked, the balance automatically decreases.',
    ft_shopping_desc_desktop: 'Enable for shopping tasks. Enter a <b>price</b> and choose a <b>wallet</b> — when the task is checked, the wallet balance automatically decreases.',
    ft_nodue_title: 'No Due Date',
    ft_nodue_desc: 'Enable if this task has no deadline. The task will still appear in the list without a due date.',
    ft_nodue_desc_desktop: 'Enable if the task has no deadline. The task will still appear in the list without a due date.',
    ft_repeat_title: 'Recurrence',
    ft_repeat_desc: 'Choose how often the task repeats — <b>Daily</b>, <b>Weekly</b>, <b>Monthly</b>, or a custom interval. Great for regular habits.',
    ft_repeat_desc_desktop: 'Choose the recurrence interval — <b>Daily</b>, <b>Weekly</b>, <b>Monthly</b>, or custom. Task automatically reappears on schedule.',
    ft_group_title: 'Group / Category',
    ft_group_desc: 'Group tasks into categories like <b>Exercise</b>, <b>Health</b>, <b>Productivity</b> to stay organized.',
    ft_group_desc_desktop: 'Group tasks into categories like <b>Exercise</b>, <b>Health</b>, <b>Productivity</b> for easy filtering.',
    ft_due_title: 'Due Date',
    ft_due_desc: 'Set a due date. Tasks that pass their deadline are automatically marked as <b>overdue</b>.',
    ft_reminder_title: 'Reminder',
    ft_reminder_desc: 'Set a reminder time to receive a notification right before working on the task.',
    ft_steps_title: 'Sub-steps',
    ft_steps_desc: 'Enter a number to break the task into smaller steps. Each checked step will <b>attack the boss</b>!',
    ft_steps_desc_desktop: 'Enter a number to break the task into steps. Each checked step will <b>attack the boss</b>!',
    ft_color_title: 'Label Color',
    ft_color_desc: 'Choose a color for this task to visually distinguish it in your list.',
    ft_done_label: 'Done ✓',
    ft_next_label: 'Next →',
    // ── App title ──
    app_title: 'ChiTask — Task Manager + Finance',
    // ── Common buttons ──
    btn_cancel: 'Cancel',
    btn_save: 'Save',
    // ── Mobile Finance Add Bar ──
    mob_fin_title: 'Add Transaction',
    mob_fin_expense: '📤 Expense',
    mob_fin_income: '📥 Income',
    mob_fin_transfer: '↔️ Transfer',
    mob_fin_save: '＋ Save Transaction',
    mob_fin_desc_ph: 'Description...',
    mob_fin_amount_ph: 'Amount',
    // ── Mobile Maint Add Bar ──
    mob_maint_title: 'Add Maintenance Item',
    mob_maint_save: '＋ Save Item',
    mob_maint_name_ph: 'Item name (e.g. Oil Change...)',
    mob_maint_cost_ph: 'Estimated cost (optional)',
    mob_maint_note_ph: 'Note (optional)',
    mob_maint_interval_ph: 'Interval (days)',
    // ── Shop confirm modal ──
    shop_confirm_title: 'Purchase Confirmation',
    shop_confirm_cancel: 'Cancel',
  }
}

function getLang() {
  try { return localStorage.getItem(_LANG_KEY) || 'id'; } catch(e) { return 'id'; }
}
function setLang(lang) {
  try { localStorage.setItem(_LANG_KEY, lang); } catch(e) {}
  applyLang(lang);
  // Re-render current view to reflect translated titles/subtitles
  if (typeof render === 'function') render();
}
function t(key) {
  var lang = getLang();
  return (_STRINGS[lang] && _STRINGS[lang][key] !== undefined ? _STRINGS[lang][key] : (_STRINGS['id'][key] !== undefined ? _STRINGS['id'][key] : key));
}

function _setEl(id, text, html) {
  var el = document.getElementById(id);
  if (!el) return;
  if (html) el.innerHTML = text; else el.textContent = text;
}
function _setAttr(id, attr, val) {
  var el = document.getElementById(id);
  if (el) el[attr] = val;
}
function _setAll(selector, text) {
  document.querySelectorAll(selector).forEach(function(el){ el.textContent = text; });
}

function applyLang(lang) {
  document.documentElement.lang = lang;

  // ── Splash ──
  var splashSub = document.querySelector('#chitask-splash .brand-sub');
  if (splashSub) splashSub.textContent = t('splash_sub');

  // ── Login ──
  _setEl('loginSub', t('login_sub'), true);
  _setEl('loginGoogleLabel', t('login_google'));
  _setEl('loginGuestLabel', t('login_guest'));
  _setEl('loginGuestNote', t('login_guest_note'), true);

  // ── Language picker buttons highlight ──
  ['langBtnId','langBtnId2'].forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    var on = lang === 'id';
    el.style.background = on ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.06)';
    el.style.borderColor = on ? 'rgba(217,119,6,0.6)' : 'rgba(255,255,255,0.12)';
    el.style.color = on ? '#fbbf24' : 'rgba(255,255,255,0.5)';
  });
  ['langBtnEn','langBtnEn2'].forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    var on = lang === 'en';
    el.style.background = on ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.06)';
    el.style.borderColor = on ? 'rgba(217,119,6,0.6)' : 'rgba(255,255,255,0.12)';
    el.style.color = on ? '#fbbf24' : 'rgba(255,255,255,0.5)';
  });

  // ── Settings modal strings ──
  _setEl('settingsLangLabel', t('settings_lang_label'));
  _setEl('settingsLangId', t('settings_lang_id'));
  _setEl('settingsLangEn', t('settings_lang_en'));
  _setEl('settingsNavTitle', t('settings_nav_title'));
  _setEl('settingsNavSub', t('settings_nav_sub'));
  _setEl('settingsDrawerName', t('settings_drawer_name'));
  _setEl('settingsDrawerDesc', t('settings_drawer_desc'));
  _setEl('settingsSidebarName', t('settings_sidebar_name'));
  _setEl('settingsSidebarDesc', t('settings_sidebar_desc'));
  _setEl('settingsGamiTitle', t('settings_gami_title'));
  _setEl('settingsGamiSub', t('settings_gami_sub'));
  _setEl('settingsGamiReview', t('settings_gami_review'));
  _setEl('navPrefCancelBtn', t('btn_close'));
  _setEl('navPrefApplyBtn', t('btn_apply_nav'));
  _setEl('navPrefHint', t('settings_hint'));

  // ── Sidebar nav sections ──
  _setEl('navSecTask', t('nav_sec_task'));
  _setEl('navSecFin', t('nav_sec_fin'));
  _setEl('navSecMaint', t('nav_sec_maint'));
  _setEl('navSecJournal', t('nav_sec_journal'));

  // ── Sidebar nav item labels (direct lbl IDs) ──
  var lblMap = {
    'lbl-nav-dashboard':'nav_dashboard','lbl-nav-myday':'nav_myday','lbl-nav-important':'nav_important',
    'lbl-nav-planned':'nav_planned','lbl-nav-calendar':'nav_calendar','lbl-nav-habits':'nav_habits',
    'lbl-nav-all':'sdi_all','lbl-nav-completed':'sdi_completed','lbl-nav-shop':'nav_shop',
    'lbl-nav-achievements':'nav_achievements',
    'lbl-nav-fin-overview':'nav_fin_overview','lbl-nav-fin-cashflow':'nav_fin_cashflow',
    'lbl-nav-fin-transactions':'nav_fin_transactions','lbl-nav-fin-wallets':'nav_fin_wallets',
    'lbl-nav-fin-wishlist':'nav_fin_wishlist','lbl-nav-fin-tagihan':'nav_fin_tagihan',
    'lbl-nav-fin-hutang':'nav_fin_hutang','lbl-nav-fin-categories':'nav_fin_categories',
    'lbl-nav-fin-budget':'nav_fin_budget',
    'lbl-nav-maint-overview':'nav_maint_overview','lbl-nav-maint-all':'nav_maint_all',
    'lbl-nav-maint-log':'nav_maint_log','lbl-nav-maint-categories':'nav_maint_categories',
    'lbl-nav-journal-today':'nav_journal_today','lbl-nav-journal-calendar':'nav_journal_calendar',
    'lbl-nav-journal-all':'nav_journal_all','lbl-nav-journal-search':'nav_journal_search',
    'lbl-nav-settings':'nav_settings','lbl-nav-install':'nav_install'
  };
  Object.keys(lblMap).forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.textContent = t(lblMap[id]);
  });

  // ── Bottom nav labels ──
  _setEl('bn-lbl-fin', t('bn_fin'));
  _setEl('bn-lbl-journal', t('bn_journal'));
  _setEl('bn-lbl-maint', t('bn_maint'));

  // ── Subdrawer labels ──
  var sdiMap = {
    'sdi-dashboard':'nav_dashboard','sdi-myday':'nav_myday','sdi-important':'nav_important',
    'sdi-planned':'nav_planned','sdi-calendar':'nav_calendar','sdi-habits':'nav_habits',
    'sdi-all':'sdi_all','sdi-completed':'sdi_completed','sdi-achievements':'nav_achievements',
    'sdi-fin-overview':'nav_fin_overview','sdi-fin-cashflow':'nav_fin_cashflow',
    'sdi-fin-transactions':'nav_fin_transactions','sdi-fin-wallets':'nav_fin_wallets',
    'sdi-fin-wishlist':'nav_fin_wishlist','sdi-fin-tagihan':'nav_fin_tagihan',
    'sdi-fin-hutang':'nav_fin_hutang','sdi-fin-categories':'nav_fin_categories',
    'sdi-fin-budget':'nav_fin_budget',
    'sdi-journal-today':'nav_journal_today','sdi-journal-calendar':'nav_journal_calendar',
    'sdi-journal-all':'nav_journal_all','sdi-journal-search':'nav_journal_search',
    'sdi-maint-overview':'nav_maint_overview','sdi-maint-all':'nav_maint_all',
    'sdi-maint-log':'nav_maint_log','sdi-maint-categories':'nav_maint_categories'
  };
  Object.keys(sdiMap).forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    var lbl = el.querySelector('.sdi-lbl');
    if (lbl) lbl.firstChild.textContent = t(sdiMap[id]);
  });
  _setEl('sdi-journal-cta-label', t('sdi_journal_write'));

  // ── Tour skip button ──
  var tourSkipBtn = document.getElementById('tourSkipBtn');
  if (tourSkipBtn) tourSkipBtn.textContent = t('tour_skip');

  // ── Subdrawer section headers ──
  _setEl('sdi-task-header', t('sdi_task_header'));
  _setEl('sdi-journal-daily-header', t('sdi_journal_header_daily'));
  _setEl('sdi-journal-menu-label', t('sdi_journal_menu_label'));
  _setEl('sdi-fin-header-label', t('sdi_fin_header'));
  _setEl('sdi-maint-header-label', t('sdi_maint_header'));

  // ── Mobile chips ──
  _setAll('.chip-important-label', t('chip_important'));
  _setAll('.chip-habit-label', t('chip_habit'));
  _setAll('.chip-shopping-label', t('chip_shopping'));
  _setAll('.chip-nodue-label', t('chip_nodue'));

  // ── Mobile maintenance add bar ──
  _setEl('maintAddBarLabel', t('maint_add_bar_label'));

  // ── Mobile task add bar ──
  _setEl('mobileAddCancelBtn', t('btn_cancel'));

  // ── Mobile Finance Add Bar ──
  _setEl('mobFinTitle', t('mob_fin_title'));
  _setEl('mobFinExpenseLabel', t('mob_fin_expense'));
  _setEl('mobFinIncomeLabel', t('mob_fin_income'));
  _setEl('mobFinTransferLabel', t('mob_fin_transfer'));
  _setEl('mobFinCancelBtn', t('btn_cancel'));
  _setEl('mobFinSaveLabel', t('mob_fin_save'));
  _setAttr('mfin-desc', 'placeholder', t('mob_fin_desc_ph'));
  _setAttr('mfin-amount', 'placeholder', t('mob_fin_amount_ph'));

  // ── Mobile Maintenance Add Bar ──
  _setEl('mobMaintCancelBtn', t('btn_cancel'));
  _setEl('mobMaintSaveLabel', t('mob_maint_save'));
  _setAttr('mmaint-name', 'placeholder', t('mob_maint_name_ph'));
  _setAttr('mmaint-interval', 'placeholder', t('mob_maint_interval_ph'));
  _setAttr('mmaint-cost', 'placeholder', t('mob_maint_cost_ph'));
  _setAttr('mmaint-note', 'placeholder', t('mob_maint_note_ph'));

  // ── Subdrawer settings section ──
  _setEl('sdi-install-btn', t('sdi_install'));
  _setEl('sdi-settings-btn', t('sdi_settings'));

  // ── Shop confirm modal ──
  _setEl('shopConfirmCancelBtn', t('shop_confirm_cancel'));

  // ── Modal important label ──
  _setEl('modalImportantLabel', t('modal_important_label'));

  // ── Nav onboarding ──
  _setEl('onbNavBadge', t('onb_nav_badge'));
  _setEl('onbNavTitle', t('onb_nav_title'), true);
  _setEl('onbNavHint', t('onb_nav_hint'));
  _setEl('onbDrawerName', t('onb_drawer_name'));
  _setEl('onbDrawerDesc', t('onb_drawer_desc'));
  _setEl('onbDrawerTag1', t('onb_drawer_tag1'));
  _setEl('onbDrawerTag2', t('onb_drawer_tag2'));
  _setEl('onbSidebarName', t('onb_sidebar_name'));
  _setEl('onbSidebarDesc', t('onb_sidebar_desc'));
  _setEl('onbSidebarTag1', t('onb_sidebar_tag1'));
  _setEl('onbSidebarTag2', t('onb_sidebar_tag2'));
  _setEl('onbNavFooter', t('onb_nav_footer'));
  var onbConfirmBtn = document.getElementById('onbConfirmBtn');
  if (onbConfirmBtn && onbConfirmBtn.disabled) onbConfirmBtn.textContent = t('onb_nav_confirm_placeholder');

  // ── Gami onboarding ──
  _setEl('gamiOnbBadge', t('onb_gami_badge'));
  _setEl('gamiOnbTitle', t('onb_gami_title'), true);
  _setEl('gamiOnbHint', t('onb_gami_hint'));
  _setEl('gamiOnbNoteBody', t('onb_gami_note_body'));
  _setEl('gamiOnbNoteFooter', t('onb_gami_note_footer'));
  _setEl('gamiOnbFocusName', t('onb_focus_name'));
  _setEl('gamiOnbFocusDesc', t('onb_focus_desc'));
  _setEl('gamiOnbFocusTag1', t('onb_focus_tag1'));
  _setEl('gamiOnbFocusTag2', t('onb_focus_tag2'));
  _setEl('gamiOnbFocusTag3', t('onb_focus_tag3'));
  _setEl('gamiOnbGamerName', t('onb_gamer_name'));
  _setEl('gamiOnbGamerDesc', t('onb_gamer_desc'));
  _setEl('gamiOnbGamerTag1', t('onb_gamer_tag1'));
  _setEl('gamiOnbGamerTag2', t('onb_gamer_tag2'));
  _setEl('gamiOnbGamerTag3', t('onb_gamer_tag3'));
  _setEl('gamiOnbFooter', t('onb_gami_footer'));
  var gamiOnbConfirmBtn = document.getElementById('gamiOnbConfirmBtn');
  if (gamiOnbConfirmBtn && gamiOnbConfirmBtn.disabled) gamiOnbConfirmBtn.textContent = t('onb_gami_confirm_placeholder');

  // ── App title ──
  document.title = t('app_title');

  // ── Gamification mode label ──
  var _gml = document.getElementById('gamiModeLabel');
  if (_gml) {
    var _savedMode = (typeof loadGamificationMode === 'function') ? loadGamificationMode() : 'focus';
    _gml.textContent = _savedMode === 'gamer' ? t('gami_mode_gamer') : t('gami_mode_focus');
  }

  // ── Add bar placeholders & button ──
  _setAttr('taskInput', 'placeholder', t('placeholder_task'));
  _setAttr('mobileTaskInput', 'placeholder', t('placeholder_task_mobile'));
  _setAttr('sqaInput', 'placeholder', t('placeholder_task_mobile'));
  _setEl('addTaskBtn', t('btn_add_task'));
  _setEl('addTaskMobileBtn', t('btn_add_task_mobile'));

  // ── Tour buttons / badge ──
  var prevBtn = document.getElementById('tourPrevBtn');
  if (prevBtn) prevBtn.textContent = t('tour_prev');
  var skipLink = document.querySelector('.tour-skip');
  if (skipLink) skipLink.textContent = t('tour_skip');
  // next btn re-set by tourShow, but update if visible
  var nextBtn = document.getElementById('tourNextBtn');
  if (nextBtn && nextBtn.textContent !== t('tour_finish')) nextBtn.textContent = t('tour_next');
  // Re-update badge if tour active
  if (typeof _tourStep !== 'undefined' && typeof TOUR_STEPS !== 'undefined' && TOUR_STEPS.length) {
    var badge = document.getElementById('tourBadge');
    if (badge) badge.textContent = t('tour_step_badge').replace('{0}', _tourStep+1).replace('{1}', TOUR_STEPS.length);
  }

  // ── Page title & subtitle — re-trigger render titles ──
  if (typeof currentView !== 'undefined' && typeof render === 'function') {
    // Just update title/subtitle elements directly by re-calling the title block
    var _tv = (typeof currentView !== 'undefined') ? currentView : 'myday';
    var _ptEl = document.getElementById('pageTitle');
    var _psEl = document.getElementById('pageSubtitle');
    var _heroEl = document.getElementById('homeTitleHero');
    if (_ptEl || _heroEl) {
      var _dynTitles = {
        dashboard:t('title_dashboard'),myday:t('title_myday'),important:t('title_important'),
        planned:t('title_planned'),habits:t('title_habits'),'habit-analisa':'🧠 Analisa Habit',all:t('title_all'),
        completed:t('title_completed'),achievements:t('title_achievements'),calendar:t('title_calendar'),'unified-calendar':'🗓 Kalender',
        'fin-overview':t('title_fin_overview'),'fin-cashflow':t('title_fin_cashflow'),
        'fin-transactions':t('title_fin_transactions'),'fin-wallets':t('title_fin_wallets'),
        'fin-wishlist':t('title_fin_wishlist'),'fin-tagihan':t('title_fin_tagihan'),
        'fin-hutang':t('title_fin_hutang'),'fin-categories':t('title_fin_categories'),
        'fin-budget':t('title_fin_budget'),
        'maint-overview':t('title_maint_overview'),'maint-all':t('title_maint_all'),
        'maint-log':t('title_maint_log'),'maint-categories':t('title_maint_categories'),
        'journal-today':t('title_journal_today'),'journal-calendar':t('title_journal_calendar'),
        'journal-all':t('title_journal_all'),'journal-search':t('title_journal_search')
      };
      var _dynSubs = {
        dashboard:t('sub_dashboard'),myday:t('sub_myday'),important:t('sub_important'),
        planned:t('sub_planned'),habits:t('sub_habits'),all:t('sub_all'),
        completed:t('sub_completed'),achievements:t('sub_achievements'),calendar:t('sub_calendar'),
        'fin-overview':t('sub_fin_overview'),'fin-cashflow':t('sub_fin_cashflow'),
        'fin-transactions':t('sub_fin_transactions'),'fin-wallets':t('sub_fin_wallets'),
        'fin-wishlist':t('sub_fin_wishlist'),'fin-tagihan':t('sub_fin_tagihan'),
        'fin-hutang':t('sub_fin_hutang'),'fin-categories':t('sub_fin_categories'),
        'fin-budget':t('sub_fin_budget'),
        'maint-overview':t('sub_maint_overview'),'maint-all':t('sub_maint_all'),
        'maint-log':t('sub_maint_log'),'maint-categories':t('sub_maint_categories'),
        'journal-today':t('sub_journal_today'),'journal-calendar':t('sub_journal_calendar'),
        'journal-all':t('sub_journal_all'),'journal-search':t('sub_journal_search')
      };
      if (_ptEl && _dynTitles[_tv]) _ptEl.textContent = _dynTitles[_tv];
      if (_heroEl && _dynTitles[_tv]) _heroEl.textContent = _dynTitles[_tv];
      if (_psEl && _dynSubs[_tv]) {
        Array.from(_psEl.childNodes).forEach(function(n){if(n.nodeType===3)_psEl.removeChild(n);});
        _psEl.insertBefore(document.createTextNode(_dynSubs[_tv]), _psEl.firstChild);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function(){ applyLang(getLang()); });

// ═══════════════════════════════════════════════════════
// FIREBASE — v6 OFFLINE-READY
// Prioritas load: firebase-bundle.js (lokal) → CDN gstatic → CDN jsdelivr
// Untuk buat firebase-bundle.js: jalankan bundle_firebase.py (sekali saja)
// ═══════════════════════════════════════════════════════
var fbAuth = null, fbDb = null, fbUser = null, fbStorage = null;
var _fbSyncTimer = null, _fbInitialized = false;
var _offlineMode = false;
// Guard: true setelah initApp() selesai load data dari cloud/localStorage
// Selama false, fbSaveData TIDAK boleh push ke Firestore (mencegah overwrite dengan data kosong)
var _appReady = false;


// ── Offline fallback: masuk pakai data localStorage ──
function _enterOfflineMode() {
  _offlineMode = true;
  _appReady = false; // reset, akan di-set true kembali di dalam init()
  var savedData = null;
  try { savedData = localStorage.getItem('chitask_v6_data'); } catch(e) {}
  if (savedData) {
    // Buat dummy user dari data tersimpan supaya UI tidak blank
    var savedParsed = null;
    try { savedParsed = JSON.parse(savedData); } catch(e) {}
    var isGuest = savedParsed && savedParsed._isGuest;
    var offlineUser = {
      uid: isGuest ? 'guest_user' : 'offline_user',
      displayName: isGuest ? 'Tamu' : ((savedParsed && savedParsed._userName) ? savedParsed._userName : 'Offline Mode'),
      photoURL: (savedParsed && savedParsed._userPhoto) ? savedParsed._userPhoto : null,
      email: '',
      _isOffline: true,
      _isGuest: isGuest || false
    };
    fbUser = offlineUser;
    updateAuthUI(offlineUser);
    if (typeof initApp === 'function') initApp();
  } else {
    // Belum pernah login sama sekali, tetap tampil login screen
    showLoginScreen();
  }
}

// ── Deteksi balik online → sync otomatis ──
window.addEventListener('online', function() {
  if (_offlineMode && fbUser && fbUser._isOffline) {
    _offlineMode = false;
    fbUser = null;
    // Reload Firebase agar auth state fresh dan auto-sync
    _loadFirebaseWithFallback(FIREBASE_CDNS, 0);
  }
});

var FIREBASE_VER = '9.23.0';
var FIREBASE_CDNS = [
  'https://www.gstatic.com/firebasejs/' + FIREBASE_VER + '/',
  'https://cdn.jsdelivr.net/npm/firebase@' + FIREBASE_VER + '/compat/'
];

function _loadScript(url, cb) {
  var s = document.createElement('script');
  s.src = url;
  s.onload = cb;
  s.onerror = function() { cb(new Error('Gagal load: ' + url)); };
  document.head.appendChild(s);
}

function _initFirebase(baseUrl, onDone) {
  _loadScript(baseUrl + 'firebase-app-compat.js', function(e1) {
    if (e1 instanceof Error) { onDone(e1); return; }
    _loadScript(baseUrl + 'firebase-auth-compat.js', function(e2) {
      if (e2 instanceof Error) { onDone(e2); return; }
      _loadScript(baseUrl + 'firebase-firestore-compat.js', function(e3) {
        if (e3 instanceof Error) { onDone(e3); return; }
        // Firebase Storage SDK
        _loadScript(baseUrl + 'firebase-storage-compat.js', function(e4) {
          // storage gagal tidak fatal
          // FCM messaging SDK
          _loadScript(baseUrl + 'firebase-messaging-compat.js', function(e5) {
            // messaging gagal tidak fatal (fallback ke setTimeout notif)
            onDone(null);
          });
        });
      });
    });
  });
}

function _startFirebase() {
  try {
    var cfg = {
      apiKey: "AIzaSyA_erlGbohRGlL0ei8l2RqJLR0sy-kVtvU",
      authDomain: "chitask.firebaseapp.com",
      projectId: "chitask",
      storageBucket: "chitask.firebasestorage.app",
      messagingSenderId: "914322046491",
      appId: "1:914322046491:web:f35fc2b9258b9d710e82be"
    };
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    fbAuth    = firebase.auth();
    fbDb      = firebase.firestore();
    try { fbStorage = firebase.storage(); } catch(e) { fbStorage = null; }

    // ✅ FIX 4: enablePersistence — Firestore cache offline + auto-sync saat online balik
    fbDb.enablePersistence({ synchronizeTabs: true })
      .catch(function(err) {
        if (err.code === 'failed-precondition') {
          console.warn('Persistence gagal: multiple tabs terbuka.');
        } else if (err.code === 'unimplemented') {
          console.warn('Browser tidak support offline persistence.');
        }
      });

    fbAuth.onAuthStateChanged(function(user) {
      if (user) {
        // Guard: anonymous user dari loginAsGuest — jangan overwrite fbUser
        if (user.isAnonymous && (_guestLoginInProgress || (fbUser && fbUser._isGuest))) {
          if (fbUser) fbUser.uid = user.uid;
          return; // skip flow Google login
        }
        // Anonymous user — HANYA proses kalau memang sedang dalam alur loginAsGuest()
        // KECUALI: saat reload, localStorage punya data guest → proses sebagai guest (bukan dibuang)
        if (user.isAnonymous && (!fbUser || !fbUser._isGuest)) {
          if (!_guestLoginInProgress) {
            // Cek apakah ini reload dari sesi guest sebelumnya
            var _reloadSaved = null;
            try { _reloadSaved = JSON.parse(localStorage.getItem('chitask_v6_data') || '{}'); } catch(e) { _reloadSaved = {}; }
            var _isReloadGuest = _reloadSaved && _reloadSaved._isGuest;
            if (!_isReloadGuest) {
              // Bukan guest reload — abaikan, tunggu Google auth masuk
              console.warn('[ChiTask] Anonymous user terdeteksi tapi bukan dari loginAsGuest() — diabaikan untuk mencegah doc ganda');
              return;
            }
            // Guest reload: set flag dan lanjutkan proses normal di bawah
            console.log('[ChiTask] Anonymous user dari sesi guest sebelumnya — proses sebagai guest reload');
          }
          var _savedAnon = null;
          try { _savedAnon = JSON.parse(localStorage.getItem('chitask_v6_data') || '{}'); } catch(e) { _savedAnon = {}; }
          var _anonName = (_savedAnon && _savedAnon._userName) ? _savedAnon._userName : null;
          fbUser = {
            uid: user.uid,
            displayName: _anonName || 'Tamu',
            photoURL: null,
            email: '',
            _isOffline: false,
            _isGuest: true
          };
          _offlineMode = false;
          // Guest reload: gunakan localStorage saja, tidak ada baca/tulis Firestore untuk data utama
          if (!_fbInitialized) {
            _appReady = false;
            window._initAppRunning = false;
            _fbInitialized = true;
            updateAuthUI(fbUser);
            if (typeof initApp === 'function') initApp();
          } else {
            updateAuthUI(fbUser);
          }
          return;
        }
        fbUser = user;
        _offlineMode = false;
        updateAuthUI(user);

        // ── FCM: Subscribe push notification setelah login ────
        _fcmSubscribe(user.uid);

        // Simpan info user ke localStorage untuk offline mode nanti
        try {
          var existing = JSON.parse(localStorage.getItem('chitask_v6_data') || '{}');
          existing._userName  = user.displayName || user.email || '';
          existing._userPhoto = user.photoURL || '';
          localStorage.setItem('chitask_v6_data', JSON.stringify(existing));
        } catch(e) {}

        // ── Google Calendar: inisialisasi via GIS (bukan Firebase popup) ──
        _gcalInitForUser(user);

        if (!_fbInitialized) {
          // Reset _appReady untuk user login baru — akan di-set true di akhir init()
          _appReady = false;
          window._initAppRunning = false;
          // ✅ FIX 2: timeout dibuat SEBELUM _fbInitialized = true
          var _fbInitTimeout = setTimeout(function() {
            if (!_fbInitialized) {
              _fbInitialized = true;
              // Timeout path: Firestore tidak merespons dalam 4 detik
              // initApp() akan load dari localStorage. Setelah selesai,
              // _appReady di-set true di dalam init() sendiri.
              if (typeof initApp === 'function') initApp();
            }
          }, 4000);

          _fbInitialized = true; // set true setelah setTimeout dibuat

          fbLoadData(function(cloudData) {
            clearTimeout(_fbInitTimeout);
            if (cloudData && cloudData.tasks) {
              try { localStorage.setItem('chitask_v6_data', JSON.stringify(cloudData)); } catch(e) {}
            }
            // ✅ FIX: Restore navMode, gamiMode, formTourDone dari Firestore ke localStorage
            // supaya onboarding tidak muncul lagi kalau localStorage hilang (clear cache, browser baru)
            if (cloudData) {
              if (cloudData.navModeDone) {
                try {
                  localStorage.setItem('chitask_nav_mode_set', '1');
                  if (cloudData.navMode) localStorage.setItem('chitask_nav_mode', cloudData.navMode);
                } catch(e) {}
              }
              if (cloudData.gamiOnbDone) {
                try {
                  localStorage.setItem('chitask_gamification_set', '1');
                  if (cloudData.gamiMode) localStorage.setItem('chitask_gamification_mode', cloudData.gamiMode);
                } catch(e) {}
              }
              if (cloudData.formTourDone) {
                try { localStorage.setItem('chitask_formtour_done', '1'); } catch(e) {}
              }
            }
            // ── Cegah double-init race condition ──
            // Kalau timeout sudah trigger initApp() duluan DAN cloud data ternyata
            // berbeda, kita harus reload state dari cloud tanpa re-call initApp().
            if (window._initAppRunning || _appReady) {
              // initApp() sudah jalan — jika cloud punya data lebih baru, reload halaman
              // supaya state memory konsisten dengan Firestore (cara paling aman)
              if (cloudData && cloudData.tasks && cloudData.tasks.length > 0) {
                var localTs = null;
                var cloudTs = cloudData.lastSaved || null;
                try {
                  var loc = localStorage.getItem('chitask_v6_data');
                  if (loc) { var lp = JSON.parse(loc); localTs = lp.lastSaved || null; }
                } catch(e) {}
                // Kalau cloud lebih baru dari local yang sedang berjalan → reload
                if (!localTs || (cloudTs && cloudTs > localTs)) {
                  console.warn('[ChiTask] Cloud data lebih baru dari local — reload untuk sinkronisasi');
                  // Tandai bahwa ini reload karena cloud sync, bukan user action
                  try { sessionStorage.setItem('chitask_cloud_reload', '1'); } catch(e) {}
                  location.reload();
                  return;
                }
              }
              if (typeof tourCheckAndStart === 'function') tourCheckAndStart();
              return;
            }
            if (typeof initApp === 'function') initApp();
            if (typeof tourCheckAndStart === 'function') tourCheckAndStart();
          });
        }
      } else {
        fbUser = null;
        _fbInitialized = false;
        // Kalau bukan sedang proses offline mode, tampilkan login
        if (!_offlineMode) {
          // ✅ FIX: Cek dulu apakah ada data local (pernah login sebelumnya)
          // Kalau ada, masuk offline mode dulu daripada paksa ke login screen
          var _savedForOffline = null;
          try { _savedForOffline = localStorage.getItem('chitask_v6_data'); } catch(e) {}
          var _hasPrevLogin = false;
          if (_savedForOffline) {
            try {
              var _sp = JSON.parse(_savedForOffline);
              // Masuk offline mode untuk user Google DAN guest yang punya data lokal
              _hasPrevLogin = _sp && _sp._userName;
            } catch(e) {}
          }
          if (_hasPrevLogin) {
            // Ada data user sebelumnya → masuk offline mode, jangan tampil login
            _enterOfflineMode();
          } else {
            updateAuthUI(null);
            showLoginScreen();
          }
        }
      }
    });
  } catch(err) {
    console.error('Firebase start error:', err);
    _enterOfflineMode();
  }
}

// ✅ FIX 1 & 3: Saat semua CDN gagal (offline), masuk offline mode
function _loadFirebaseWithFallback(cdnList, idx) {
  if (idx >= cdnList.length) {
    console.warn('Semua CDN Firebase gagal. Masuk offline mode.');
    _enterOfflineMode();
    return;
  }
  // Timeout per CDN: 6 detik. Jika gagal, langsung coba CDN berikutnya.
  // Total max tunggu = 6s x jumlah CDN sebelum masuk offline mode.
  var _cdnTimeout = setTimeout(function() {
    console.warn('[ChiTask] CDN ' + cdnList[idx] + ' timeout (6s), coba berikutnya...');
    _loadFirebaseWithFallback(cdnList, idx + 1);
  }, 3000); // diperkecil dari 6s — bundle lokal sudah jadi jalur utama

  _initFirebase(cdnList[idx], function(err) {
    clearTimeout(_cdnTimeout);
    if (err) {
      console.warn('CDN ' + cdnList[idx] + ' gagal, coba berikutnya...');
      _loadFirebaseWithFallback(cdnList, idx + 1);
    } else {
      _startFirebase();
    }
  });
}

// ── Firebase helper functions ──
function fbSaveData(payload) {
  // Simpan ke localStorage dulu (selalu, online maupun offline)
  try { localStorage.setItem('chitask_v6_data', payload); } catch(e) {}
  // Kalau offline mode, skip Firestore
  if (_offlineMode || !fbUser || fbUser._isOffline || !fbDb) return;
  // ── GUARD: guest TIDAK boleh tulis data utama ke Firestore ──
  // Guest pakai anonymous UID — data mereka hanya di localStorage
  if (fbUser._isGuest) return;
  // ── GUARD: jangan push ke Firestore sebelum app selesai load data awal ──
  // Mencegah race condition: initApp() jalan sebelum cloud data balik,
  // lalu saveData() overwrite Firestore dengan data kosong/localStorage lama.
  if (!_appReady) {
    console.warn('[ChiTask] fbSaveData blocked — app belum ready (cloud load belum selesai)');
    return;
  }
  // Capture UID sekarang (sebelum debounce) — mencegah stale closure
  // jika fbUser berganti (misal anonymous → Google) selama 2 detik tunggu
  var _capturedUid = fbUser.uid;
  clearTimeout(_fbSyncTimer);
  _fbSyncTimer = setTimeout(function() {
    // Validasi ulang: pastikan fbUser masih valid dan UID-nya sama
    if (!fbUser || fbUser._isGuest || fbUser._isOffline || !fbDb) return;
    if (fbUser.uid !== _capturedUid) {
      console.warn('[ChiTask] fbSaveData dibatalkan — UID berubah selama debounce ('+_capturedUid+' → '+fbUser.uid+')');
      return;
    }
    var data;
    try { data = JSON.parse(payload); } catch(e) { return; }
    fbDb.collection('users').doc(_capturedUid).set(data)
      .then(function() {
        var el = document.getElementById('saveIndicator');
        if (el) { el.textContent = t('saved'); el.classList.add('show'); clearTimeout(el._to); el._to = setTimeout(function(){ el.classList.remove('show'); }, 2000); }
      })
      .catch(function(e) { console.warn('Firestore save error:', e); });
  }, 2000);
}

function fbLoadData(callback) {
  if (!fbUser || !fbDb || fbUser._isOffline || fbUser._isGuest) { callback(null); return; }
  fbDb.collection('users').doc(fbUser.uid).get()
    .then(function(doc) { callback(doc.exists ? doc.data() : null); })
    .catch(function(e) { console.warn('Firestore load error:', e); callback(null); });
}

function loginGoogle() {
  if (!fbAuth) { alert('Koneksi internet diperlukan untuk login pertama kali.'); return; }
  var provider = new firebase.auth.GoogleAuthProvider();
  // Hanya Firebase auth scope — Calendar dihandle oleh GIS secara terpisah
  provider.setCustomParameters({ prompt: 'select_account' });
  fbAuth.signInWithPopup(provider).then(function(result) {
    // Firebase auth berhasil — GIS akan otomatis init via onAuthStateChanged → _gcalInitForUser
  }).catch(function(e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      alert('Login gagal: ' + e.message);
    }
  });
}

// gcalReauth sudah dipindah ke blok Google Calendar state di bawah

var _guestLoginInProgress = false; // flag cegah race onAuthStateChanged vs _proceedAsGuest
function loginAsGuest() {
  var savedData = null;
  try { savedData = localStorage.getItem('chitask_v6_data'); } catch(e) {}
  var savedParsed = null;
  if (savedData) { try { savedParsed = JSON.parse(savedData); } catch(e) {} }
  var isGuestData = !savedParsed || !savedParsed._userName || savedParsed._isGuest;
  // Kalau sudah punya username guest sebelumnya, langsung lanjut tanpa modal
  var existingGuestName = (savedParsed && savedParsed._isGuest && savedParsed._userName
    && savedParsed._userName !== 'Tamu' && savedParsed._userName !== 'Guest')
    ? savedParsed._userName : null;

  function _proceedAsGuest(anonUid, guestDisplayName) {
    _guestLoginInProgress = false;
    _offlineMode = false;
    var guestUser = {
      uid: anonUid || 'guest_user',
      displayName: guestDisplayName || 'Tamu',
      photoURL: null,
      email: '',
      _isOffline: false,
      _isGuest: true
    };
    fbUser = guestUser;
    var dataToSave = savedParsed || {};
    dataToSave._isGuest = true;
    dataToSave._userName = guestUser.displayName;
    try { localStorage.setItem('chitask_v6_data', JSON.stringify(dataToSave)); } catch(e) {}
    // Guest data hanya disimpan di localStorage — tidak ada baca/tulis ke Firestore
    updateAuthUI(guestUser);
    if (typeof initApp === 'function') initApp();
  }

  function _doAnonSignIn(onSuccess) {
    if (fbAuth && typeof fbAuth.signInAnonymously === 'function') {
      fbAuth.signInAnonymously().then(function(result) {
        onSuccess(result.user ? result.user.uid : 'guest_anon');
      }).catch(function(err) {
        console.warn('[ChiTask] Anonymous sign-in gagal, fallback offline:', err.message);
        _guestLoginInProgress = false;
        _offlineMode = true;
        onSuccess('guest_user');
      });
    } else {
      _guestLoginInProgress = false;
      _offlineMode = true;
      onSuccess('guest_user');
    }
  }

  _guestLoginInProgress = true;
  if (existingGuestName) {
    _doAnonSignIn(function(anonUid) { _proceedAsGuest(anonUid, existingGuestName); });
    return;
  }
  _showGuestUsernameModal(function(chosenName) {
    _doAnonSignIn(function(anonUid) { _proceedAsGuest(anonUid, chosenName); });
  });
}

// ── Modal input username untuk guest baru ──
function _showGuestUsernameModal(onConfirm) {
  var old = document.getElementById('guestUsernameModal');
  if (old) old.remove();
  var modal = document.createElement('div');
  modal.id = 'guestUsernameModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = [
    '<div style="background:#1c1917;border:1px solid rgba(245,158,11,0.3);border-radius:20px;padding:32px 28px;width:100%;max-width:360px;box-shadow:0 24px 64px rgba(0,0,0,0.6);display:flex;flex-direction:column;gap:16px">',
      '<div style="text-align:center">',
        '<div style="font-size:36px;margin-bottom:8px">👤</div>',
        '<div style="font-size:18px;font-weight:800;color:#fff;font-family:DM Sans,sans-serif" id="guestUnModalTitle">'+t('guest_username_title')+'</div>',
        '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:6px;line-height:1.5;font-family:DM Sans,sans-serif" id="guestUnModalSub">'+t('guest_username_sub')+'</div>',
      '</div>',
      '<input id="guestUsernameInput" type="text" maxlength="30"',
        ' placeholder="'+t('guest_username_placeholder')+'"',
        ' style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.06);border:1.5px solid rgba(245,158,11,0.35);border-radius:10px;padding:13px 15px;color:#fff;font-size:15px;font-family:DM Sans,sans-serif;outline:none;transition:border-color 0.15s"',
        ' oninput="var v=this.value.trim();document.getElementById(\'guestUnConfirmBtn\').disabled=!v;document.getElementById(\'guestUnConfirmBtn\').style.opacity=v?\'1\':\'0.45\'"',
        ' onkeydown="if(event.key===\'Enter\'){var v=this.value.trim();if(v)document.getElementById(\'guestUnConfirmBtn\').click()}"',
      '>',
      '<button id="guestUnConfirmBtn" disabled',
        ' style="width:100%;padding:13px;border:none;border-radius:10px;background:linear-gradient(135deg,rgba(217,119,6,0.9),rgba(180,83,9,0.85));color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif;opacity:0.45;transition:opacity 0.15s"',
        ' onclick="_guestUsernameConfirm()">'+t('guest_username_btn'),
      '</button>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);
  window._guestUsernameCallback = onConfirm;
  setTimeout(function() { var inp = document.getElementById('guestUsernameInput'); if (inp) inp.focus(); }, 200);
}

function _guestUsernameConfirm() {
  var inp = document.getElementById('guestUsernameInput');
  var name = inp ? inp.value.trim() : '';
  if (!name) return;
  var modal = document.getElementById('guestUsernameModal');
  if (modal) modal.remove();
  if (typeof window._guestUsernameCallback === 'function') {
    window._guestUsernameCallback(name);
    window._guestUsernameCallback = null;
  }
}


// ── Presence writer: catat lastSeen ke Firestore untuk Google & Guest ──
var _presenceHeartbeatTimer = null;
function fbWritePresence() {
  if (!fbDb || !fbUser) return;
  var deviceId = null;
  try {
    deviceId = localStorage.getItem('chitask_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      localStorage.setItem('chitask_device_id', deviceId);
    }
  } catch(e) { deviceId = fbUser.uid || 'unknown'; }

  var isGuest = !!(fbUser._isGuest);
  var docId   = isGuest ? deviceId : fbUser.uid;

  var payload = {
    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
    isGuest: isGuest,
    deviceId: deviceId,
    ua: navigator.userAgent ? navigator.userAgent.substring(0, 80) : ''
  };
  if (!isGuest) {
    payload.email       = fbUser.email || '';
    payload.displayName = fbUser.displayName || '';
    payload.photoURL    = fbUser.photoURL || '';
  } else {
    payload.displayName = fbUser.displayName || 'Tamu';
  }

  fbDb.collection('presence').doc(docId).set(payload, { merge: true })
    .catch(function(e) { console.warn('[Presence] write error:', e.message); });
}

function _startPresenceHeartbeat() {
  fbWritePresence();
  clearInterval(_presenceHeartbeatTimer);
  _presenceHeartbeatTimer = setInterval(fbWritePresence, 3 * 60 * 1000);
}
function _stopPresenceHeartbeat() {
  clearInterval(_presenceHeartbeatTimer);
}

function logout() {
  if (!confirm(t('confirm_logout'))) return;
  // Reset appReady agar login berikutnya tidak langsung push ke Firestore
  _appReady = false;
  // FIX #1: Hentikan Firestore listener sebelum logout agar tidak jadi zombie listener
  if (typeof annStopListener === 'function') annStopListener();
  if (fbAuth) fbAuth.signOut();
  // Jangan hapus data lokal untuk guest — itu satu-satunya penyimpanan mereka
  if (!fbUser || !fbUser._isGuest) {
    try { localStorage.removeItem('chitask_v6_data'); } catch(e) {}
  }
}

function updateAuthUI(user) {
  var loginEl = document.getElementById('fbLoginScreen');
  var appEl   = document.getElementById('app');
  var userEl  = document.getElementById('fbUserInfo');
  if (user) {
    if (loginEl) loginEl.style.display = 'none';
    if (appEl)   appEl.style.display   = 'flex';
    if (userEl) {
      var init = (user.displayName || user.email || '?').charAt(0).toUpperCase();
      var photo = user.photoURL
        ? '<img src="'+user.photoURL+'" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0">'
        : '<div style="width:26px;height:26px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">'+init+'</div>';
      if (user._isGuest) {
        // Guest mode: tampilkan nama + upgrade prompt
        var guestName = user.displayName || 'Tamu';
        var guestInit = guestName.charAt(0).toUpperCase();
        userEl.innerHTML =
          '<div style="display:flex;flex-direction:column;gap:4px;width:100%;padding:2px 0">'
          + '<div style="display:flex;align-items:center;gap:7px">'
          + '<div style="width:26px;height:26px;border-radius:50%;background:rgba(245,158,11,0.25);border:1.5px solid rgba(245,158,11,0.5);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fbbf24;flex-shrink:0">'+guestInit+'</div>'
          + '<span style="font-size:12px;color:rgba(255,255,255,0.75);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px">'+guestName+'</span>'
          + '<span style="font-size:8px;background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);border-radius:4px;padding:1px 6px;margin-left:auto;white-space:nowrap;flex-shrink:0">TAMU</span>'
          + '</div>'
          + '<button onclick="showLoginScreen()" style="width:100%;padding:5px 8px;border:1px solid rgba(245,158,11,0.4);border-radius:6px;background:rgba(245,158,11,0.1);color:#fbbf24;font-size:10px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif;text-align:left">☁️ Aktifkan sync → Masuk dengan Google</button>'
          + '</div>';
      } else {
        var offlineBadge = user._isOffline
          ? '<span style="font-size:9px;background:#f59e0b;color:#fff;border-radius:4px;padding:1px 5px;margin-left:4px">OFFLINE</span>'
          : '';
        userEl.innerHTML = photo
          + '<span style="font-size:11px;color:rgba(255,255,255,0.7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px">' + (user.displayName||user.email) + '</span>'
          + offlineBadge
          + '<button onclick="logout()" style="margin-left:auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:rgba(255,255,255,0.55);border-radius:5px;padding:2px 8px;font-size:10px;cursor:pointer;font-family:DM Sans,sans-serif;white-space:nowrap">'+(t('btn_logout')||'Logout')+'</button>';
      }
    }
  } else {
    if (loginEl) loginEl.style.display = 'flex';
    if (appEl)   appEl.style.display   = 'none';
    if (userEl)  userEl.innerHTML = '';
    if (typeof _stopPresenceHeartbeat === 'function') _stopPresenceHeartbeat();
    return;
  }
  if (typeof _startPresenceHeartbeat === 'function') _startPresenceHeartbeat();
}

function showLoginScreen() {
  var loginEl = document.getElementById('fbLoginScreen');
  var appEl   = document.getElementById('app');
  if (loginEl) loginEl.style.display = 'flex';
  if (appEl)   appEl.style.display   = 'none';
  if (typeof applyLang === 'function') applyLang(getLang());
}

// ── Mulai load Firebase setelah DOM ready ──
document.addEventListener('DOMContentLoaded', function() {
  // Jika sudah jelas offline DAN ada data lokal sebelumnya → langsung offline mode
  // Tidak perlu tunggu CDN timeout yang bisa makan 10-20 detik
  if (!navigator.onLine) {
    var _savedCheck = null;
    try { _savedCheck = localStorage.getItem('chitask_v6_data'); } catch(e) {}
    var _hasPrev = false;
    if (_savedCheck) {
      try { var _sp = JSON.parse(_savedCheck); _hasPrev = !!((_sp && _sp._userName) || (_sp && _sp._isGuest)); } catch(e) {}
    }
    if (_hasPrev) {
      console.warn('[ChiTask] Offline terdeteksi saat startup — langsung masuk offline mode tanpa tunggu CDN');
      _enterOfflineMode();
      return;
    }
  }
  // ── Coba load firebase-bundle.js lokal dulu (paling cepat, Service Worker friendly) ──
  // Kalau gagal (file belum dibuat), fallback ke CDN seperti biasa.
  var _bundleScript = document.createElement('script');
  _bundleScript.src = 'firebase-bundle.js';
  _bundleScript.onload = function() {
    console.log('[ChiTask] ✅ Firebase bundle lokal berhasil di-load');
    _startFirebase();
  };
  _bundleScript.onerror = function() {
    console.warn('[ChiTask] firebase-bundle.js tidak ditemukan — fallback ke CDN');
    _loadFirebaseWithFallback(FIREBASE_CDNS, 0);
  };
  document.head.appendChild(_bundleScript);
});
