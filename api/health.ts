import { connect } from "@tidbcloud/serverless";

export default async function handler() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        {
          ok: false,
          error: "DATABASE_URL belum tersedia",
        },
        { status: 500 }
      );
    }

    const conn = connect({
      url: process.env.DATABASE_URL,
    });

    const result = await conn.execute(`
      SELECT
        COUNT(*) AS total_siswa
      FROM students
    `);

    return Response.json({
      ok: true,
      database: "connected",
      total_siswa: result[0]?.total_siswa ?? 0,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        ok: false,
        database: "error",
        error: "Gagal terhubung ke database",
      },
      { status: 500 }
    );
  }
}
