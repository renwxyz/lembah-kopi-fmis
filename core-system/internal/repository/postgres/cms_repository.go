package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"lembah-kopi/core-system/internal/domain"
)

type cmsRepository struct {
	db *sql.DB
}

func NewCMSRepository(db *sql.DB) domain.CMSRepository {
	return &cmsRepository{db: db}
}

// ---------- Pengaturan situs ----------

func (r *cmsRepository) GetSettings(ctx context.Context) (*domain.SiteSettings, error) {
	var (
		settings domain.SiteSettings
		imageKey sql.NullString
		values   []byte
	)
	err := r.db.QueryRowContext(ctx, `
		SELECT hero_judul, hero_slogan, hero_foto_key, nomor_whatsapp, about_cerita, about_nilai,
		       alamat, instagram_url, youtube_url, facebook_url, tiktok_url, updated_at
		FROM cms_pengaturan_situs WHERE id = 1`).Scan(
		&settings.HeroTitle, &settings.HeroTagline, &imageKey, &settings.WhatsAppPhone,
		&settings.AboutStory, &values, &settings.Address, &settings.InstagramURL,
		&settings.YouTubeURL, &settings.FacebookURL, &settings.TikTokURL, &settings.UpdatedAt,
	)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	settings.HeroImageKey = imageKey.String
	if err := json.Unmarshal(values, &settings.AboutValues); err != nil {
		return nil, fmt.Errorf("decode about_nilai: %w", err)
	}
	return &settings, nil
}

func (r *cmsRepository) UpdateSettings(ctx context.Context, settings *domain.SiteSettings) error {
	values, err := json.Marshal(settings.AboutValues)
	if err != nil {
		return fmt.Errorf("encode about_nilai: %w", err)
	}
	result, err := r.db.ExecContext(ctx, `
		UPDATE cms_pengaturan_situs
		SET hero_judul = $1, hero_slogan = $2, hero_foto_key = $3, nomor_whatsapp = $4,
		    about_cerita = $5, about_nilai = $6::jsonb, alamat = $7, instagram_url = $8,
		    youtube_url = $9, facebook_url = $10, tiktok_url = $11, updated_at = CURRENT_TIMESTAMP
		WHERE id = 1`,
		settings.HeroTitle, settings.HeroTagline, optionalText(settings.HeroImageKey),
		settings.WhatsAppPhone, settings.AboutStory, string(values), settings.Address,
		settings.InstagramURL, settings.YouTubeURL, settings.FacebookURL, settings.TikTokURL,
	)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func optionalText(value string) sql.NullString {
	return sql.NullString{String: value, Valid: value != ""}
}

// ---------- Produk kopi ----------

const productColumns = `id_produk, nama, varietas, proses, foto_key, status_ketersediaan, created_at, updated_at`

func scanProduct(row rowScanner) (domain.CoffeeProduct, error) {
	var (
		product  domain.CoffeeProduct
		imageKey sql.NullString
	)
	err := row.Scan(&product.ID, &product.Name, &product.Variety, &product.Process, &imageKey,
		&product.Stock, &product.CreatedAt, &product.UpdatedAt)
	product.ImageKey = imageKey.String
	return product, err
}

func (r *cmsRepository) ListProducts(ctx context.Context) ([]domain.CoffeeProduct, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+productColumns+` FROM cms_produk_kopi ORDER BY created_at DESC, id_produk`)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	products := make([]domain.CoffeeProduct, 0)
	for rows.Next() {
		product, err := scanProduct(rows)
		if err != nil {
			return nil, translateDatabaseError(err)
		}
		products = append(products, product)
	}
	return products, translateDatabaseError(rows.Err())
}

func (r *cmsRepository) GetProduct(ctx context.Context, id string) (*domain.CoffeeProduct, error) {
	product, err := scanProduct(r.db.QueryRowContext(ctx, `SELECT `+productColumns+` FROM cms_produk_kopi WHERE id_produk = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &product, nil
}

func (r *cmsRepository) CreateProduct(ctx context.Context, product *domain.CoffeeProduct) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO cms_produk_kopi (id_produk, nama, varietas, proses, foto_key, status_ketersediaan)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at, updated_at`,
		product.ID, product.Name, product.Variety, product.Process, optionalText(product.ImageKey), product.Stock,
	).Scan(&product.CreatedAt, &product.UpdatedAt)
	return translateDatabaseError(err)
}

func (r *cmsRepository) UpdateProduct(ctx context.Context, product *domain.CoffeeProduct) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE cms_produk_kopi
		SET nama = $1, varietas = $2, proses = $3, foto_key = $4, status_ketersediaan = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id_produk = $6`,
		product.Name, product.Variety, product.Process, optionalText(product.ImageKey), product.Stock, product.ID)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *cmsRepository) DeleteProduct(ctx context.Context, id string) error {
	return r.deleteByID(ctx, `DELETE FROM cms_produk_kopi WHERE id_produk = $1`, id)
}

func (r *cmsRepository) deleteByID(ctx context.Context, query, id string) error {
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

// ---------- Media embed ----------

const mediaColumns = `id_media, tipe, url, external_id, tampil, created_at, updated_at`

func scanMedia(row rowScanner) (domain.MediaEmbed, error) {
	var media domain.MediaEmbed
	err := row.Scan(&media.ID, &media.Type, &media.URL, &media.ExternalID, &media.Visible, &media.CreatedAt, &media.UpdatedAt)
	media.EmbedURL = domain.BuildEmbedURL(media.Type, media.ExternalID)
	return media, err
}

func (r *cmsRepository) ListMedia(ctx context.Context, onlyVisible bool) ([]domain.MediaEmbed, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT `+mediaColumns+` FROM cms_media_embed
		WHERE ($1::boolean = FALSE OR tampil = TRUE)
		ORDER BY created_at DESC, id_media`, onlyVisible)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.MediaEmbed, 0)
	for rows.Next() {
		media, err := scanMedia(rows)
		if err != nil {
			return nil, translateDatabaseError(err)
		}
		items = append(items, media)
	}
	return items, translateDatabaseError(rows.Err())
}

func (r *cmsRepository) GetMedia(ctx context.Context, id string) (*domain.MediaEmbed, error) {
	media, err := scanMedia(r.db.QueryRowContext(ctx, `SELECT `+mediaColumns+` FROM cms_media_embed WHERE id_media = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &media, nil
}

func (r *cmsRepository) CreateMedia(ctx context.Context, media *domain.MediaEmbed) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO cms_media_embed (id_media, tipe, url, external_id, tampil)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at`,
		media.ID, media.Type, media.URL, media.ExternalID, media.Visible,
	).Scan(&media.CreatedAt, &media.UpdatedAt)
	media.EmbedURL = domain.BuildEmbedURL(media.Type, media.ExternalID)
	return translateDatabaseError(err)
}

func (r *cmsRepository) UpdateMedia(ctx context.Context, media *domain.MediaEmbed) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE cms_media_embed
		SET tipe = $1, url = $2, external_id = $3, tampil = $4, updated_at = CURRENT_TIMESTAMP
		WHERE id_media = $5`,
		media.Type, media.URL, media.ExternalID, media.Visible, media.ID)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *cmsRepository) SetMediaVisible(ctx context.Context, id string, visible bool) (*domain.MediaEmbed, error) {
	media, err := scanMedia(r.db.QueryRowContext(ctx, `
		UPDATE cms_media_embed SET tampil = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id_media = $2
		RETURNING `+mediaColumns, visible, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &media, nil
}

func (r *cmsRepository) DeleteMedia(ctx context.Context, id string) error {
	return r.deleteByID(ctx, `DELETE FROM cms_media_embed WHERE id_media = $1`, id)
}

// ---------- Agenda ----------

const agendaColumns = `id_agenda, to_char(tanggal, 'YYYY-MM-DD'), judul, keterangan, created_at, updated_at`

func scanAgenda(row rowScanner) (domain.Agenda, error) {
	var agenda domain.Agenda
	err := row.Scan(&agenda.ID, &agenda.Date, &agenda.Title, &agenda.Description, &agenda.CreatedAt, &agenda.UpdatedAt)
	return agenda, err
}

func (r *cmsRepository) ListAgenda(ctx context.Context, upcomingLimit int) ([]domain.Agenda, error) {
	query := `SELECT ` + agendaColumns + ` FROM cms_agenda ORDER BY tanggal DESC, id_agenda`
	args := []any{}
	if upcomingLimit > 0 {
		query = `SELECT ` + agendaColumns + ` FROM cms_agenda
			WHERE tanggal >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date
			ORDER BY tanggal ASC, id_agenda LIMIT $1`
		args = append(args, upcomingLimit)
	}
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.Agenda, 0)
	for rows.Next() {
		agenda, err := scanAgenda(rows)
		if err != nil {
			return nil, translateDatabaseError(err)
		}
		items = append(items, agenda)
	}
	return items, translateDatabaseError(rows.Err())
}

func (r *cmsRepository) GetAgenda(ctx context.Context, id string) (*domain.Agenda, error) {
	agenda, err := scanAgenda(r.db.QueryRowContext(ctx, `SELECT `+agendaColumns+` FROM cms_agenda WHERE id_agenda = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &agenda, nil
}

func (r *cmsRepository) CreateAgenda(ctx context.Context, agenda *domain.Agenda) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO cms_agenda (id_agenda, judul, tanggal, keterangan)
		VALUES ($1, $2, $3::date, $4)
		RETURNING created_at, updated_at`,
		agenda.ID, agenda.Title, agenda.Date, agenda.Description,
	).Scan(&agenda.CreatedAt, &agenda.UpdatedAt)
	return translateDatabaseError(err)
}

func (r *cmsRepository) UpdateAgenda(ctx context.Context, agenda *domain.Agenda) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE cms_agenda SET judul = $1, tanggal = $2::date, keterangan = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id_agenda = $4`,
		agenda.Title, agenda.Date, agenda.Description, agenda.ID)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *cmsRepository) DeleteAgenda(ctx context.Context, id string) error {
	return r.deleteByID(ctx, `DELETE FROM cms_agenda WHERE id_agenda = $1`, id)
}

// ---------- Galeri ----------

const galleryColumns = `id_foto, foto_key, keterangan, urutan, created_at, updated_at`

func scanGalleryPhoto(row rowScanner) (domain.GalleryPhoto, error) {
	var photo domain.GalleryPhoto
	err := row.Scan(&photo.ID, &photo.ImageKey, &photo.Caption, &photo.Order, &photo.CreatedAt, &photo.UpdatedAt)
	return photo, err
}

func (r *cmsRepository) ListGallery(ctx context.Context, limit int) ([]domain.GalleryPhoto, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT `+galleryColumns+` FROM cms_galeri
		ORDER BY urutan ASC, created_at DESC, id_foto
		LIMIT CASE WHEN $1 > 0 THEN $1 END`, limit)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.GalleryPhoto, 0)
	for rows.Next() {
		photo, err := scanGalleryPhoto(rows)
		if err != nil {
			return nil, translateDatabaseError(err)
		}
		items = append(items, photo)
	}
	return items, translateDatabaseError(rows.Err())
}

func (r *cmsRepository) GetGalleryPhoto(ctx context.Context, id string) (*domain.GalleryPhoto, error) {
	photo, err := scanGalleryPhoto(r.db.QueryRowContext(ctx, `SELECT `+galleryColumns+` FROM cms_galeri WHERE id_foto = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &photo, nil
}

func (r *cmsRepository) CreateGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO cms_galeri (id_foto, foto_key, keterangan, urutan)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at, updated_at`,
		photo.ID, photo.ImageKey, photo.Caption, photo.Order,
	).Scan(&photo.CreatedAt, &photo.UpdatedAt)
	return translateDatabaseError(err)
}

func (r *cmsRepository) UpdateGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE cms_galeri SET foto_key = $1, keterangan = $2, urutan = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id_foto = $4`,
		photo.ImageKey, photo.Caption, photo.Order, photo.ID)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *cmsRepository) DeleteGalleryPhoto(ctx context.Context, id string) error {
	return r.deleteByID(ctx, `DELETE FROM cms_galeri WHERE id_foto = $1`, id)
}
