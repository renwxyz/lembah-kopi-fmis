package domain

import "errors"

var (
	ErrNotFound     = errors.New("data tidak ditemukan")
	ErrConflict     = errors.New("data berkonflik dengan data yang sudah ada")
	ErrInvalid      = errors.New("data tidak valid")
	ErrUnauthorized = errors.New("autentikasi gagal")
)
