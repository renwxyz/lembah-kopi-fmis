package handler

import (
	"context"
	"io"
	"net/http"

	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

const uploadRequestLimit = 11 << 20

type CMSUseCases interface {
	UploadImage(ctx context.Context, folder string, source io.Reader) (*domain.UploadedImage, error)

	GetSettings(ctx context.Context) (*domain.SiteSettings, error)
	UpdateSettings(ctx context.Context, settings *domain.SiteSettings) (*domain.SiteSettings, error)

	ListProducts(ctx context.Context) ([]domain.CoffeeProduct, error)
	GetProduct(ctx context.Context, id string) (*domain.CoffeeProduct, error)
	CreateProduct(ctx context.Context, product *domain.CoffeeProduct) (*domain.CoffeeProduct, error)
	UpdateProduct(ctx context.Context, product *domain.CoffeeProduct) (*domain.CoffeeProduct, error)
	DeleteProduct(ctx context.Context, id string) error

	ListMedia(ctx context.Context) ([]domain.MediaEmbed, error)
	GetMedia(ctx context.Context, id string) (*domain.MediaEmbed, error)
	CreateMedia(ctx context.Context, media *domain.MediaEmbed) (*domain.MediaEmbed, error)
	UpdateMedia(ctx context.Context, media *domain.MediaEmbed) (*domain.MediaEmbed, error)
	SetMediaVisible(ctx context.Context, id string, visible bool) (*domain.MediaEmbed, error)
	DeleteMedia(ctx context.Context, id string) error

	ListAgenda(ctx context.Context) ([]domain.Agenda, error)
	GetAgenda(ctx context.Context, id string) (*domain.Agenda, error)
	CreateAgenda(ctx context.Context, agenda *domain.Agenda) (*domain.Agenda, error)
	UpdateAgenda(ctx context.Context, agenda *domain.Agenda) (*domain.Agenda, error)
	DeleteAgenda(ctx context.Context, id string) error

	ListGallery(ctx context.Context) ([]domain.GalleryPhoto, error)
	GetGalleryPhoto(ctx context.Context, id string) (*domain.GalleryPhoto, error)
	CreateGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) (*domain.GalleryPhoto, error)
	UpdateGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) (*domain.GalleryPhoto, error)
	DeleteGalleryPhoto(ctx context.Context, id string) error

	PublicHome(ctx context.Context) (*domain.PublicHome, error)
}

// CMSHandler melayani endpoint CMS (admin) dan beranda publik.
type CMSHandler struct {
	useCases CMSUseCases
}

func NewCMSHandler(useCases CMSUseCases) *CMSHandler {
	return &CMSHandler{useCases: useCases}
}

type SiteSettingsRequest struct {
	HeroTitle     string                  `json:"hero_judul"`
	HeroTagline   string                  `json:"hero_slogan"`
	HeroImageKey  string                  `json:"hero_foto_key"`
	WhatsAppPhone string                  `json:"nomor_whatsapp"`
	AboutStory    string                  `json:"about_cerita"`
	AboutValues   []domain.CommunityValue `json:"about_nilai"`
	Address       string                  `json:"alamat"`
	InstagramURL  string                  `json:"instagram_url"`
	YouTubeURL    string                  `json:"youtube_url"`
	FacebookURL   string                  `json:"facebook_url"`
	TikTokURL     string                  `json:"tiktok_url"`
}

type CoffeeProductRequest struct {
	Name     string `json:"nama"`
	Variety  string `json:"varietas"`
	Process  string `json:"proses"`
	ImageKey string `json:"foto_key"`
	Stock    string `json:"status_ketersediaan"`
}

type MediaEmbedRequest struct {
	URL     string `json:"url"`
	Visible *bool  `json:"tampil"`
}

type MediaVisibilityRequest struct {
	Visible bool `json:"tampil"`
}

type AgendaRequest struct {
	Title       string `json:"judul"`
	Date        string `json:"tanggal"`
	Description string `json:"keterangan"`
}

type GalleryPhotoRequest struct {
	ImageKey string `json:"foto_key"`
	Caption  string `json:"keterangan"`
	Order    int    `json:"urutan"`
}

// ---------- Publik ----------

// PublicHome mengembalikan seluruh konten beranda tanpa autentikasi.
func (h *CMSHandler) PublicHome(w http.ResponseWriter, r *http.Request) {
	home, err := h.useCases.PublicHome(r.Context())
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	writeSuccessResponse(w, http.StatusOK, "Konten beranda berhasil diambil", home)
}

// ---------- Upload ----------

// UploadImage menerima multipart (field "file" dan "folder") lalu menyimpan WebP.
func (h *CMSHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, uploadRequestLimit)
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	file, _, err := r.FormFile("file")
	if err != nil {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	defer file.Close()
	uploaded, err := h.useCases.UploadImage(r.Context(), r.FormValue("folder"), file)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Foto berhasil diunggah", uploaded)
}

// ---------- Pengaturan ----------

func (h *CMSHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.useCases.GetSettings(r.Context())
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Pengaturan situs berhasil diambil", settings)
}

func (h *CMSHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var request SiteSettingsRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	updated, err := h.useCases.UpdateSettings(r.Context(), &domain.SiteSettings{
		HeroTitle: request.HeroTitle, HeroTagline: request.HeroTagline, HeroImageKey: request.HeroImageKey,
		WhatsAppPhone: request.WhatsAppPhone, AboutStory: request.AboutStory, AboutValues: request.AboutValues,
		Address: request.Address, InstagramURL: request.InstagramURL, YouTubeURL: request.YouTubeURL,
		FacebookURL: request.FacebookURL, TikTokURL: request.TikTokURL,
	})
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Pengaturan situs berhasil disimpan", updated)
}

// ---------- Produk ----------

func (h *CMSHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	items, err := h.useCases.ListProducts(r.Context())
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar kopi berhasil diambil", items)
}

func (h *CMSHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	item, err := h.useCases.GetProduct(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data kopi berhasil diambil", item)
}

func (h *CMSHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var request CoffeeProductRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	created, err := h.useCases.CreateProduct(r.Context(), productFromRequest("", request))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Kopi berhasil ditambahkan", created)
}

func (h *CMSHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	var request CoffeeProductRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	updated, err := h.useCases.UpdateProduct(r.Context(), productFromRequest(chi.URLParam(r, "id"), request))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data kopi berhasil diperbarui", updated)
}

func (h *CMSHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.DeleteProduct(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func productFromRequest(id string, request CoffeeProductRequest) *domain.CoffeeProduct {
	return &domain.CoffeeProduct{
		ID: id, Name: request.Name, Variety: request.Variety, Process: request.Process,
		ImageKey: request.ImageKey, Stock: request.Stock,
	}
}

// ---------- Media embed ----------

func (h *CMSHandler) ListMedia(w http.ResponseWriter, r *http.Request) {
	items, err := h.useCases.ListMedia(r.Context())
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar media berhasil diambil", items)
}

func (h *CMSHandler) CreateMedia(w http.ResponseWriter, r *http.Request) {
	var request MediaEmbedRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	created, err := h.useCases.CreateMedia(r.Context(), mediaFromRequest("", request))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Media berhasil ditambahkan", created)
}

func (h *CMSHandler) UpdateMedia(w http.ResponseWriter, r *http.Request) {
	var request MediaEmbedRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	updated, err := h.useCases.UpdateMedia(r.Context(), mediaFromRequest(chi.URLParam(r, "id"), request))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Media berhasil diperbarui", updated)
}

// SetMediaVisible menayangkan atau menyembunyikan media tanpa menghapus tautannya.
func (h *CMSHandler) SetMediaVisible(w http.ResponseWriter, r *http.Request) {
	var request MediaVisibilityRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	updated, err := h.useCases.SetMediaVisible(r.Context(), chi.URLParam(r, "id"), request.Visible)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Status tayang media berhasil diubah", updated)
}

func (h *CMSHandler) DeleteMedia(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.DeleteMedia(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func mediaFromRequest(id string, request MediaEmbedRequest) *domain.MediaEmbed {
	visible := true
	if request.Visible != nil {
		visible = *request.Visible
	}
	return &domain.MediaEmbed{ID: id, URL: request.URL, Visible: visible}
}

// ---------- Agenda ----------

func (h *CMSHandler) ListAgenda(w http.ResponseWriter, r *http.Request) {
	items, err := h.useCases.ListAgenda(r.Context())
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar agenda berhasil diambil", items)
}

func (h *CMSHandler) CreateAgenda(w http.ResponseWriter, r *http.Request) {
	var request AgendaRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	created, err := h.useCases.CreateAgenda(r.Context(), &domain.Agenda{
		Title: request.Title, Date: request.Date, Description: request.Description,
	})
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Agenda berhasil ditambahkan", created)
}

func (h *CMSHandler) UpdateAgenda(w http.ResponseWriter, r *http.Request) {
	var request AgendaRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	updated, err := h.useCases.UpdateAgenda(r.Context(), &domain.Agenda{
		ID: chi.URLParam(r, "id"), Title: request.Title, Date: request.Date, Description: request.Description,
	})
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Agenda berhasil diperbarui", updated)
}

func (h *CMSHandler) DeleteAgenda(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.DeleteAgenda(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

// ---------- Galeri ----------

func (h *CMSHandler) ListGallery(w http.ResponseWriter, r *http.Request) {
	items, err := h.useCases.ListGallery(r.Context())
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar foto galeri berhasil diambil", items)
}

func (h *CMSHandler) CreateGalleryPhoto(w http.ResponseWriter, r *http.Request) {
	var request GalleryPhotoRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	created, err := h.useCases.CreateGalleryPhoto(r.Context(), &domain.GalleryPhoto{
		ImageKey: request.ImageKey, Caption: request.Caption, Order: request.Order,
	})
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Foto galeri berhasil ditambahkan", created)
}

func (h *CMSHandler) UpdateGalleryPhoto(w http.ResponseWriter, r *http.Request) {
	var request GalleryPhotoRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	updated, err := h.useCases.UpdateGalleryPhoto(r.Context(), &domain.GalleryPhoto{
		ID: chi.URLParam(r, "id"), ImageKey: request.ImageKey, Caption: request.Caption, Order: request.Order,
	})
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Foto galeri berhasil diperbarui", updated)
}

func (h *CMSHandler) DeleteGalleryPhoto(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.DeleteGalleryPhoto(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

