package domain

import (
	"context"
	"io"
	"time"
)

// Status ketersediaan produk kopi.
const (
	StockAvailable = "TERSEDIA"
	StockLimited   = "TERBATAS"
	StockOut       = "HABIS"
)

// Tipe media embed.
const (
	EmbedYouTube   = "YOUTUBE"
	EmbedInstagram = "INSTAGRAM"
)

// Folder penyimpanan gambar yang diizinkan.
const (
	UploadFolderHero    = "hero"
	UploadFolderProduct = "produk"
	UploadFolderGallery = "galeri"
)

// CommunityValue adalah satu poin nilai/keunggulan komunitas (tepat 3 poin).
type CommunityValue struct {
	Title       string `json:"judul"`
	Description string `json:"deskripsi"`
}

// SiteSettings memuat hero, about, dan kontak situs (satu baris tunggal).
type SiteSettings struct {
	HeroTitle     string           `json:"hero_judul"`
	HeroTagline   string           `json:"hero_slogan"`
	HeroImageKey  string           `json:"hero_foto_key"`
	HeroImageURL  string           `json:"hero_foto_url"`
	WhatsAppPhone string           `json:"nomor_whatsapp"`
	AboutStory    string           `json:"about_cerita"`
	AboutValues   []CommunityValue `json:"about_nilai"`
	Address       string           `json:"alamat"`
	InstagramURL  string           `json:"instagram_url"`
	YouTubeURL    string           `json:"youtube_url"`
	FacebookURL   string           `json:"facebook_url"`
	TikTokURL     string           `json:"tiktok_url"`
	UpdatedAt     time.Time        `json:"updated_at"`
}

type CoffeeProduct struct {
	ID        string    `json:"id_produk"`
	Name      string    `json:"nama"`
	Variety   string    `json:"varietas"`
	Process   string    `json:"proses"`
	ImageKey  string    `json:"foto_key"`
	ImageURL  string    `json:"foto_url"`
	Stock     string    `json:"status_ketersediaan"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type MediaEmbed struct {
	ID         string    `json:"id_media"`
	Type       string    `json:"tipe"`
	URL        string    `json:"url"`
	ExternalID string    `json:"external_id"`
	EmbedURL   string    `json:"embed_url"`
	Visible    bool      `json:"tampil"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// BuildEmbedURL menghasilkan URL iframe untuk media embed.
func BuildEmbedURL(mediaType, externalID string) string {
	switch mediaType {
	case EmbedYouTube:
		return "https://www.youtube-nocookie.com/embed/" + externalID
	case EmbedInstagram:
		return "https://www.instagram.com/p/" + externalID + "/embed"
	}
	return ""
}

type Agenda struct {
	ID          string    `json:"id_agenda"`
	Title       string    `json:"judul"`
	Date        string    `json:"tanggal"` // YYYY-MM-DD
	Description string    `json:"keterangan"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type GalleryPhoto struct {
	ID        string    `json:"id_foto"`
	ImageKey  string    `json:"foto_key"`
	ImageURL  string    `json:"foto_url"`
	Caption   string    `json:"keterangan"`
	Order     int       `json:"urutan"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// PublicHome adalah satu payload berisi seluruh section beranda situs publik.
type PublicHome struct {
	Settings SiteSettings    `json:"pengaturan"`
	Products []CoffeeProduct `json:"produk"`
	Media    []MediaEmbed    `json:"media"`
	Agenda   []Agenda        `json:"agenda"`
	Gallery  []GalleryPhoto  `json:"galeri"`
}

type UploadedImage struct {
	Key string `json:"key"`
	URL string `json:"url"`
}

// CMSRepository menyimpan seluruh konten CMS.
type CMSRepository interface {
	GetSettings(ctx context.Context) (*SiteSettings, error)
	UpdateSettings(ctx context.Context, settings *SiteSettings) error

	ListProducts(ctx context.Context) ([]CoffeeProduct, error)
	GetProduct(ctx context.Context, id string) (*CoffeeProduct, error)
	CreateProduct(ctx context.Context, product *CoffeeProduct) error
	UpdateProduct(ctx context.Context, product *CoffeeProduct) error
	DeleteProduct(ctx context.Context, id string) error

	// ListMedia mengembalikan semua media, atau hanya yang tampil jika onlyVisible.
	ListMedia(ctx context.Context, onlyVisible bool) ([]MediaEmbed, error)
	GetMedia(ctx context.Context, id string) (*MediaEmbed, error)
	CreateMedia(ctx context.Context, media *MediaEmbed) error
	UpdateMedia(ctx context.Context, media *MediaEmbed) error
	SetMediaVisible(ctx context.Context, id string, visible bool) (*MediaEmbed, error)
	DeleteMedia(ctx context.Context, id string) error

	// ListAgenda mengembalikan semua agenda; upcomingLimit > 0 hanya agenda yang
	// belum lewat (zona waktu WIB) dibatasi sejumlah itu (auto-archive).
	ListAgenda(ctx context.Context, upcomingLimit int) ([]Agenda, error)
	GetAgenda(ctx context.Context, id string) (*Agenda, error)
	CreateAgenda(ctx context.Context, agenda *Agenda) error
	UpdateAgenda(ctx context.Context, agenda *Agenda) error
	DeleteAgenda(ctx context.Context, id string) error

	// ListGallery mengembalikan galeri berurutan; limit > 0 membatasi jumlah.
	ListGallery(ctx context.Context, limit int) ([]GalleryPhoto, error)
	GetGalleryPhoto(ctx context.Context, id string) (*GalleryPhoto, error)
	CreateGalleryPhoto(ctx context.Context, photo *GalleryPhoto) error
	UpdateGalleryPhoto(ctx context.Context, photo *GalleryPhoto) error
	DeleteGalleryPhoto(ctx context.Context, id string) error
}

// ObjectStorage menyimpan file gambar (MinIO/S3).
type ObjectStorage interface {
	Put(ctx context.Context, key, contentType string, data []byte) error
	Delete(ctx context.Context, key string) error
	PublicURL(key string) string
}

// ImageProcessor mengubah gambar unggahan menjadi WebP terkompresi.
type ImageProcessor interface {
	ToWebP(ctx context.Context, source io.Reader) ([]byte, error)
}
