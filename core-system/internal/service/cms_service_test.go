package service

import (
	"errors"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

func TestParseEmbed(t *testing.T) {
	tests := []struct {
		name, input, wantType, wantID, wantURL string
		wantErr                                bool
	}{
		{"youtube watch", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10", domain.EmbedYouTube, "dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false},
		{"youtube short link", "https://youtu.be/dQw4w9WgXcQ?si=abc", domain.EmbedYouTube, "dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false},
		{"youtube mobile", "https://m.youtube.com/watch?v=dQw4w9WgXcQ", domain.EmbedYouTube, "dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false},
		{"youtube shorts", "youtube.com/shorts/dQw4w9WgXcQ", domain.EmbedYouTube, "dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", false},
		{"instagram post", "https://www.instagram.com/p/Cx1_aBcDeF/?igsh=xyz", domain.EmbedInstagram, "Cx1_aBcDeF", "https://www.instagram.com/p/Cx1_aBcDeF/", false},
		{"instagram reel", "https://instagram.com/reel/Cx1_aBcDeF/", domain.EmbedInstagram, "Cx1_aBcDeF", "https://www.instagram.com/reel/Cx1_aBcDeF/", false},
		{"youtube bad id", "https://www.youtube.com/watch?v=short", "", "", "", true},
		{"instagram profile", "https://www.instagram.com/lembahkopi/", "", "", "", true},
		{"other site", "https://example.com/watch?v=dQw4w9WgXcQ", "", "", "", true},
		{"lookalike host", "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ", "", "", "", true},
		{"script scheme", "javascript:alert(1)", "", "", "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			media := &domain.MediaEmbed{URL: tt.input}
			err := parseEmbed(media)
			if tt.wantErr {
				if !errors.Is(err, domain.ErrInvalid) {
					t.Fatalf("expected ErrInvalid, got %v", err)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if media.Type != tt.wantType || media.ExternalID != tt.wantID || media.URL != tt.wantURL {
				t.Fatalf("got (%s, %s, %s)", media.Type, media.ExternalID, media.URL)
			}
		})
	}
}

func TestNormalizeWhatsApp(t *testing.T) {
	tests := []struct {
		input, want string
		wantErr     bool
	}{
		{"0812-3456-7890", "6281234567890", false},
		{"+62 812 3456 7890", "6281234567890", false},
		{"6281234567890", "6281234567890", false},
		{"", "", false},
		{"0812abc", "", true},
		{"0812", "", true},
	}
	for _, tt := range tests {
		got, err := normalizeWhatsApp(tt.input)
		if (err != nil) != tt.wantErr || got != tt.want {
			t.Errorf("normalizeWhatsApp(%q) = %q, %v", tt.input, got, err)
		}
	}
}

func TestValidateProduct(t *testing.T) {
	valid := func() *domain.CoffeeProduct {
		return &domain.CoffeeProduct{Name: " Arabika Glodogan ", Variety: "arabika", Process: "natural"}
	}
	product := valid()
	if err := validateProduct(product); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if product.Name != "Arabika Glodogan" || product.Variety != "ARABIKA" || product.Stock != domain.StockAvailable {
		t.Fatalf("product not normalized: %+v", product)
	}

	cases := map[string]func(*domain.CoffeeProduct){
		"empty name":      func(p *domain.CoffeeProduct) { p.Name = " " },
		"unknown variety": func(p *domain.CoffeeProduct) { p.Variety = "kopi luwak" },
		"unknown process": func(p *domain.CoffeeProduct) { p.Process = "fermentasi" },
		"unknown stock":   func(p *domain.CoffeeProduct) { p.Stock = "BANYAK" },
		"foreign key":     func(p *domain.CoffeeProduct) { p.ImageKey = "../etc/passwd" },
		"wrong folder":    func(p *domain.CoffeeProduct) { p.ImageKey = "galeri/0123456789abcdef0123456789abcdef.webp" },
	}
	for name, mutate := range cases {
		p := valid()
		mutate(p)
		if err := validateProduct(p); !errors.Is(err, domain.ErrInvalid) {
			t.Errorf("%s: expected ErrInvalid, got %v", name, err)
		}
	}
}

func TestValidateSettingsRequiresThreeValues(t *testing.T) {
	settings := &domain.SiteSettings{HeroTitle: "Lembah Kopi", AboutValues: make([]domain.CommunityValue, 2)}
	if err := validateSettings(settings); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("expected ErrInvalid for 2 values, got %v", err)
	}
	settings.AboutValues = make([]domain.CommunityValue, 3)
	settings.InstagramURL = "javascript:alert(1)"
	if err := validateSettings(settings); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("expected ErrInvalid for bad social URL, got %v", err)
	}
	settings.InstagramURL = "https://instagram.com/lembahkopi"
	if err := validateSettings(settings); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestValidateAgendaDate(t *testing.T) {
	agenda := &domain.Agenda{Title: "Panen Raya", Date: "25-10-2026"}
	if err := validateAgenda(agenda); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("expected ErrInvalid, got %v", err)
	}
	agenda.Date = "2026-10-25"
	if err := validateAgenda(agenda); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestUploadImageUnavailableWithoutStorage(t *testing.T) {
	svc := NewCMSService(nil, nil, nil)
	if _, err := svc.UploadImage(t.Context(), "hero", nil); !errors.Is(err, domain.ErrUnavailable) {
		t.Fatalf("expected ErrUnavailable, got %v", err)
	}
}

