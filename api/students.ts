import { connect } from "@tidbcloud/serverless";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        { ok: false, error: "DATABASE_URL belum tersedia" },
        { status: 500 }
      );
    }

    const conn = connect({ url: process.env.DATABASE_URL });

    // Menggunakan JOIN untuk mengambil nama siswa beserta nama kelasnya
    const result = await conn.execute(`
      SELECT 
        s.id, 
        s.name, 
        s.nisn, 
        c.name AS class_name,
        c.id AS class_id
      FROM students s
      JOIN student_class_history h ON s.id = h.student_id
      JOIN classrooms c ON h.classroom_id = c.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      WHERE ay.name = '2026/2027'
      ORDER BY c.grade_level ASC, s.name ASC
    `);

    const students = result.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      nisn: row.nisn,
      className: row.class_name,
      classId: row.class_id.toString(),
    }));

    return Response.json({ ok: true, total: students.length, data: students });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, error: "Gagal mengambil data siswa dari database" },
      { status: 500 }
    );
  }
}
