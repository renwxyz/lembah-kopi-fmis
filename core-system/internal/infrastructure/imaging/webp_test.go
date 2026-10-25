package imaging

import (
	"bytes"
	"context"
	"errors"
	"image"
	"image/color"
	"image/jpeg"
	"os/exec"
	"strings"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

// jpegWithOrientation membuat JPEG kecil lalu menyisipkan segmen APP1 EXIF.
func jpegWithOrientation(t *testing.T, w, h, orientation int, bigEndian bool) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	var encoded bytes.Buffer
	if err := jpeg.Encode(&encoded, img, nil); err != nil {
		t.Fatal(err)
	}
	u16 := func(v int) []byte {
		if bigEndian {
			return []byte{byte(v >> 8), byte(v)}
		}
		return []byte{byte(v), byte(v >> 8)}
	}
	tiff := []byte("II")
	if bigEndian {
		tiff = []byte("MM")
	}
	tiff = append(tiff, u16(42)...)
	if bigEndian {
		tiff = append(tiff, 0, 0, 0, 8)
	} else {
		tiff = append(tiff, 8, 0, 0, 0)
	}
	tiff = append(tiff, u16(1)...)           // jumlah entry
	tiff = append(tiff, u16(0x0112)...)      // tag orientation
	tiff = append(tiff, u16(3)...)           // tipe SHORT
	tiff = append(tiff, 1, 0, 0, 0)          // count (urutan tidak berpengaruh untuk 1 di LE; cukup untuk uji)
	tiff = append(tiff, u16(orientation)...) // nilai
	tiff = append(tiff, 0, 0, 0, 0)          // next IFD
	segment := append([]byte("Exif\x00\x00"), tiff...)
	length := len(segment) + 2
	app1 := append([]byte{0xFF, 0xE1, byte(length >> 8), byte(length)}, segment...)
	data := encoded.Bytes()
	return append(append(append([]byte{}, data[:2]...), app1...), data[2:]...)
}

func TestJPEGOrientation(t *testing.T) {
	for _, bigEndian := range []bool{false, true} {
		for orientation := 1; orientation <= 8; orientation++ {
			data := jpegWithOrientation(t, 4, 2, orientation, bigEndian)
			if got := jpegOrientation(data); got != orientation {
				t.Errorf("bigEndian=%v want %d got %d", bigEndian, orientation, got)
			}
		}
	}
	plain := new(bytes.Buffer)
	_ = jpeg.Encode(plain, image.NewRGBA(image.Rect(0, 0, 2, 2)), nil)
	if got := jpegOrientation(plain.Bytes()); got != 1 {
		t.Errorf("jpeg without exif: want 1 got %d", got)
	}
	if got := jpegOrientation([]byte("bukan jpeg")); got != 1 {
		t.Errorf("garbage: want 1 got %d", got)
	}
}

func TestApplyOrientationRotate90(t *testing.T) {
	source := image.NewNRGBA(image.Rect(0, 0, 3, 2))
	red := color.NRGBA{R: 255, A: 255}
	source.Set(0, 0, red) // pojok kiri atas
	// Orientasi 6 = putar 90° searah jarum jam: kiri atas menjadi kanan atas.
	rotated := applyOrientation(source, 6)
	if rotated.Bounds().Dx() != 2 || rotated.Bounds().Dy() != 3 {
		t.Fatalf("unexpected size %v", rotated.Bounds())
	}
	if got := color.NRGBAModel.Convert(rotated.At(1, 0)); got != red {
		t.Fatalf("pixel not moved to top-right, got %v", got)
	}
}

func TestToWebPRejectsInvalidInput(t *testing.T) {
	processor := NewWebPProcessor("cwebp", 1600, 80)
	for name, input := range map[string]string{
		"text file": "halo ini bukan gambar",
		"empty":     "",
		"gif-like":  "GIF89a" + strings.Repeat("x", 20),
	} {
		_, err := processor.ToWebP(context.Background(), strings.NewReader(input))
		if !errors.Is(err, domain.ErrInvalid) {
			t.Errorf("%s: expected ErrInvalid, got %v", name, err)
		}
	}
	tooBig := strings.NewReader(strings.Repeat("a", MaxUploadBytes+10))
	if _, err := processor.ToWebP(context.Background(), tooBig); !errors.Is(err, domain.ErrInvalid) {
		t.Errorf("oversize: expected ErrInvalid, got %v", err)
	}
}

func TestToWebPEncodesWhenCwebpAvailable(t *testing.T) {
	if _, err := exec.LookPath("cwebp"); err != nil {
		t.Skip("cwebp tidak terpasang")
	}
	processor := NewWebPProcessor("cwebp", 100, 80)
	data := jpegWithOrientation(t, 400, 200, 6, false)
	out, err := processor.ToWebP(context.Background(), bytes.NewReader(data))
	if err != nil {
		t.Fatal(err)
	}
	if len(out) < 12 || string(out[:4]) != "RIFF" || string(out[8:12]) != "WEBP" {
		t.Fatal("output is not WebP")
	}
}
