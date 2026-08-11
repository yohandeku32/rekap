import { useState, useEffect } from "react";
import { Users, GraduationCap, Calendar, CheckSquare, Search } from "lucide-react";

// Struktur data siswa yang dikembalikan oleh API
interface Student {
  id: string;
  name: string;
  nisn: string;
  className: string;
  classId: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mengambil data dari TiDB Cloud melalui Vercel Serverless Function
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/students");
        const result = await res.json();
        
        if (result.ok) {
          setStudents(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Gagal menghubungi server");
        console.error("Gagal koneksi ke API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter siswa berdasarkan pencarian
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Sederhana */}
      <div className="w-64 bg-white border-r shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Administrasi</h1>
          <p className="text-sm text-gray-500">SDK Kuaputu</p>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex w-full items-center p-3 rounded-lg text-left transition-colors ${
              activeTab === "dashboard" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`flex w-full items-center p-3 rounded-lg text-left transition-colors ${
              activeTab === "students" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Data Siswa
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex w-full items-center p-3 rounded-lg text-left transition-colors ${
              activeTab === "attendance" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <CheckSquare className="w-5 h-5 mr-3" />
            Absensi
          </button>
        </nav>
      </div>

      {/* Area Utama */}
      <div className="flex-1 overflow-auto p-8">
        {/* Tab Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Ringkasan Sistem</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="p-4 bg-blue-50 rounded-full mr-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Siswa Aktif</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? "..." : students.length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="p-4 bg-green-50 rounded-full mr-4">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Rombel</p>
                  <p className="text-3xl font-bold text-gray-900">6 Kelas</p>
                </div>
              </div>
            </div>
            
            {/* Status Koneksi */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Status Database TiDB</h3>
              {loading ? (
                <p className="text-blue-600">Menyambungkan ke adminkuaputu...</p>
              ) : error ? (
                <p className="text-red-600 font-medium">Error: {error}</p>
              ) : (
                <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Terhubung ke Cluster. Data tersinkronisasi.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Data Siswa */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Daftar Siswa</h2>
              <div className="relative w-64">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Nama Lengkap</th>
                    <th className="p-4 font-semibold text-gray-600">NISN</th>
                    <th className="p-4 font-semibold text-gray-600">Rombel (Kelas)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        Memuat data siswa...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        Tidak ada data siswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-800">{student.name}</td>
                        <td className="p-4 text-gray-500">{student.nisn || "-"}</td>
                        <td className="p-4">
                          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                            {student.className}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Absensi - Sementara */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Rekapitulasi Absensi</h2>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Modul Sedang Dikembangkan</h3>
              <p>Tahap selanjutnya adalah membuat API absensi untuk mencatat dan menyimpan status kehadiran (H/S/I/A) ke TiDB.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
