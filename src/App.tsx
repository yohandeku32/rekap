\import { useMemo, useState, useEffect } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardCheck,
  FileBarChart,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

type Status = "Hadir" | "Sakit" | "Izin" | "Alpa";

// Menyesuaikan dengan struktur data dari API TiDB
type Student = {
  id: number;
  nis: string;
  name: string;
  gender: "L" | "P";
  status: Status;
  note: string;
  className: string;
  classId: string;
};

// Data default sementara saat memuat atau jika API error
const classAttendance = [
  ["Kelas 1", 0],
  ["Kelas 2", 0],
  ["Kelas 3", 0],
  ["Kelas 4", 0],
  ["Kelas 5", 0],
  ["Kelas 6", 0],
];

const activities = [
  { type: "success", title: "Menghubungkan Database", by: "Sistem", time: "Baru saja" },
];

function App() {
  const [page, setPage] = useState<"dashboard" | "attendance">("dashboard");
  const [selectedClass, setSelectedClass] = useState("Kelas 4");
  const [date, setDate] = useState("11 Agustus 2026");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // MENGAMBIL DATA DARI DATABASE (TiDB via Vercel API)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/students");
        const result = await res.json();
        
        if (result.ok) {
          // Mapping data dari DB ke format yang dibutuhkan UI (dengan status default "Hadir")
          const formattedData = result.data.map((item: any) => ({
            id: Number(item.id),
            nis: item.nisn || "-",
            name: item.name,
            gender: "L", // Catatan: API saat ini belum mengirim gender, gunakan "L" sementara
            status: "Hadir" as Status, 
            note: "",
            className: item.className,
            classId: item.classId
          }));
          setStudents(formattedData);
        } else {
          console.error("Gagal mengambil data:", result.error);
        }
      } catch (error) {
        console.error("Koneksi ke API terputus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter siswa berdasarkan kelas yang dipilih
  const studentsInSelectedClass = useMemo(() => {
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);

  const summary = useMemo(() => {
    const counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 } as Record<Status, number>;
    // Hitung seluruh siswa untuk ringkasan dashboard, atau siswa kelas tertentu untuk halaman absensi
    const sourceData = page === "dashboard" ? students : studentsInSelectedClass;
    
    if (sourceData.length === 0) {
        return { total: 0, Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0, percentage: 0 };
    }

    sourceData.forEach((s) => counts[s.status]++);
    return {
      ...counts,
      total: sourceData.length,
      percentage: Math.round((counts.Hadir / sourceData.length) * 1000) / 10,
    };
  }, [students, studentsInSelectedClass, page]);

  const setStatus = (id: number, status: Status) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === id ? { ...student, status } : student
      )
    );
    setSaved(false);
  };

  const setNote = (id: number, note: string) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === id ? { ...student, note } : student
      )
    );
    setSaved(false);
  };

  const saveAttendance = () => {
    // Nanti akan dihubungkan ke API POST/PUT untuk menyimpan absensi ke TiDB
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />

      {sidebarOpen && (
        <button className="mobile-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
            <Menu size={21} />
          </button>

          <div className="topbar-spacer" />

          <div className="top-filter">
            <CalendarDays size={18} />
            <div>
              <span>Tahun Ajaran</span>
              <strong>2026/2027</strong>
            </div>
            <ChevronDown size={15} />
          </div>

          <div className="top-filter">
            <CalendarDays size={18} />
            <div>
              <span>Bulan</span>
              <strong>Agustus 2026</strong>
            </div>
            <ChevronDown size={15} />
          </div>

          <button className="icon-button notification" aria-label="Notifikasi">
            <Bell size={20} />
            <i />
          </button>
        </header>

        {page === "dashboard" ? (
          <Dashboard
            goToAttendance={() => setPage("attendance")}
            summary={summary}
            loading={loading}
          />
        ) : (
          <Attendance
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            date={date}
            setDate={setDate}
            students={studentsInSelectedClass}
            summary={summary}
            setStatus={setStatus}
            setNote={setNote}
            saveAttendance={saveAttendance}
            saved={saved}
            goBack={() => setPage("dashboard")}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}

// Komponen Sidebar tetap sama
function Sidebar({ page, setPage, open, close, selectedClass, setSelectedClass, }: {
  page: "dashboard" | "attendance";
  setPage: (page: "dashboard" | "attendance") => void;
  open: boolean;
  close: () => void;
  selectedClass: string;
  setSelectedClass: (value: string) => void;
}) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="school-logo">
          <ShieldCheck size={27} />
        </div>
        <div>
          <strong>ADMINISTRASI SEKOLAH</strong>
          <span>SDK St. Yoseph Kuaputu</span>
        </div>
        <button className="close-sidebar" onClick={close}>
          <X size={19} />
        </button>
      </div>

      <nav className="nav">
        <button
          className={`nav-item ${page === "dashboard" ? "active" : ""}`}
          onClick={() => {
            setPage("dashboard");
            close();
          }}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>

        <div className={`nav-group ${page === "attendance" ? "expanded" : ""}`}>
          <button
            className={`nav-item ${page === "attendance" ? "active" : ""}`}
            onClick={() => {
              setPage("attendance");
              close();
            }}
          >
            <ClipboardCheck size={19} />
            <span>Absensi</span>
            <ChevronDown className="nav-chevron" size={16} />
          </button>

          <div className="subnav">
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                className={selectedClass === `Kelas ${grade}` ? "selected" : ""}
                onClick={() => {
                  setSelectedClass(`Kelas ${grade}`);
                  setPage("attendance");
                  close();
                }}
              >
                <span className="subnav-dot" />
                Kelas {grade}
              </button>
            ))}
          </div>
        </div>

        <button className="nav-item" onClick={() => close()}>
          <Users size={19} />
          <span>Data Siswa</span>
        </button>

        <button className="nav-item" onClick={() => close()}>
          <FileBarChart size={19} />
          <span>Rekap & Laporan</span>
          <ChevronDown className="nav-chevron" size={16} />
        </button>

        <button className="nav-item" onClick={() => close()}>
          <Settings size={19} />
          <span>Pengaturan</span>
          <ChevronDown className="nav-chevron" size={16} />
        </button>
      </nav>

      <div className="profile">
        <div className="avatar"><UserRound size={20} /></div>
        <div className="profile-text">
          <strong>Yohan Deku</strong>
          <span>Administrator</span>
        </div>
        <ChevronDown size={16} />
      </div>
    </aside>
  );
}

// Komponen Dashboard dengan indikator loading
function Dashboard({ goToAttendance, summary, loading }: {
  goToAttendance: () => void;
  summary: { total: number; Hadir: number; Sakit: number; Izin: number; Alpa: number; percentage: number };
  loading: boolean;
}) {
  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <div className="title-row">
            <LayoutDashboard size={27} />
            <h1>Dashboard</h1>
          </div>
          <p>Selamat datang, Yohan Deku <span className="wave">👋</span></p>
          <small>Berikut ringkasan kehadiran siswa hari ini.</small>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={<Users />} value={loading ? "..." : summary.total.toString()} label="Total Siswa" detail="6 Kelas" tone="blue" />
        <StatCard icon={<Check />} value={loading ? "..." : summary.Hadir.toString()} label="Hadir Hari Ini" detail={`${summary.percentage}%`} tone="green" />
        <StatCard icon={<HeartPulse />} value={loading ? "..." : summary.Sakit.toString()} label="Sakit" detail="" tone="orange" />
        <StatCard icon={<BookOpen />} value={loading ? "..." : summary.Izin.toString()} label="Izin" detail="" tone="purple" />
        <StatCard icon={<XCircle />} value={loading ? "..." : summary.Alpa.toString()} label="Alpa" detail="" tone="red" />
      </div>

      <div className="dashboard-grid">
        <section className="panel attendance-overview">
          <div className="panel-title">
            <div>
              <h2>Persentase Kehadiran Hari Ini</h2>
              <span>Semua kelas</span>
            </div>
            <button className="more-button"><MoreHorizontal size={19} /></button>
          </div>

          <div className="donut-layout">
            <div
              className="donut"
              style={{
                background: `conic-gradient(#2dbb79 ${summary.percentage}%, #e9eef3 0)`,
              }}
            >
              <div className="donut-inner">
                <strong>{loading ? "..." : `${summary.percentage}%`}</strong>
                <span>Kehadiran</span>
              </div>
            </div>

            <div className="legend">
              <LegendRow dot="green" label="Hadir" value={summary.Hadir.toString()} percentage={`${summary.percentage}%`} />
              <LegendRow dot="orange" label="Sakit" value={summary.Sakit.toString()} percentage="" />
              <LegendRow dot="purple" label="Izin" value={summary.Izin.toString()} percentage="" />
              <LegendRow dot="red" label="Alpa" value={summary.Alpa.toString()} percentage="" />
              <div className="legend-total">
                <strong>Total</strong>
                <strong>{loading ? "..." : summary.total.toString()}</strong>
                <strong>100%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="panel class-overview">
          <div className="panel-title">
            <div>
              <h2>Kehadiran per Kelas</h2>
              <span>Persentase siswa hadir (Data sedang disusun)</span>
            </div>
          </div>
          <div className="class-bars">
            {classAttendance.map(([name, value]) => (
              <div className="class-bar" key={name}>
                <span>{name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${value}%` }} />
                </div>
                <strong>{value}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-title">
            <div>
              <h2>Aktivitas Terbaru</h2>
              <span>Sistem Database</span>
            </div>
            <button className="more-button"><MoreHorizontal size={19} /></button>
          </div>
          <div className="activity-list">
            {activities.map((item, index) => (
              <button className="activity-item" key={index} onClick={item.title.startsWith("Absensi") ? goToAttendance : undefined}>
                <div className={`activity-icon ${item.type}`}>
                  {item.type === "success" && <Check size={15} />}
                  {item.type === "izin" && <BookOpen size={15} />}
                  {item.type === "sakit" && <HeartPulse size={15} />}
                  {item.type === "alpa" && <X size={15} />}
                </div>
                <div className="activity-copy">
                  <strong>{item.title}</strong>
                  <span>{item.by}</span>
                </div>
                <time>{item.time}</time>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, detail, tone }: { icon: React.ReactNode; value: string; label: string; detail: string; tone: string; }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function LegendRow({ dot, label, value, percentage }: { dot: string; label: string; value: string; percentage: string; }) {
  return (
    <div className="legend-row">
      <span className={`legend-dot ${dot}`} />
      <span>{label}</span>
      <strong>{value}</strong>
      <span>{percentage}</span>
    </div>
  );
}

// Komponen Attendance (Absensi)
function Attendance({ selectedClass, setSelectedClass, date, setDate, students, summary, setStatus, setNote, saveAttendance, saved, goBack, loading }: {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  students: Student[];
  summary: { total: number; Hadir: number; Sakit: number; Izin: number; Alpa: number; percentage: number };
  setStatus: (id: number, status: Status) => void;
  setNote: (id: number, note: string) => void;
  saveAttendance: () => void;
  saved: boolean;
  goBack: () => void;
  loading: boolean;
}) {
  return (
    <section className="content attendance-page">
      <div className="page-heading attendance-heading">
        <div>
          <div className="title-row">
            <ClipboardCheck size={27} />
            <h1>Absensi</h1>
          </div>
          <p>Kelola absensi siswa per hari</p>
        </div>

        <div className="attendance-actions">
          <SelectBox icon={<CalendarDays size={17} />} label="Tanggal" value={date} onChange={setDate} />
          <SelectBox icon={<GraduationCap size={17} />} label="Kelas" value={selectedClass} onChange={setSelectedClass} options={["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"]} />
          <button className="save-button" onClick={saveAttendance}>
            {saved ? <Check size={17} /> : <ClipboardCheck size={17} />}
            {saved ? "Tersimpan" : "Simpan Absensi"}
          </button>
        </div>
      </div>

      <div className="breadcrumb">
        <button onClick={goBack}>Absensi</button>
        <ChevronLeft size={13} />
        <span>{selectedClass}</span>
      </div>

      <div className="attendance-summary">
        <SummaryItem label="Jumlah Siswa" value={loading ? "..." : summary.total.toString()} />
        <SummaryItem label="Hadir" value={loading ? "..." : summary.Hadir.toString()} percent={summary.total > 0 ? `${((summary.Hadir / summary.total) * 100).toFixed(1)}%` : "0%"} tone="green" />
        <SummaryItem label="Sakit" value={loading ? "..." : summary.Sakit.toString()} percent={summary.total > 0 ? `${((summary.Sakit / summary.total) * 100).toFixed(1)}%` : "0%"} tone="orange" />
        <SummaryItem label="Izin" value={loading ? "..." : summary.Izin.toString()} percent={summary.total > 0 ? `${((summary.Izin / summary.total) * 100).toFixed(1)}%` : "0%"} tone="purple" />
        <SummaryItem label="Alpa" value={loading ? "..." : summary.Alpa.toString()} percent={summary.total > 0 ? `${((summary.Alpa / summary.total) * 100).toFixed(1)}%` : "0%"} tone="red" />
      </div>

      <div className="attendance-table-wrap">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>No</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>JK</th>
              <th>Status Kehadiran</th>
              <th>Catatan</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr>
                    <td colSpan={7} style={{textAlign: "center", padding: "2rem"}}>Memuat data dari database TiDB...</td>
                </tr>
            ) : students.length === 0 ? (
                <tr>
                    <td colSpan={7} style={{textAlign: "center", padding: "2rem"}}>Belum ada data siswa untuk {selectedClass}.</td>
                </tr>
            ) : (
                students.map((student, index) => (
                <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td className="nis">{student.nis}</td>
                    <td className="student-name">{student.name}</td>
                    <td>{student.gender}</td>
                    <td>
                    <div className="status-buttons">
                        {(["Hadir", "Sakit", "Izin", "Alpa"] as Status[]).map((status) => (
                        <button
                            key={status}
                            className={`${student.status === status ? "selected " : ""}${status.toLowerCase()}`}
                            onClick={() => setStatus(student.id, status)}
                        >
                            {status}
                        </button>
                        ))}
                    </div>
                    </td>
                    <td>
                    <input
                        className="note-input"
                        value={student.note}
                        onChange={(event) => setNote(student.id, event.target.value)}
                        placeholder="Catatan"
                    />
                    </td>
                    <td><button className="row-edit" aria-label={`Edit ${student.name}`}><Pencil size={15} /></button></td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SummaryItem({ label, value, percent, tone }: { label: string; value: string; percent?: string; tone?: string; }) {
  return (
    <div className={`summary-item ${tone ?? ""}`}>
      <span>{label}</span>
      <div>
        <strong>{value}</strong>
        {percent && <small>{percent}</small>}
      </div>
    </div>
  );
}

function SelectBox({ icon, label, value, onChange, options }: { icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void; options?: string[]; }) {
  return (
    <label className="select-box">
      {icon}
      <span>
        <small>{label}</small>
        {options ? (
          <select value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : (
          <strong>{value}</strong>
        )}
      </span>
      {!options && <ChevronDown size={15} />}
    </label>
  );
}

export default App;
