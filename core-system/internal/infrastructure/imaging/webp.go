// Package imaging mengonversi foto unggahan (JPEG/PNG) menjadi WebP terkompresi.
package imaging

import (
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"os/exec"
	"strconv"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

const (
	// MaxUploadBytes adalah ukuran maksimum file unggahan mentah.
	MaxUploadBytes = 10 << 20
	maxPixels      = 50_000_000
	encodeTimeout  = 30 * time.Second
)

// WebPProcessor memakai biner cwebp (paket libwebp-tools / webp) untuk encoding.
// Orientasi EXIF dikoreksi terlebih dulu karena foto kamera ponsel sering disimpan
// miring dan cwebp tidak memutarnya otomatis.
type WebPProcessor struct {
	binary       string
	maxDimension int
	quality      int
}

// NewWebPProcessor membuat processor; maxDimension membatasi sisi terpanjang
// (piksel) dan quality bernilai 0-100.
func NewWebPProcessor(binary string, maxDimension, quality int) *WebPProcessor {
	if binary == "" {
		binary = "cwebp"
	}
	return &WebPProcessor{binary: binary, maxDimension: maxDimension, quality: quality}
}

// Available melaporkan apakah biner cwebp ditemukan di PATH.
func (p *WebPProcessor) Available() error {
	if _, err := exec.LookPath(p.binary); err != nil {
		return fmt.Errorf("%s tidak ditemukan: %w", p.binary, err)
	}
	return nil
}

func (p *WebPProcessor) ToWebP(ctx context.Context, source io.Reader) ([]byte, error) {
	raw, err := io.ReadAll(io.LimitReader(source, MaxUploadBytes+1))
	if err != nil {
		return nil, fmt.Errorf("%w: gagal membaca file", domain.ErrInvalid)
	}
	if len(raw) > MaxUploadBytes {
		return nil, fmt.Errorf("%w: ukuran foto maksimal %d MB", domain.ErrInvalid, MaxUploadBytes>>20)
	}
	config, format, err := image.DecodeConfig(bytes.NewReader(raw))
	if err != nil || (format != "jpeg" && format != "png") {
		return nil, fmt.Errorf("%w: file harus berupa foto JPG atau PNG", domain.ErrInvalid)
	}
	if config.Width <= 0 || config.Height <= 0 || config.Width*config.Height > maxPixels {
		return nil, fmt.Errorf("%w: resolusi foto terlalu besar", domain.ErrInvalid)
	}

	input, width, height := raw, config.Width, config.Height
	if format == "jpeg" {
		if orientation := jpegOrientation(raw); orientation > 1 {
			rotated, err := rotateJPEG(raw, orientation)
			if err != nil {
				return nil, err
			}
			input = rotated
			if orientation >= 5 {
				width, height = height, width
			}
		}
	}
	return p.encode(ctx, input, width, height)
}

func (p *WebPProcessor) encode(ctx context.Context, input []byte, width, height int) ([]byte, error) {
	args := []string{"-quiet", "-q", strconv.Itoa(p.quality), "-metadata", "none", "-mt"}
	if p.maxDimension > 0 && (width > p.maxDimension || height > p.maxDimension) {
		if width >= height {
			args = append(args, "-resize", strconv.Itoa(p.maxDimension), "0")
		} else {
			args = append(args, "-resize", "0", strconv.Itoa(p.maxDimension))
		}
	}
	args = append(args, "-o", "-", "--", "-")

	ctx, cancel := context.WithTimeout(ctx, encodeTimeout)
	defer cancel()
	command := exec.CommandContext(ctx, p.binary, args...)
	command.Stdin = bytes.NewReader(input)
	var output, stderr bytes.Buffer
	command.Stdout = &output
	command.Stderr = &stderr
	if err := command.Run(); err != nil {
		var notFound *exec.Error
		if errors.As(err, &notFound) {
			return nil, fmt.Errorf("%w: %s belum terpasang di server", domain.ErrUnavailable, p.binary)
		}
		return nil, fmt.Errorf("encode webp: %w: %s", err, stderr.String())
	}
	if output.Len() == 0 {
		return nil, fmt.Errorf("encode webp: output kosong")
	}
	return output.Bytes(), nil
}

// rotateJPEG menerapkan orientasi EXIF lalu mengembalikan PNG (lossless, cepat)
// yang siap diumpankan ke cwebp.
func rotateJPEG(raw []byte, orientation int) ([]byte, error) {
	decoded, err := jpeg.Decode(bytes.NewReader(raw))
	if err != nil {
		return nil, fmt.Errorf("%w: file JPG rusak", domain.ErrInvalid)
	}
	var buffer bytes.Buffer
	encoder := png.Encoder{CompressionLevel: png.BestSpeed}
	if err := encoder.Encode(&buffer, applyOrientation(decoded, orientation)); err != nil {
		return nil, fmt.Errorf("encode rotated image: %w", err)
	}
	return buffer.Bytes(), nil
}

// applyOrientation memutar/membalik gambar sesuai nilai orientasi EXIF 1-8.
func applyOrientation(source image.Image, orientation int) image.Image {
	bounds := source.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	outW, outH := w, h
	if orientation >= 5 {
		outW, outH = h, w
	}
	target := image.NewNRGBA(image.Rect(0, 0, outW, outH))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			var dx, dy int
			switch orientation {
			case 2:
				dx, dy = w-1-x, y
			case 3:
				dx, dy = w-1-x, h-1-y
			case 4:
				dx, dy = x, h-1-y
			case 5:
				dx, dy = y, x
			case 6:
				dx, dy = h-1-y, x
			case 7:
				dx, dy = h-1-y, w-1-x
			case 8:
				dx, dy = y, w-1-x
			default:
				dx, dy = x, y
			}
			target.Set(dx, dy, source.At(bounds.Min.X+x, bounds.Min.Y+y))
		}
	}
	return target
}

// jpegOrientation membaca tag orientasi EXIF (1-8); mengembalikan 1 bila tidak ada.
func jpegOrientation(data []byte) int {
	if len(data) < 4 || data[0] != 0xFF || data[1] != 0xD8 {
		return 1
	}
	pos := 2
	for pos+4 <= len(data) {
		if data[pos] != 0xFF {
			return 1
		}
		marker := data[pos+1]
		if marker == 0xD8 || marker == 0x01 || (marker >= 0xD0 && marker <= 0xD7) {
			pos += 2
			continue
		}
		if marker == 0xDA || marker == 0xD9 {
			return 1
		}
		length := int(data[pos+2])<<8 | int(data[pos+3])
		if length < 2 || pos+2+length > len(data) {
			return 1
		}
		if marker == 0xE1 {
			segment := data[pos+4 : pos+2+length]
			if orientation := exifOrientation(segment); orientation != 0 {
				return orientation
			}
		}
		pos += 2 + length
	}
	return 1
}

func exifOrientation(segment []byte) int {
	if len(segment) < 14 || string(segment[:6]) != "Exif\x00\x00" {
		return 0
	}
	tiff := segment[6:]
	var order binary.ByteOrder
	switch string(tiff[:2]) {
	case "II":
		order = binary.LittleEndian
	case "MM":
		order = binary.BigEndian
	default:
		return 0
	}
	offset := int(order.Uint32(tiff[4:8]))
	if offset < 8 || offset+2 > len(tiff) {
		return 0
	}
	entries := int(order.Uint16(tiff[offset : offset+2]))
	for i := 0; i < entries; i++ {
		entry := offset + 2 + i*12
		if entry+12 > len(tiff) {
			return 0
		}
		if order.Uint16(tiff[entry:entry+2]) == 0x0112 {
			value := int(order.Uint16(tiff[entry+8 : entry+10]))
			if value >= 1 && value <= 8 {
				return value
			}
			return 0
		}
	}
	return 0
}
