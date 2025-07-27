import { useState, useEffect } from 'react';

// Fungsi ini dapat didefinisikan di luar hook untuk kejelasan
const getViewportHeight = () => window.innerHeight;

/**
 * Hook yang mengembalikan tinggi viewport saat ini dan diperbarui saat di-resize.
 * Ini lebih andal daripada unit CSS vh/dvh pada browser mobile,
 * terutama saat keyboard virtual ditampilkan/disembunyikan.
 */
export const useViewportHeight = () => {
  // Inisialisasi state dengan tinggi viewport saat ini
  const [height, setHeight] = useState(getViewportHeight());

  useEffect(() => {
    // Handler yang akan dipanggil saat window di-resize
    const handleResize = () => {
      setHeight(getViewportHeight());
    };

    // Tambahkan event listener
    window.addEventListener('resize', handleResize);

    // Panggil handler segera agar state diperbarui dengan ukuran awal
    handleResize();

    // Hapus event listener saat komponen di-unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Array kosong memastikan efek ini hanya berjalan saat mount dan unmount

  return height;
};