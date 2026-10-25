package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"log/slog"
	"net/url"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"lembah-kopi/core-system/internal/domain"
)

const (
	publicAgendaLimit  = 3
	publicGalleryLimit = 8
)

var (
	coffeeVarieties = map[string]struct{}{"ARABIKA": {}, "ROBUSTA": {}, "LIBERIKA": {}, "EXCELSA": {}}
	coffeeProcesses = map[string]struct{}{"NATURAL": {}, "HONEY": {}, "FULL_WASHED": {}, "SEMI_WASHED": {}, "WET_HULLED": {}}
	uploadFolders   = map[string]struct{}{
		domain.UploadFolderHero:    {},
		domain.UploadFolderProduct: {},
		domain.UploadFolderGallery: {},
	}
	imageKeyPattern = regexp.MustCompile(`^(hero|produk|galeri)/[a-f0-9]{32}\.webp$`)
	youtubeIDRegex  = regexp.MustCompile(`^[A-Za-z0-9_-]{11}$`)
	instagramRegex  = regexp.MustCompile(`^[A-Za-z0-9_-]{5,30}$`)
)

// CMSService mengelola konten community profile. storage dan images boleh nil
// bila MinIO belum dikonfigurasi; fitur unggah foto lalu mengembalikan ErrUnavailable.
type CMSService struct {
	repository domain.CMSRepository
	storage    domain.ObjectStorage
	images     domain.ImageProcessor
}

func NewCMSService(repository domain.CMSRepository, storage domain.ObjectStorage, images domain.ImageProcessor) *CMSService {
	return &CMSService{repository: repository, storage: storage, images: images}
}

// ---------- Foto ----------

// UploadImage mengompresi gambar ke WebP lalu menyimpannya ke object storage.
func (s *CMSService) UploadImage(ctx context.Context, folder string, source io.Reader) (*domain.UploadedImage, error) {
	if s.storage == nil || s.images == nil {
		return nil, fmt.Errorf("%w: penyimpanan foto belum dikonfigurasi", domain.ErrUnavailable)
	}
	if _, ok := uploadFolders[folder]; !ok {
		return nil, fmt.Errorf("%w: folder harus salah satu dari hero, produk, galeri", domain.ErrInvalid)
	}
	data, err := s.images.ToWebP(ctx, source)
	if err != nil {
		return nil, err
	}
	name := make([]byte, 16)
	if _, err := rand.Read(name); err != nil {
		return nil, fmt.Errorf("generate image name: %w", err)
	}
	key := folder + "/" + hex.EncodeToString(name) + ".webp"
	if err := s.storage.Put(ctx, key, "image/webp", data); err != nil {
		return nil, fmt.Errorf("store image: %w", err)
	}
	return &domain.UploadedImage{Key: key, URL: s.imageURL(key)}, nil
}

func (s *CMSService) imageURL(key string) string {
	if key == "" || s.storage == nil {
		return ""
	}
	return s.storage.PublicURL(key)
}

// removeImage menghapus file yang tidak lagi dipakai; kegagalan hanya dicatat.
func (s *CMSService) removeImage(ctx context.Context, key string) {
	if key == "" || s.storage == nil {
		return
	}
	if err := s.storage.Delete(ctx, key); err != nil {
		slog.Warn("failed to delete unused image", "key", key, "error", err)
	}
}

func validateImageKey(key, folder string, required bool) error {
	if key == "" {
		if required {
			return fmt.Errorf("%w: foto wajib diisi", domain.ErrInvalid)
		}
		return nil
	}
	if !imageKeyPattern.MatchString(key) || !strings.HasPrefix(key, folder+"/") {
		return fmt.Errorf("%w: foto tidak valid, unggah ulang fotonya", domain.ErrInvalid)
	}
	return nil
}

// ---------- Pengaturan situs ----------

func (s *CMSService) GetSettings(ctx context.Context) (*domain.SiteSettings, error) {
	settings, err := s.repository.GetSettings(ctx)
	if err != nil {
		return nil, err
	}
	s.decorateSettings(settings)
	return settings, nil
}

func (s *CMSService) UpdateSettings(ctx context.Context, settings *domain.SiteSettings) (*domain.SiteSettings, error) {
	if err := validateSettings(settings); err != nil {
		return nil, err
	}
	previous, err := s.repository.GetSettings(ctx)
	if err != nil {
		return nil, err
	}
	if err := s.repository.UpdateSettings(ctx, settings); err != nil {
		return nil, err
	}
	if previous.HeroImageKey != "" && previous.HeroImageKey != settings.HeroImageKey {
		s.removeImage(ctx, previous.HeroImageKey)
	}
	return s.GetSettings(ctx)
}

func (s *CMSService) decorateSettings(settings *domain.SiteSettings) {
	settings.HeroImageURL = s.imageURL(settings.HeroImageKey)
	if settings.AboutValues == nil {
		settings.AboutValues = []domain.CommunityValue{}
	}
}

func validateSettings(settings *domain.SiteSettings) error {
	settings.HeroTitle = strings.TrimSpace(settings.HeroTitle)
	settings.HeroTagline = strings.TrimSpace(settings.HeroTagline)
	settings.AboutStory = strings.TrimSpace(settings.AboutStory)
	settings.Address = strings.TrimSpace(settings.Address)
	if err := requireText("judul hero", settings.HeroTitle, 120); err != nil {
		return err
	}
	if utf8.RuneCountInString(settings.HeroTagline) > 200 {
		return fmt.Errorf("%w: slogan maksimal 200 karakter", domain.ErrInvalid)
	}
	if utf8.RuneCountInString(settings.AboutStory) > 5000 {
		return fmt.Errorf("%w: cerita komunitas maksimal 5000 karakter", domain.ErrInvalid)
	}
	if utf8.RuneCountInString(settings.Address) > 500 {
		return fmt.Errorf("%w: alamat maksimal 500 karakter", domain.ErrInvalid)
	}
	if err := validateImageKey(settings.HeroImageKey, domain.UploadFolderHero, false); err != nil {
		return err
	}
	phone, err := normalizeWhatsApp(settings.WhatsAppPhone)
	if err != nil {
		return err
	}
	settings.WhatsAppPhone = phone

	if len(settings.AboutValues) != 3 {
		return fmt.Errorf("%w: nilai komunitas harus tepat 3 poin", domain.ErrInvalid)
	}
	for i := range settings.AboutValues {
		value := &settings.AboutValues[i]
		value.Title = strings.TrimSpace(value.Title)
		value.Description = strings.TrimSpace(value.Description)
		if utf8.RuneCountInString(value.Title) > 60 || utf8.RuneCountInString(value.Description) > 200 {
			return fmt.Errorf("%w: judul nilai maksimal 60 dan deskripsi maksimal 200 karakter", domain.ErrInvalid)
		}
	}
	for label, link := range map[string]*string{
		"Instagram": &settings.InstagramURL, "YouTube": &settings.YouTubeURL,
		"Facebook": &settings.FacebookURL, "TikTok": &settings.TikTokURL,
	} {
		*link = strings.TrimSpace(*link)
		if err := validateWebURL(label, *link); err != nil {
			return err
		}
	}
	return nil
}

// normalizeWhatsApp mengubah 08xx / +62xx / 62xx menjadi format 62xxxxxxxx.
func normalizeWhatsApp(raw string) (string, error) {
	var digits strings.Builder
	for _, r := range strings.TrimSpace(raw) {
		switch {
		case r >= '0' && r <= '9':
			digits.WriteRune(r)
		case r == '+' || r == ' ' || r == '-' || r == '(' || r == ')':
		default:
			return "", fmt.Errorf("%w: nomor WhatsApp hanya boleh berisi angka", domain.ErrInvalid)
		}
	}
	number := digits.String()
	if number == "" {
		return "", nil
	}
	if strings.HasPrefix(number, "0") {
		number = "62" + number[1:]
	}
	if len(number) < 9 || len(number) > 15 {
		return "", fmt.Errorf("%w: nomor WhatsApp tidak valid", domain.ErrInvalid)
	}
	return number, nil
}

func validateWebURL(label, raw string) error {
	if raw == "" {
		return nil
	}
	if utf8.RuneCountInString(raw) > 300 {
		return fmt.Errorf("%w: tautan %s terlalu panjang", domain.ErrInvalid, label)
	}
	parsed, err := url.Parse(raw)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return fmt.Errorf("%w: tautan %s harus diawali https://", domain.ErrInvalid, label)
	}
	return nil
}

func requireText(label, value string, max int) error {
	if value == "" {
		return fmt.Errorf("%w: %s wajib diisi", domain.ErrInvalid, label)
	}
	if utf8.RuneCountInString(value) > max {
		return fmt.Errorf("%w: %s maksimal %d karakter", domain.ErrInvalid, label, max)
	}
	return nil
}

// ---------- Produk kopi ----------

func (s *CMSService) ListProducts(ctx context.Context) ([]domain.CoffeeProduct, error) {
	products, err := s.repository.ListProducts(ctx)
	if err != nil {
		return nil, err
	}
	for i := range products {
		products[i].ImageURL = s.imageURL(products[i].ImageKey)
	}
	return products, nil
}

func (s *CMSService) GetProduct(ctx context.Context, id string) (*domain.CoffeeProduct, error) {
	product, err := s.repository.GetProduct(ctx, id)
	if err != nil {
		return nil, err
	}
	product.ImageURL = s.imageURL(product.ImageKey)
	return product, nil
}

func (s *CMSService) CreateProduct(ctx context.Context, product *domain.CoffeeProduct) (*domain.CoffeeProduct, error) {
	if err := validateProduct(product); err != nil {
		return nil, err
	}
	id, err := newIdentifier("KPI-")
	if err != nil {
		return nil, err
	}
	product.ID = id
	if err := s.repository.CreateProduct(ctx, product); err != nil {
		return nil, err
	}
	product.ImageURL = s.imageURL(product.ImageKey)
	return product, nil
}

func (s *CMSService) UpdateProduct(ctx context.Context, product *domain.CoffeeProduct) (*domain.CoffeeProduct, error) {
	if err := validateProduct(product); err != nil {
		return nil, err
	}
	previous, err := s.repository.GetProduct(ctx, product.ID)
	if err != nil {
		return nil, err
	}
	if err := s.repository.UpdateProduct(ctx, product); err != nil {
		return nil, err
	}
	if previous.ImageKey != "" && previous.ImageKey != product.ImageKey {
		s.removeImage(ctx, previous.ImageKey)
	}
	return s.GetProduct(ctx, product.ID)
}

func (s *CMSService) DeleteProduct(ctx context.Context, id string) error {
	previous, err := s.repository.GetProduct(ctx, id)
	if err != nil {
		return err
	}
	if err := s.repository.DeleteProduct(ctx, id); err != nil {
		return err
	}
	s.removeImage(ctx, previous.ImageKey)
	return nil
}

func validateProduct(product *domain.CoffeeProduct) error {
	product.Name = strings.TrimSpace(product.Name)
	product.Variety = strings.ToUpper(strings.TrimSpace(product.Variety))
	product.Process = strings.ToUpper(strings.TrimSpace(product.Process))
	product.Stock = strings.ToUpper(strings.TrimSpace(product.Stock))
	if product.Stock == "" {
		product.Stock = domain.StockAvailable
	}
	if err := requireText("nama kopi", product.Name, 120); err != nil {
		return err
	}
	if _, ok := coffeeVarieties[product.Variety]; !ok {
		return fmt.Errorf("%w: varietas tidak dikenal", domain.ErrInvalid)
	}
	if _, ok := coffeeProcesses[product.Process]; !ok {
		return fmt.Errorf("%w: proses olahan tidak dikenal", domain.ErrInvalid)
	}
	switch product.Stock {
	case domain.StockAvailable, domain.StockLimited, domain.StockOut:
	default:
		return fmt.Errorf("%w: status ketersediaan tidak dikenal", domain.ErrInvalid)
	}
	return validateImageKey(product.ImageKey, domain.UploadFolderProduct, false)
}

// ---------- Media embed ----------

func (s *CMSService) ListMedia(ctx context.Context) ([]domain.MediaEmbed, error) {
	return s.repository.ListMedia(ctx, false)
}

func (s *CMSService) GetMedia(ctx context.Context, id string) (*domain.MediaEmbed, error) {
	return s.repository.GetMedia(ctx, id)
}

func (s *CMSService) CreateMedia(ctx context.Context, media *domain.MediaEmbed) (*domain.MediaEmbed, error) {
	if err := parseEmbed(media); err != nil {
		return nil, err
	}
	id, err := newIdentifier("MED-")
	if err != nil {
		return nil, err
	}
	media.ID = id
	if err := s.repository.CreateMedia(ctx, media); err != nil {
		return nil, err
	}
	return media, nil
}

func (s *CMSService) UpdateMedia(ctx context.Context, media *domain.MediaEmbed) (*domain.MediaEmbed, error) {
	if err := parseEmbed(media); err != nil {
		return nil, err
	}
	if err := s.repository.UpdateMedia(ctx, media); err != nil {
		return nil, err
	}
	return s.repository.GetMedia(ctx, media.ID)
}

func (s *CMSService) SetMediaVisible(ctx context.Context, id string, visible bool) (*domain.MediaEmbed, error) {
	return s.repository.SetMediaVisible(ctx, id, visible)
}

func (s *CMSService) DeleteMedia(ctx context.Context, id string) error {
	return s.repository.DeleteMedia(ctx, id)
}

// parseEmbed mengekstrak tipe dan ID dari tautan YouTube/Instagram biasa dan
// menormalkan URL-nya. Field Type, ExternalID, dan URL diisi ulang.
func parseEmbed(media *domain.MediaEmbed) error {
	raw := strings.TrimSpace(media.URL)
	if !strings.Contains(raw, "://") {
		raw = "https://" + raw
	}
	parsed, err := url.Parse(raw)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return fmt.Errorf("%w: tautan tidak valid", domain.ErrInvalid)
	}
	host := strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.")
	host = strings.TrimPrefix(host, "m.")
	segments := strings.FieldsFunc(parsed.Path, func(r rune) bool { return r == '/' })

	switch host {
	case "youtube.com":
		var id string
		switch {
		case len(segments) == 1 && segments[0] == "watch":
			id = parsed.Query().Get("v")
		case len(segments) == 2 && (segments[0] == "embed" || segments[0] == "shorts" || segments[0] == "live"):
			id = segments[1]
		}
		return setYouTube(media, id)
	case "youtu.be":
		if len(segments) >= 1 {
			return setYouTube(media, segments[0])
		}
	case "instagram.com":
		if len(segments) >= 2 && (segments[0] == "p" || segments[0] == "reel" || segments[0] == "tv") {
			code := segments[1]
			if instagramRegex.MatchString(code) {
				media.Type = domain.EmbedInstagram
				media.ExternalID = code
				media.URL = "https://www.instagram.com/" + segments[0] + "/" + code + "/"
				return nil
			}
		}
	}
	return fmt.Errorf("%w: tautan harus berupa video YouTube atau postingan Instagram (instagram.com/p/...)", domain.ErrInvalid)
}

func setYouTube(media *domain.MediaEmbed, id string) error {
	if !youtubeIDRegex.MatchString(id) {
		return fmt.Errorf("%w: tautan video YouTube tidak valid", domain.ErrInvalid)
	}
	media.Type = domain.EmbedYouTube
	media.ExternalID = id
	media.URL = "https://www.youtube.com/watch?v=" + id
	return nil
}

// ---------- Agenda ----------

func (s *CMSService) ListAgenda(ctx context.Context) ([]domain.Agenda, error) {
	return s.repository.ListAgenda(ctx, 0)
}

func (s *CMSService) GetAgenda(ctx context.Context, id string) (*domain.Agenda, error) {
	return s.repository.GetAgenda(ctx, id)
}

func (s *CMSService) CreateAgenda(ctx context.Context, agenda *domain.Agenda) (*domain.Agenda, error) {
	if err := validateAgenda(agenda); err != nil {
		return nil, err
	}
	id, err := newIdentifier("AGD-")
	if err != nil {
		return nil, err
	}
	agenda.ID = id
	if err := s.repository.CreateAgenda(ctx, agenda); err != nil {
		return nil, err
	}
	return agenda, nil
}

func (s *CMSService) UpdateAgenda(ctx context.Context, agenda *domain.Agenda) (*domain.Agenda, error) {
	if err := validateAgenda(agenda); err != nil {
		return nil, err
	}
	if err := s.repository.UpdateAgenda(ctx, agenda); err != nil {
		return nil, err
	}
	return s.repository.GetAgenda(ctx, agenda.ID)
}

func (s *CMSService) DeleteAgenda(ctx context.Context, id string) error {
	return s.repository.DeleteAgenda(ctx, id)
}

func validateAgenda(agenda *domain.Agenda) error {
	agenda.Title = strings.TrimSpace(agenda.Title)
	agenda.Description = strings.TrimSpace(agenda.Description)
	agenda.Date = strings.TrimSpace(agenda.Date)
	if err := requireText("judul agenda", agenda.Title, 150); err != nil {
		return err
	}
	if utf8.RuneCountInString(agenda.Description) > 300 {
		return fmt.Errorf("%w: keterangan maksimal 300 karakter", domain.ErrInvalid)
	}
	if _, err := time.Parse("2006-01-02", agenda.Date); err != nil {
		return fmt.Errorf("%w: tanggal harus berformat YYYY-MM-DD", domain.ErrInvalid)
	}
	return nil
}

// ---------- Galeri ----------

func (s *CMSService) ListGallery(ctx context.Context) ([]domain.GalleryPhoto, error) {
	photos, err := s.repository.ListGallery(ctx, 0)
	if err != nil {
		return nil, err
	}
	s.decoratePhotos(photos)
	return photos, nil
}

func (s *CMSService) GetGalleryPhoto(ctx context.Context, id string) (*domain.GalleryPhoto, error) {
	photo, err := s.repository.GetGalleryPhoto(ctx, id)
	if err != nil {
		return nil, err
	}
	photo.ImageURL = s.imageURL(photo.ImageKey)
	return photo, nil
}

func (s *CMSService) CreateGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) (*domain.GalleryPhoto, error) {
	if err := validateGalleryPhoto(photo); err != nil {
		return nil, err
	}
	id, err := newIdentifier("GAL-")
	if err != nil {
		return nil, err
	}
	photo.ID = id
	if err := s.repository.CreateGalleryPhoto(ctx, photo); err != nil {
		return nil, err
	}
	photo.ImageURL = s.imageURL(photo.ImageKey)
	return photo, nil
}

func (s *CMSService) UpdateGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) (*domain.GalleryPhoto, error) {
	if err := validateGalleryPhoto(photo); err != nil {
		return nil, err
	}
	previous, err := s.repository.GetGalleryPhoto(ctx, photo.ID)
	if err != nil {
		return nil, err
	}
	if err := s.repository.UpdateGalleryPhoto(ctx, photo); err != nil {
		return nil, err
	}
	if previous.ImageKey != photo.ImageKey {
		s.removeImage(ctx, previous.ImageKey)
	}
	return s.GetGalleryPhoto(ctx, photo.ID)
}

func (s *CMSService) DeleteGalleryPhoto(ctx context.Context, id string) error {
	previous, err := s.repository.GetGalleryPhoto(ctx, id)
	if err != nil {
		return err
	}
	if err := s.repository.DeleteGalleryPhoto(ctx, id); err != nil {
		return err
	}
	s.removeImage(ctx, previous.ImageKey)
	return nil
}

func (s *CMSService) decoratePhotos(photos []domain.GalleryPhoto) {
	for i := range photos {
		photos[i].ImageURL = s.imageURL(photos[i].ImageKey)
	}
}

func validateGalleryPhoto(photo *domain.GalleryPhoto) error {
	photo.Caption = strings.TrimSpace(photo.Caption)
	if utf8.RuneCountInString(photo.Caption) > 200 {
		return fmt.Errorf("%w: keterangan foto maksimal 200 karakter", domain.ErrInvalid)
	}
	if photo.Order < 0 || photo.Order > 9999 {
		return fmt.Errorf("%w: urutan harus 0-9999", domain.ErrInvalid)
	}
	return validateImageKey(photo.ImageKey, domain.UploadFolderGallery, true)
}

// ---------- Publik ----------

// PublicHome menyusun seluruh section beranda: produk, media yang tampil,
// maksimal 3 agenda mendatang, dan maksimal 8 foto galeri.
func (s *CMSService) PublicHome(ctx context.Context) (*domain.PublicHome, error) {
	settings, err := s.GetSettings(ctx)
	if err != nil {
		return nil, err
	}
	products, err := s.ListProducts(ctx)
	if err != nil {
		return nil, err
	}
	media, err := s.repository.ListMedia(ctx, true)
	if err != nil {
		return nil, err
	}
	agenda, err := s.repository.ListAgenda(ctx, publicAgendaLimit)
	if err != nil {
		return nil, err
	}
	gallery, err := s.repository.ListGallery(ctx, publicGalleryLimit)
	if err != nil {
		return nil, err
	}
	s.decoratePhotos(gallery)
	return &domain.PublicHome{Settings: *settings, Products: products, Media: media, Agenda: agenda, Gallery: gallery}, nil
}
